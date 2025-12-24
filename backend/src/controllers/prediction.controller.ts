import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as predictionService from '../services/prediction.service';
import { AuthRequest } from '../types/auth.types';
import { checkAndAwardAchievements } from './achievement.controller';
import { generateBlurredPreview } from '../services/image.service';

export const createPrediction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const predictionData = req.body;

  const prediction = await predictionService.createPrediction(userId, predictionData);

  // Check and award achievements after creating prediction
  const newAchievements = await checkAndAwardAchievements(userId).catch(err => {
    console.error('Failed to check achievements:', err);
    return [];
  });

  res.status(201).json({
    success: true,
    data: {
      prediction,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined,
    },
  });
});

export const getPrediction = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;

  const prediction = await predictionService.getPrediction(id, userId);

  res.json({
    success: true,
    data: { prediction },
  });
});

export const getUserPredictions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const predictions = await predictionService.getUserPredictions(userId);

  res.json({
    success: true,
    data: { predictions },
  });
});

export const generatePreviewFromData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const predictionData = req.body;

  console.log(`[Preview] Generating blurred preview from prediction data for user ${userId}`);

  try {
    // Get user info for the preview
    const userInfo = await predictionService.getUserInfo(userId);
    console.log(`[Preview] Found user: ${userInfo.username}`);

    // Generate blurred preview (PRE-PAYMENT - no blockchain data)
    console.log('[Preview] Generating blurred preview with prediction data...');
    const blurredPreview = await generateBlurredPreview(
      predictionData,
      userInfo.username
    );
    console.log(`[Preview] Generated blurred preview (${blurredPreview.length} bytes)`);

    // Set response headers for image
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // Don't cache preview

    // Send the blurred preview
    res.send(blurredPreview);
    console.log('[Preview] Sent blurred preview successfully');
  } catch (error) {
    console.error('[Preview] Error generating preview from data:', error);
    throw error;
  }
});
