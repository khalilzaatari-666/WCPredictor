import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as paymentService from '../services/payment.service';
import { AuthRequest } from '../types/auth.types';
import logger from '../utils/logger';
import { stripe } from '../config/stripe';

export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { predictionId } = req.body;

  const paymentIntent = await paymentService.createPaymentIntent(userId, predictionId);

  res.json({
    success: true,
    data: paymentIntent,
  });
});

export const confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { paymentIntentId, predictionId } = req.body;

  const result = await paymentService.confirmPayment(userId, paymentIntentId, predictionId);

  res.json({
    success: true,
    data: result,
  });
});

export const getPaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const paymentId = req.params.id;

  const payment = await paymentService.getPaymentStatus(paymentId, userId);

  res.json({
    success: true,
    data: { payment },
  });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error('Stripe webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  await paymentService.handleStripeWebhook(event);

  res.json({ received: true });
});

export const cryptoWebhook = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body;

  await paymentService.handleCryptoWebhook(event);

  res.json({ received: true });
});