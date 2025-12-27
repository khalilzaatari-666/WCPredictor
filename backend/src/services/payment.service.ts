import { stripe, STRIPE_CONFIG } from '../config/stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { generateBracketImage, savePredictionImage } from './image.service';
import { generateQRCode } from './qrcode.service';
import { mintWithRetry, unlockPredictionNFT } from './blockchain.service';
import { isBlockchainEnabled } from '../config/blockchain';
import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';

export async function createPaymentIntent(userId: string, predictionId: string) {
  // Get prediction
  const prediction = await prisma.prediction.findFirst({
    where: { id: predictionId, userId },
    include: { user: true },
  });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  if (prediction.isPaid) {
    throw new AppError('Prediction already paid', 400);
  }

  // Check if payment already exists for this prediction
  const existingPayment = await prisma.payment.findUnique({
    where: { predictionId: prediction.id },
  });

  if (existingPayment && existingPayment.stripePaymentId) {
    // Retrieve existing payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentId);

    logger.info(`Returning existing payment intent: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: STRIPE_CONFIG.predictionPrice,
    currency: STRIPE_CONFIG.currency,
    metadata: {
      predictionId: prediction.id,
      userId,
      predictionPublicId: prediction.predictionId,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      predictionId: prediction.id,
      amount: STRIPE_CONFIG.predictionPrice / 100,
      currency: STRIPE_CONFIG.currency.toUpperCase(),
      status: 'pending',
      paymentMethod: 'card',
      stripePaymentId: paymentIntent.id,
    },
  });

  logger.info(`Payment intent created: ${paymentIntent.id}`);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmPayment(
  userId: string,
  paymentIntentId: string,
  predictionId: string
) {
  // 1. Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError('Payment not completed', 400);
  }

  // 2. Get prediction with full data
  const prediction = await prisma.prediction.findFirst({
    where: { id: predictionId, userId },
    include: { user: true },
  });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  if (prediction.isPaid) {
    throw new AppError('Prediction already processed', 400);
  }

  // 3. MINT NFT FIRST (before images)
  let blockchainData: {
    tokenId: number | null;
    transactionHash: string | null;
    nftHash: string | null;
    blockNumber: number | null;
  } = {
    tokenId: null,
    transactionHash: null,
    nftHash: null,
    blockNumber: null,
  };

  try {
    if (isBlockchainEnabled()) {
      logger.info('Minting NFT with blockchain data...');

      // Prepare full prediction data for hashing
      const predictionData = {
        groupStandings: prediction.groupStandings,
        thirdPlaceTeams: prediction.thirdPlaceTeams,
        roundOf32: prediction.roundOf32,
        roundOf16: prediction.roundOf16,
        quarterFinals: prediction.quarterFinals,
        semiFinals: prediction.semiFinals,
        final: prediction.final,
        thirdPlace: prediction.thirdPlace,
        champion: prediction.champion,
        runnerUp: prediction.runnerUp,
      };

      // Use wallet address or fallback to user ID
      const userAddress = prediction.user.walletAddress || prediction.user.id;

      // Mint with retry logic (max 3 attempts)
      const mintResult = await mintWithRetry(
        userAddress,
        prediction.predictionId,
        predictionData as any,
        3
      );

      blockchainData = {
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        nftHash: mintResult.predictionHash,
        blockNumber: mintResult.blockNumber,
      };

      logger.info('NFT minted successfully:', blockchainData);

      // Unlock NFT immediately after minting
      await unlockPredictionNFT(mintResult.tokenId);
    } else {
      logger.warn('Blockchain disabled - skipping NFT minting');
    }
  } catch (error: any) {
    logger.error('NFT minting failed:', error);

    // Decide: Should we fail the entire payment or continue?
    // Check if blockchain is required (strict mode)
    if (process.env.BLOCKCHAIN_REQUIRED === 'true') {
      throw new AppError(`Payment cannot complete: ${error.message}`, 500);
    }

    // Continue without NFT in lenient mode
    logger.warn('Continuing payment without NFT (lenient mode)');
  }

  // 4. Generate bracket image WITH blockchain data
  const { imageBuffer } = await generateBracketImage(
    prediction,
    prediction.user.username,
    prediction.predictionId,
    blockchainData // Pass blockchain data to image generator
  );

  const imageUrl = await savePredictionImage(imageBuffer, prediction.predictionId);

  // 5. Generate QR code and save to predictions directory
  const qrUrl = `${process.env.FRONTEND_URL}/prediction/${prediction.predictionId}`;
  const qrBuffer = await generateQRCode(qrUrl);

  // Save QR code directly to predictions directory
  const qrFilename = `${prediction.predictionId}_qr.png`;
  const qrFilepath = path.join(__dirname, '../../uploads/predictions', qrFilename);
  await fs.writeFile(qrFilepath, qrBuffer);
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const qrCodeUrl = `${backendUrl}/uploads/predictions/${qrFilename}`;
  logger.info(`Saved QR code: ${qrFilename}`);

  // 6. Update database with ALL blockchain data
  await prisma.prediction.update({
    where: { id: prediction.id },
    data: {
      isPaid: true,
      paymentId: paymentIntent.id,
      imageUrl,
      qrCodeUrl,
      tokenId: blockchainData.tokenId,
      transactionHash: blockchainData.transactionHash,
      nftHash: blockchainData.nftHash,
    },
  });

  // 7. Update payment record
  await prisma.payment.updateMany({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      status: 'succeeded',
      completedAt: new Date(),
    },
  });

  logger.info(`Payment confirmed and prediction unlocked: ${prediction.predictionId}`);

  return {
    success: true,
    imageUrl,
    qrCodeUrl,
    tokenId: blockchainData.tokenId,
    transactionHash: blockchainData.transactionHash,
    nftHash: blockchainData.nftHash,
  };
}

export async function getPaymentStatus(paymentId: string, userId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { id: paymentId },
        { stripePaymentId: paymentId },
      ],
      userId,
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
}

export async function handleStripeWebhook(event: Stripe.Event) {
  logger.info(`Handling Stripe webhook: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      logger.debug(`Unhandled event type: ${event.type}`);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { predictionId, userId } = paymentIntent.metadata;

  logger.info(`Payment succeeded for user ${userId}, prediction: ${predictionId}`);

  // Update payment status
  await prisma.payment.updateMany({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      status: 'succeeded',
      completedAt: new Date(),
    },
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error(`Payment failed: ${paymentIntent.id}`);

  await prisma.payment.updateMany({
    where: { stripePaymentId: paymentIntent.id },
    data: {
      status: 'failed',
    },
  });
}

export async function handleCryptoWebhook(event: any) {
  logger.info('Handling crypto payment webhook:', event);

  // Implement Coinbase Commerce webhook handling
  if (event.type === 'charge:confirmed') {
    const { metadata, payments } = event.data;
    const cryptoTxHash = payments[0]?.transaction_id;

    // Update payment record
    await prisma.payment.updateMany({
      where: { id: metadata.paymentId },
      data: {
        status: 'succeeded',
        cryptoTxHash,
        completedAt: new Date(),
      },
    });

    logger.info(`Crypto payment confirmed: ${cryptoTxHash}`);
  }
}