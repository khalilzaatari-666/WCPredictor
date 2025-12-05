import { Request, Response } from 'express';
import prisma from '../config/database';

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const leaderboard = await prisma.user.findMany({
      where: {
        totalScore: {
          gt: 0,
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        totalScore: true,
        rank: true,
        bestPredictionScore: true,
        _count: {
          select: {
            predictions: true,
            achievements: {
              where: {
                isCompleted: true,
              },
            },
          },
        },
      },
      orderBy: [
        { totalScore: 'desc' },
        { bestPredictionScore: 'desc' },
        { createdAt: 'asc' },
      ],
      take: Number(limit),
      skip: Number(offset),
    });

    // Calculate ranks if not set
    const leaderboardWithRanks = leaderboard.map((user, index) => ({
      ...user,
      rank: user.rank || Number(offset) + index + 1,
      totalPredictions: user._count.predictions,
      totalAchievements: user._count.achievements,
      _count: undefined,
    }));

    // Get total count
    const totalUsers = await prisma.user.count({
      where: {
        totalScore: {
          gt: 0,
        },
      },
    });

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRanks,
        pagination: {
          total: totalUsers,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + leaderboard.length < totalUsers,
        },
      },
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

export const getUserRank = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        totalScore: true,
        rank: true,
        bestPredictionScore: true,
        _count: {
          select: {
            predictions: true,
            achievements: {
              where: {
                isCompleted: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate rank if not set
    if (!user.rank) {
      const betterUsers = await prisma.user.count({
        where: {
          OR: [
            { totalScore: { gt: user.totalScore } },
            {
              AND: [
                { totalScore: user.totalScore },
                { bestPredictionScore: { gt: user.bestPredictionScore || 0 } },
              ],
            },
          ],
        },
      });
      user.rank = betterUsers + 1;
    }

    // Get users around this user
    const surroundingUsers = await prisma.user.findMany({
      where: {
        totalScore: {
          gte: user.totalScore - 100,
          lte: user.totalScore + 100,
        },
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        totalScore: true,
        rank: true,
      },
      orderBy: [{ totalScore: 'desc' }],
      take: 10,
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          totalPredictions: user._count.predictions,
          totalAchievements: user._count.achievements,
        },
        surrounding: surroundingUsers,
      },
    });
  } catch (error: any) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank',
      error: error.message,
    });
  }
};

export const updateLeaderboard = async () => {
  try {
    // Recalculate all user scores based on their predictions
    const users = await prisma.user.findMany({
      include: {
        predictions: {
          where: {
            isScored: true,
          },
          select: {
            score: true,
          },
        },
      },
    });

    for (const user of users) {
      const totalScore = user.predictions.reduce((sum, pred) => sum + pred.score, 0);
      const bestScore = Math.max(...user.predictions.map(p => p.score), 0);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalScore,
          bestPredictionScore: bestScore,
        },
      });
    }

    // Update ranks
    const sortedUsers = await prisma.user.findMany({
      orderBy: [
        { totalScore: 'desc' },
        { bestPredictionScore: 'desc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
      },
    });

    for (let i = 0; i < sortedUsers.length; i++) {
      await prisma.user.update({
        where: { id: sortedUsers[i].id },
        data: { rank: i + 1 },
      });
    }

    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Update leaderboard error:', error);
    throw error;
  }
};
