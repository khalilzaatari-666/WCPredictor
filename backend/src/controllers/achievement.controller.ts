import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllAchievements = async (res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { tier: 'asc' },
        { points: 'asc' },
      ],
    });

    return res.json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message,
    });
  }
};

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: [
        { isCompleted: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    // Group by category
    const groupedAchievements = userAchievements.reduce((acc: any, ua) => {
      const category = ua.achievement.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: ua.id,
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        tier: ua.achievement.tier,
        points: ua.achievement.points,
        progress: ua.progress,
        isCompleted: ua.isCompleted,
        completedAt: ua.completedAt,
        requirement: ua.achievement.requirement,
      });
      return acc;
    }, {});

    // Calculate stats
    const stats = {
      total: userAchievements.length,
      completed: userAchievements.filter(ua => ua.isCompleted).length,
      totalPoints: userAchievements
        .filter(ua => ua.isCompleted)
        .reduce((sum, ua) => sum + ua.achievement.points, 0),
    };

    res.json({
      success: true,
      data: {
        achievements: groupedAchievements,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user achievements',
      error: error.message,
    });
  }
};

export const checkAndAwardAchievements = async (userId: string) => {
  try {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        predictions: {
          where: { isScored: true },
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) return [];

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();
    const newlyUnlocked: any[] = [];

    for (const achievement of allAchievements) {
      // Check if user already has this achievement
      const existing = user.achievements.find(
        ua => ua.achievementId === achievement.id
      );

      let progress = 0;
      let isCompleted = false;

      // Check achievement requirements based on category and code
      switch (achievement.code) {
        // Profile Achievements
        case 'ACCOUNT_CREATED':
          progress = 1;
          isCompleted = true; // Always true if user exists
          break;

        case 'PROFILE_COMPLETE':
          // Check if user has filled optional fields
          const hasAvatar = !!user.avatar;
          const hasDisplayName = !!user.displayName;
          progress = (hasAvatar && hasDisplayName) ? 1 : 0;
          isCompleted = hasAvatar && hasDisplayName;
          break;

        // Prediction Count Achievements
        case 'FIRST_PREDICTION':
          progress = user.predictions.length;
          isCompleted = user.predictions.length >= 1;
          break;

        case 'PREDICTIONS_5':
          progress = user.predictions.length;
          isCompleted = user.predictions.length >= 5;
          break;

        case 'PREDICTIONS_10':
          progress = user.predictions.length;
          isCompleted = user.predictions.length >= 10;
          break;

        case 'PREDICTIONS_25':
          progress = user.predictions.length;
          isCompleted = user.predictions.length >= 25;
          break;

        case 'PREDICTIONS_50':
          progress = user.predictions.length;
          isCompleted = user.predictions.length >= 50;
          break;

        // Accuracy Achievements
        case 'ACCURACY_50':
          const acc50Predictions = user.predictions.filter(p => p.accuracy && p.accuracy >= 50);
          progress = acc50Predictions.length > 0 ? Math.max(...acc50Predictions.map(p => p.accuracy || 0)) : 0;
          isCompleted = acc50Predictions.length > 0;
          break;

        case 'ACCURACY_70':
          const acc70Predictions = user.predictions.filter(p => p.accuracy && p.accuracy >= 70);
          progress = acc70Predictions.length > 0 ? Math.max(...acc70Predictions.map(p => p.accuracy || 0)) : 0;
          isCompleted = acc70Predictions.length > 0;
          break;

        case 'ACCURACY_90':
          const acc90Predictions = user.predictions.filter(p => p.accuracy && p.accuracy >= 90);
          progress = acc90Predictions.length > 0 ? Math.max(...acc90Predictions.map(p => p.accuracy || 0)) : 0;
          isCompleted = acc90Predictions.length > 0;
          break;

        case 'PERFECT_PREDICTION':
          const perfectPredictions = user.predictions.filter(p => p.accuracy === 100);
          progress = perfectPredictions.length;
          isCompleted = perfectPredictions.length >= 1;
          break;

        // Score Achievements
        case 'SCORE_100':
          progress = user.totalScore;
          isCompleted = user.totalScore >= 100;
          break;

        case 'SCORE_500':
          progress = user.totalScore;
          isCompleted = user.totalScore >= 500;
          break;

        case 'SCORE_1000':
          progress = user.totalScore;
          isCompleted = user.totalScore >= 1000;
          break;

        case 'SCORE_5000':
          progress = user.totalScore;
          isCompleted = user.totalScore >= 5000;
          break;

        // Leaderboard Achievements
        case 'TOP_100':
          progress = user.rank || 0;
          isCompleted = user.rank ? user.rank <= 100 : false;
          break;

        case 'TOP_50':
          progress = user.rank || 0;
          isCompleted = user.rank ? user.rank <= 50 : false;
          break;

        case 'TOP_10':
          progress = user.rank || 0;
          isCompleted = user.rank ? user.rank <= 10 : false;
          break;

        case 'RANK_1':
          progress = user.rank || 0;
          isCompleted = user.rank === 1;
          break;

        // Special Achievements (require manual unlock or specific game logic)
        case 'EARLY_BIRD':
        case 'UNDERDOG_PICK':
        case 'GROUP_MASTER':
        case 'KNOCKOUT_KING':
        case 'FINAL_FOUR':
        case 'CHAMPION_CALLER':
          // These need to be unlocked based on specific prediction analysis
          // Keep existing progress if any
          progress = existing?.progress || 0;
          isCompleted = existing?.isCompleted || false;
          break;

        // Engagement Achievements (require login tracking - not implemented yet)
        case 'SEVEN_DAY_STREAK':
        case 'THIRTY_DAY_STREAK':
          // TODO: Implement login streak tracking
          progress = existing?.progress || 0;
          isCompleted = existing?.isCompleted || false;
          break;

        default:
          // Unknown achievement, keep existing state
          progress = existing?.progress || 0;
          isCompleted = existing?.isCompleted || false;
          break;
      }

      if (existing) {
        // Update existing achievement
        if (existing.progress !== progress || existing.isCompleted !== isCompleted) {
          await prisma.userAchievement.update({
            where: { id: existing.id },
            data: {
              progress,
              isCompleted,
              completedAt: isCompleted && !existing.isCompleted ? new Date() : existing.completedAt,
            },
          });

          // If newly completed, add to list and update user's total score
          if (isCompleted && !existing.isCompleted) {
            // Update user's total score
            await prisma.user.update({
              where: { id: userId },
              data: {
                totalScore: {
                  increment: achievement.points,
                },
              },
            });

            newlyUnlocked.push({
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              points: achievement.points,
            });
          }
        }
      } else {
        // Create new achievement entry
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });

        // If completed on creation, add to list and update user's total score
        if (isCompleted) {
          // Update user's total score
          await prisma.user.update({
            where: { id: userId },
            data: {
              totalScore: {
                increment: achievement.points,
              },
            },
          });

          newlyUnlocked.push({
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            points: achievement.points,
          });
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Check achievements error:', error);
    return [];
  }
};

export const getAchievementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const achievement = await prisma.achievement.findUnique({
      where: { id },
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    // Get user's progress on this achievement
    const userAchievement = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievementId: id,
      },
    });

    return res.json({
      success: true,
      data: {
        ...achievement,
        userProgress: userAchievement || null,
      },
    });
  } catch (error: any) {
    console.error('Get achievement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement',
      error: error.message,
    });
  }
};

export const unlockAchievement = async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    const userId = (req as any).user.userId;

    // Verify achievement exists
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    // Check if user already has this achievement
    const existing = await prisma.userAchievement.findFirst({
      where: {
        userId,
        achievementId,
      },
    });

    if (existing?.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Achievement already unlocked',
      });
    }

    // Unlock achievement
    const userAchievement = existing
      ? await prisma.userAchievement.update({
          where: { id: existing.id },
          data: {
            isCompleted: true,
            completedAt: new Date(),
            progress: achievement.requirement as number,
          },
        })
      : await prisma.userAchievement.create({
          data: {
            userId,
            achievementId,
            isCompleted: true,
            completedAt: new Date(),
            progress: achievement.requirement as number,
          },
        });

    // Update user's total score
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalScore: {
          increment: achievement.points,
        },
      },
    });

    return res.json({
      success: true,
      message: 'Achievement unlocked!',
      data: {
        userAchievement,
        pointsEarned: achievement.points,
      },
    });
  } catch (error: any) {
    console.error('Unlock achievement error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unlock achievement',
      error: error.message,
    });
  }
};

export const checkUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await checkAndAwardAchievements(userId);

    res.json({
      success: true,
      message: 'Achievements checked and updated',
    });
  } catch (error: any) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check achievements',
      error: error.message,
    });
  }
};
