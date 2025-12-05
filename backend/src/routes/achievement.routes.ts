import { Router } from 'express';
import {
  getAllAchievements,
  getUserAchievements,
  getAchievementById,
  unlockAchievement,
  checkUserAchievements,
} from '../controllers/achievement.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllAchievements);

// Protected routes
router.get('/my/progress', authMiddleware, getUserAchievements);
router.post('/check', authMiddleware, checkUserAchievements);
router.post('/:achievementId/unlock', authMiddleware, unlockAchievement);
router.get('/:id', authMiddleware, getAchievementById);

export default router;
