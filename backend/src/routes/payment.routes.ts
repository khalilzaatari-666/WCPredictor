import { Router } from 'express';
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

// Webhook routes (no auth, raw body handled in app.ts)
router.post('/webhook/stripe', stripeWebhook);
router.post('/webhook/crypto', cryptoWebhook);

// Protected routes
router.post('/intent', authMiddleware, validateRequest(paymentIntentSchema), createPaymentIntent);
router.post('/confirm', authMiddleware, confirmPayment);
router.get('/status/:paymentId', authMiddleware, getPaymentStatus);

export default router;