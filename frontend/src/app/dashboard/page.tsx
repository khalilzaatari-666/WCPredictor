'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Medal,
  Target,
  Plus,
  Flame,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalScore: 0,
    rank: null,
    predictions: 0,
    accuracy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      const profileRes = await api.get('/auth/profile');
      const userData = profileRes.data.data;

      setStats({
        totalScore: userData.totalScore || 0,
        rank: userData.rank || null,
        predictions: 0, // Will be updated when we have predictions
        accuracy: 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Trophy,
      label: 'Total Score',
      value: stats.totalScore,
      color: 'text-wc-gold',
      bgColor: 'bg-wc-gold/10',
    },
    {
      icon: Medal,
      label: 'Global Rank',
      value: stats.rank ? `#${stats.rank}` : '--',
      color: 'text-wc-accent',
      bgColor: 'bg-wc-accent/10',
    },
    {
      icon: Target,
      label: 'Predictions',
      value: stats.predictions,
      color: 'text-wc-primary',
      bgColor: 'bg-wc-primary/10',
    },
    {
      icon: TrendingUp,
      label: 'Accuracy',
      value: stats.accuracy > 0 ? `${stats.accuracy}%` : '--',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-wc-gold mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold flex items-center gap-2">
          Welcome back, {user?.username}!
          <span className="text-3xl">👋</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to make your predictions for FIFA World Cup 2026?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/predict')}
            className="p-4 rounded-xl glass hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center gap-3 group"
          >
            <div className="p-3 rounded-lg bg-wc-primary/20 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-wc-primary" />
            </div>
            <div>
              <div className="font-medium">Make Prediction</div>
              <div className="text-xs text-muted-foreground mt-1">
                Predict tournament outcomes
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/leaderboard')}
            className="p-4 rounded-xl glass hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center gap-3 group"
          >
            <div className="p-3 rounded-lg bg-wc-accent/20 group-hover:scale-110 transition-transform">
              <Medal className="w-6 h-6 text-wc-accent" />
            </div>
            <div>
              <div className="font-medium">Leaderboard</div>
              <div className="text-xs text-muted-foreground mt-1">
                See rankings
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/dashboard/achievements')}
            className="p-4 rounded-xl glass hover:bg-white/10 transition-all duration-300 text-center flex flex-col items-center gap-3 group"
          >
            <div className="p-3 rounded-lg bg-wc-gold/20 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-wc-gold" />
            </div>
            <div>
              <div className="font-medium">Achievements</div>
              <div className="text-xs text-muted-foreground mt-1">
                View badges
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}