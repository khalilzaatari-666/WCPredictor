import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as predictionService from '../services/prediction.service';
import path from 'path';
import fs from 'fs/promises';

export const getPublicPrediction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { predictionId } = req.params;

  const prediction = await predictionService.getPublicPrediction(predictionId);

  res.json({
    success: true,
    data: { prediction },
  });
});

export const getPredictionImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { predictionId } = req.params;

  const prediction = await predictionService.getPublicPrediction(predictionId);

  if (!prediction.imageUrl) {
    res.status(404).json({
      success: false,
      error: 'Image not found',
    });
    return;
  }

  const imagePath = path.join(__dirname, '../../', prediction.imageUrl);
  const imageBuffer = await fs.readFile(imagePath);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(imageBuffer);
});
