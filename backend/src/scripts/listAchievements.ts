import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAchievements() {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ tier: 'asc' }, { points: 'asc' }],
  });

  console.log('=== ACHIEVEMENTS IN DATABASE ===\n');
  console.log(`Total: ${achievements.length} achievements\n`);

  const byTier: Record<string, any[]> = {
    bronze: [],
    silver: [],
    gold: [],
    platinum: [],
  };

  achievements.forEach((a) => {
    byTier[a.tier].push(a);
  });

  Object.keys(byTier).forEach((tier) => {
    console.log(`${tier.toUpperCase()}: ${byTier[tier].length} achievements`);
    byTier[tier].forEach((a) => {
      console.log(`  ${a.icon} ${a.name} - ${a.points} pts (${a.category})`);
    });
    console.log('');
  });

  await prisma.$disconnect();
}

listAchievements();
