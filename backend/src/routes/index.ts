import { Router } from 'express';
import authRoutes from './auth.routes';
import predictionRoutes from './prediction.routes';
import paymentRoutes from './payment.routes';
import publicRoutes from './public.routes';
import leaderboardRoutes from './leaderboard.routes';
import achievementRoutes from './achievement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/predictions', predictionRoutes);
router.use('/payments', paymentRoutes);
router.use('/public', publicRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/achievements', achievementRoutes);

export default router;