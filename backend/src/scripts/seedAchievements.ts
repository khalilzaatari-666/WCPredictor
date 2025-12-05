import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // First Steps (Bronze Tier)
  {
    code: 'FIRST_PREDICTION',
    name: 'First Steps',
    description: 'Make your first World Cup prediction',
    icon: '🎯',
    category: 'predictions',
    tier: 'bronze',
    points: 10,
    requirement: 1,
  },
  {
    code: 'ACCOUNT_CREATED',
    name: 'Welcome Aboard',
    description: 'Create your World Cup Predictor account',
    icon: '👋',
    category: 'profile',
    tier: 'bronze',
    points: 5,
    requirement: 1,
  },
  {
    code: 'PROFILE_COMPLETE',
    name: 'All Set',
    description: 'Complete your profile information',
    icon: '✅',
    category: 'profile',
    tier: 'bronze',
    points: 15,
    requirement: 1,
  },

  // Prediction Milestones (Bronze to Gold)
  {
    code: 'PREDICTIONS_5',
    name: 'Getting Started',
    description: 'Submit 5 tournament predictions',
    icon: '🎲',
    category: 'predictions',
    tier: 'bronze',
    points: 25,
    requirement: 5,
  },
  {
    code: 'PREDICTIONS_10',
    name: 'Prediction Expert',
    description: 'Submit 10 tournament predictions',
    icon: '🎯',
    category: 'predictions',
    tier: 'silver',
    points: 50,
    requirement: 10,
  },
  {
    code: 'PREDICTIONS_25',
    name: 'Fortune Teller',
    description: 'Submit 25 tournament predictions',
    icon: '🔮',
    category: 'predictions',
    tier: 'gold',
    points: 100,
    requirement: 25,
  },
  {
    code: 'PREDICTIONS_50',
    name: 'Oracle',
    description: 'Submit 50 tournament predictions',
    icon: '🌟',
    category: 'predictions',
    tier: 'platinum',
    points: 250,
    requirement: 50,
  },

  // Accuracy Achievements
  {
    code: 'ACCURACY_50',
    name: 'Half Right',
    description: 'Achieve 50% accuracy on a prediction',
    icon: '📊',
    category: 'accuracy',
    tier: 'bronze',
    points: 30,
    requirement: 50,
  },
  {
    code: 'ACCURACY_70',
    name: 'Sharp Shooter',
    description: 'Achieve 70% accuracy on a prediction',
    icon: '🎪',
    category: 'accuracy',
    tier: 'silver',
    points: 75,
    requirement: 70,
  },
  {
    code: 'ACCURACY_90',
    name: 'Clairvoyant',
    description: 'Achieve 90% accuracy on a prediction',
    icon: '🔥',
    category: 'accuracy',
    tier: 'gold',
    points: 150,
    requirement: 90,
  },
  {
    code: 'PERFECT_PREDICTION',
    name: 'Crystal Ball',
    description: 'Achieve 100% perfect prediction',
    icon: '💎',
    category: 'accuracy',
    tier: 'platinum',
    points: 500,
    requirement: 100,
  },

  // Score Achievements
  {
    code: 'SCORE_100',
    name: 'Century',
    description: 'Reach 100 total points',
    icon: '💯',
    category: 'score',
    tier: 'bronze',
    points: 20,
    requirement: 100,
  },
  {
    code: 'SCORE_500',
    name: 'High Roller',
    description: 'Reach 500 total points',
    icon: '🎰',
    category: 'score',
    tier: 'silver',
    points: 50,
    requirement: 500,
  },
  {
    code: 'SCORE_1000',
    name: 'Grand Master',
    description: 'Reach 1000 total points',
    icon: '👑',
    category: 'score',
    tier: 'gold',
    points: 100,
    requirement: 1000,
  },
  {
    code: 'SCORE_5000',
    name: 'Legend',
    description: 'Reach 5000 total points',
    icon: '🏆',
    category: 'score',
    tier: 'platinum',
    points: 250,
    requirement: 5000,
  },

  // Leaderboard Rankings
  {
    code: 'TOP_100',
    name: 'Elite Club',
    description: 'Reach top 100 on the leaderboard',
    icon: '📈',
    category: 'leaderboard',
    tier: 'silver',
    points: 75,
    requirement: 100,
  },
  {
    code: 'TOP_50',
    name: 'Rising Star',
    description: 'Reach top 50 on the leaderboard',
    icon: '⭐',
    category: 'leaderboard',
    tier: 'gold',
    points: 125,
    requirement: 50,
  },
  {
    code: 'TOP_10',
    name: 'Champion Contender',
    description: 'Reach top 10 on the leaderboard',
    icon: '🥇',
    category: 'leaderboard',
    tier: 'platinum',
    points: 300,
    requirement: 10,
  },
  {
    code: 'RANK_1',
    name: 'World Champion',
    description: 'Reach #1 on the global leaderboard',
    icon: '👑',
    category: 'leaderboard',
    tier: 'platinum',
    points: 1000,
    requirement: 1,
  },

  // Special Achievements
  {
    code: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Submit a prediction before tournament starts',
    icon: '🐦',
    category: 'special',
    tier: 'silver',
    points: 50,
    requirement: 1,
  },
  {
    code: 'UNDERDOG_PICK',
    name: 'Underdog Believer',
    description: 'Correctly predict an underdog team to win',
    icon: '🐕',
    category: 'special',
    tier: 'gold',
    points: 150,
    requirement: 1,
  },
  {
    code: 'GROUP_MASTER',
    name: 'Group Stage Prophet',
    description: 'Predict all group stage winners correctly',
    icon: '🎯',
    category: 'special',
    tier: 'gold',
    points: 200,
    requirement: 12,
  },
  {
    code: 'KNOCKOUT_KING',
    name: 'Knockout King',
    description: 'Predict all knockout stage winners correctly',
    icon: '⚡',
    category: 'special',
    tier: 'platinum',
    points: 300,
    requirement: 15,
  },
  {
    code: 'FINAL_FOUR',
    name: 'Final Four Visionary',
    description: 'Correctly predict all semi-finalists',
    icon: '🌟',
    category: 'special',
    tier: 'gold',
    points: 175,
    requirement: 4,
  },
  {
    code: 'CHAMPION_CALLER',
    name: 'Champion Caller',
    description: 'Correctly predict the World Cup champion',
    icon: '🏆',
    category: 'special',
    tier: 'platinum',
    points: 500,
    requirement: 1,
  },

  // Social/Engagement
  {
    code: 'SEVEN_DAY_STREAK',
    name: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    icon: '📅',
    category: 'engagement',
    tier: 'bronze',
    points: 35,
    requirement: 7,
  },
  {
    code: 'THIRTY_DAY_STREAK',
    name: 'Monthly Master',
    description: 'Log in for 30 consecutive days',
    icon: '🗓️',
    category: 'engagement',
    tier: 'gold',
    points: 150,
    requirement: 30,
  },
];

async function seedAchievements() {
  console.log('🌱 Seeding achievements...');

  try {
    // Delete existing achievements
    await prisma.achievement.deleteMany({});
    console.log('✅ Cleared existing achievements');

    // Create new achievements
    for (const achievement of achievements) {
      await prisma.achievement.create({
        data: achievement,
      });
      console.log(`✅ Created: ${achievement.name} (${achievement.tier})`);
    }

    console.log(`\n🎉 Successfully seeded ${achievements.length} achievements!`);
    console.log('\nAchievement Summary:');
    console.log(`- Bronze: ${achievements.filter(a => a.tier === 'bronze').length}`);
    console.log(`- Silver: ${achievements.filter(a => a.tier === 'silver').length}`);
    console.log(`- Gold: ${achievements.filter(a => a.tier === 'gold').length}`);
    console.log(`- Platinum: ${achievements.filter(a => a.tier === 'platinum').length}`);
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAchievements()
  .then(() => {
    console.log('\n✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
