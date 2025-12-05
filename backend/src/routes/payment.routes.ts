import { Router } from 'express';
import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  stripeWebhook,
  cryptoWebhook,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { paymentIntentSchema } from '../utils/validators';

const router = Router();

// Webhook routes (no auth, raw body needed)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/webhook/crypto', cryptoWebhook);

// Protected routes
router.post('/intent', authMiddleware, validateRequest(paymentIntentSchema), createPaymentIntent);
router.post('/confirm', authMiddleware, confirmPayment);
router.get('/status/:paymentId', authMiddleware, getPaymentStatus);

export default router;