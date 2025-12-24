import { Router } from 'express';
import {
  createPrediction,
  getPrediction,
  getUserPredictions,
  generatePreviewFromData,
} from '../controllers/prediction.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { predictionSchema } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validateRequest(predictionSchema), createPrediction);
router.post('/preview', generatePreviewFromData);
router.get('/my', getUserPredictions);
router.get('/:id', getPrediction);

export default router;