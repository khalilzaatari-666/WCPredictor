import prisma from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { generatePredictionId } from '../utils/helpers';
import logger from '../utils/logger';
import { PredictionData } from '../types/prediction.types';
import { Prisma } from '@prisma/client';
import { generatePredictionHash } from './hash.service';

export async function createPrediction(userId: string, data: PredictionData) {
  // Validate prediction data first
  validatePredictionData(data);

  // Check for duplicate predictions GLOBALLY (across all users)
  const predictionHash = generatePredictionHash(data);
  const existingPrediction = await prisma.prediction.findFirst({
    where: {
      nftHash: predictionHash,
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (existingPrediction) {
    const isOwnPrediction = existingPrediction.userId === userId;
    const ownerName = existingPrediction.user.displayName || existingPrediction.user.username;

    if (isOwnPrediction) {
      logger.warn(`User ${userId} attempted to create duplicate of their own prediction`);
      throw new AppError(
        `You've already created this exact prediction (ID: ${existingPrediction.predictionId}). Please modify your picks to create a new prediction.`,
        409
      );
    } else {
      logger.warn(`User ${userId} attempted to create prediction already made by ${existingPrediction.userId}`);
      throw new AppError(
        `This exact prediction has already been claimed by another user (${ownerName}). Please modify at least one pick to create a unique prediction.`,
        409
      );
    }
  }

  // Generate unique prediction ID
  const predictionId = generatePredictionId();

  // Create prediction with hash for duplicate detection
  const prediction = await prisma.prediction.create({
    data: {
      userId,
      predictionId,
      groupStandings: data.groupStandings as Prisma.InputJsonValue,
      thirdPlaceTeams: data.thirdPlaceTeams as Prisma.InputJsonValue,
      roundOf32: (data.roundOf32 || {}) as Prisma.InputJsonValue,
      roundOf16: (data.roundOf16 || {}) as Prisma.InputJsonValue,
      quarterFinals: (data.quarterFinals || {}) as Prisma.InputJsonValue,
      semiFinals: (data.semiFinals || {}) as Prisma.InputJsonValue,
      final: (data.final || {}) as Prisma.InputJsonValue,
      thirdPlace: (data.thirdPlace || {}) as Prisma.InputJsonValue,
      champion: data.champion || '',
      runnerUp: data.runnerUp || '',
      nftHash: predictionHash,
      isPaid: false,
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  logger.info(`Prediction created: ${predictionId} by user ${userId}`);

  return prediction;
}

export async function getPrediction(id: string, userId: string) {
  // Try to find by predictionId first (e.g., WC26-XXXX-XXXX-XXXX)
  // Fall back to database ID if not found
  const prediction = await prisma.prediction.findFirst({
    where: {
      OR: [
        { predictionId: id, userId },
        { id, userId }
      ]
    },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  });

  if (!prediction) {
    throw new AppError('Prediction not found', 404);
  }

  return prediction;
}

export async function getUserPredictions(userId: string) {
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      predictionId: true,
      champion: true,
      runnerUp: true,
      isPaid: true,
      imageUrl: true,
      createdAt: true,
    },
  });

  return predictions;
}

export async function getPublicPrediction(predictionId: string) {
  const prediction = await prisma.prediction.findUnique({
    where: { predictionId },
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatar: true,
        },
      },
    },
  });

  if (!prediction || !prediction.isPaid) {
    throw new AppError('Prediction not found or not unlocked', 404);
  }

  return prediction;
}


export async function getUserInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      displayName: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

function validatePredictionData(data: PredictionData) {
  const requiredGroups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  // Check all groups have standings
  for (const group of requiredGroups) {
    const standing = data.groupStandings[group] as any[];
    if (!standing || standing.length !== 4) {
        throw new AppError(`Invalid group standings for group ${group}`, 400);
    }
  }

  // Check third place teams
  if (!data.thirdPlaceTeams || data.thirdPlaceTeams.length !== 8) {
    throw new AppError('Must select exactly 8 third place teams', 400);
  }

  // Validate bracket structure if provided
  if (data.roundOf32) {
    const {
      generateExpectedRoundOf32,
      validateRoundOf32,
      validateRoundOf16,
      validateQuarterFinals,
      validateSemiFinals,
      validateFinalMatches,
    } = require('../utils/bracket.utils');

    // Generate expected Round of 32 structure
    const expectedR32 = generateExpectedRoundOf32(
      data.groupStandings as Record<string, string[]>,
      data.thirdPlaceTeams
    );

    // Validate Round of 32
    validateRoundOf32(data.roundOf32, expectedR32);

    // Validate Round of 16 if provided
    if (data.roundOf16) {
      validateRoundOf16(data.roundOf16, data.roundOf32);
    }

    // Validate Quarter Finals if provided
    if (data.quarterFinals) {
      validateQuarterFinals(data.quarterFinals, data.roundOf16);
    }

    // Validate Semi Finals if provided
    if (data.semiFinals) {
      validateSemiFinals(data.semiFinals, data.quarterFinals);
    }

    // Validate Final and Third Place if provided
    if (data.final && data.thirdPlace) {
      validateFinalMatches(data.final, data.thirdPlace, data.semiFinals);
    }
  }
}