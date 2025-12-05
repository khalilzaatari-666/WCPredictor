import { stripe, STRIPE_CONFIG } from '../config/stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';
import { generateBracketImage, saveImage } from './image.service';
import { generateQRCode } from './qrcode.service';
import { mintPredictionNFT, unlockPredictionNFT } from './blockchain.service';
import Stripe from 'stripe';

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
  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError('Payment not completed', 400);
  }

  // Get prediction
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

  // Generate images
  const { imageBuffer, thumbnailBuffer } = await generateBracketImage(
    prediction,
    prediction.user.username,
    prediction.predictionId
  );

  const imageUrl = await saveImage(imageBuffer, `${prediction.predictionId}.png`);
  const thumbnailUrl = await saveImage(thumbnailBuffer, `${prediction.predictionId}_thumb.png`);

  // Generate QR code
  const qrUrl = `${process.env.FRONTEND_URL}/prediction/${prediction.predictionId}`;
  const qrBuffer = await generateQRCode(qrUrl);
  const qrCodeUrl = await saveImage(qrBuffer, `${prediction.predictionId}_qr.png`);

  // Mint NFT
  let tokenId: number | null = null;
  let transactionHash: string | null = null;

  try {
    const userAddress = prediction.user.walletAddress || prediction.user.id;
    tokenId = await mintPredictionNFT(userAddress, prediction.predictionId);
    
    // Unlock NFT immediately after minting
    await unlockPredictionNFT(tokenId);
  } catch (error) {
    logger.error('NFT minting failed, but continuing with payment:', error);
    // Continue even if NFT minting fails
  }

  // Update prediction
  await prisma.prediction.update({
    where: { id: prediction.id },
    data: {
      isPaid: true,
      paymentId: paymentIntent.id,
      imageUrl,
      qrCodeUrl,
      tokenId,
      transactionHash,
    },
  });

  // Update payment record
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
    thumbnailUrl,
    qrCodeUrl,
    tokenId,
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