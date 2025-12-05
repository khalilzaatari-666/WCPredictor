import { Router } from 'express';
import { getGlobalLeaderboard, getUserRank } from '../controllers/leaderboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public leaderboard
router.get('/', getGlobalLeaderboard);

// Protected routes
router.get('/my-rank', authMiddleware, getUserRank);

export default router;
