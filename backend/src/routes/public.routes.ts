import { Router } from 'express';
import { getPredictionImage, getPublicPrediction } from '../controllers/public.controller';

const router = Router();

router.get('/prediction/:predictionId', getPublicPrediction);
router.get('/prediction/:predictionId/image', getPredictionImage);

export default router;