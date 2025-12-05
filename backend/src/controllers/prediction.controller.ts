import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as predictionService from '../services/prediction.service';
import { AuthRequest } from '../types/auth.types';
import { checkAndAwardAchievements } from './achievement.controller';

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
