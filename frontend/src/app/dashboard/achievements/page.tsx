'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Trophy,
  Target,
  Zap,
  Star,
  Crown,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  unlocked: boolean;
  progress: number;
  unlockedAt?: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Get all achievements with user progress
      const response = await api.get('/achievements/my/progress');
      const data = response.data.data;

      // Flatten grouped achievements into array
      const achievementsList: Achievement[] = [];

      if (data.achievements) {
        Object.keys(data.achievements).forEach((category) => {
          data.achievements[category].forEach((ach: any) => {
            achievementsList.push({
              id: ach.id,
              name: ach.name,
              description: ach.description,
              icon: ach.icon || 'award',
              category: category,
              requirement: ach.requirement,
              unlocked: ach.isCompleted,
              progress: ach.progress,
              unlockedAt: ach.completedAt,
            });
          });
        });
      }

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (icon: string, unlocked: boolean) => {
    const iconClass = `w-8 h-8 ${unlocked ? 'text-wc-gold' : 'text-muted-foreground'}`;
    switch (icon) {
      case 'target':
        return <Target className={iconClass} />;
      case 'trophy':
        return <Trophy className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'crown':
        return <Crown className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const categories = ['all', ...new Set(achievements.map((a) => a.category))];

  let filteredAchievements = achievements;

  // Apply category filter
  if (filter !== 'all') {
    filteredAchievements = filteredAchievements.filter((a) => a.category === filter);
  }

  // Apply status filter
  if (statusFilter === 'unlocked') {
    filteredAchievements = filteredAchievements.filter((a) => a.unlocked);
  } else if (statusFilter === 'locked') {
    filteredAchievements = filteredAchievements.filter((a) => !a.unlocked);
  }

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter((a) => a.unlocked).length,
    progress: achievements.length > 0
      ? Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100)
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Award className="w-16 h-16 text-wc-gold mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Award className="w-10 h-10 text-wc-gold" />
          Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          Unlock badges and showcase your prediction skills
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-wc-gold/20">
              <Trophy className="w-6 h-6 text-wc-gold" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.unlocked}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-wc-primary/20">
              <Target className="w-6 h-6 text-wc-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.total - stats.unlocked}</div>
              <div className="text-sm text-muted-foreground">Locked</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.progress}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-wc-primary text-white'
                  : 'glass hover:bg-white/5'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('unlocked')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                statusFilter === 'unlocked'
                  ? 'bg-green-500 text-white'
                  : 'glass hover:bg-white/5'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Unlocked
            </button>
            <button
              onClick={() => setStatusFilter('locked')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                statusFilter === 'locked'
                  ? 'bg-orange-500 text-white'
                  : 'glass hover:bg-white/5'
              }`}
            >
              <Lock className="w-4 h-4" />
              Locked
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Category</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  filter === category
                    ? 'bg-wc-primary text-white'
                    : 'glass hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`glass-card cursor-pointer group relative overflow-hidden ${
              achievement.unlocked
                ? 'border-2 border-wc-gold/30'
                : 'opacity-75'
            }`}
          >
            {/* Unlocked Badge */}
            {achievement.unlocked && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className={`p-4 rounded-xl ${
                  achievement.unlocked
                    ? 'bg-wc-gold/20'
                    : 'bg-muted-foreground/10'
                } group-hover:scale-110 transition-transform`}
              >
                {achievement.unlocked ? (
                  getIcon(achievement.icon, true)
                ) : (
                  <Lock className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                {!achievement.unlocked && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {achievement.progress} / {achievement.requirement}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(achievement.progress / achievement.requirement) * 100}%`,
                        }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-wc-primary to-wc-accent"
                      />
                    </div>
                  </div>
                )}

                {/* Unlocked Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-green-500">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="glass-card text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">No achievements in this category</h3>
          <p className="text-muted-foreground">
            Try a different filter to see more achievements
          </p>
        </div>
      )}
    </div>
  );
}
