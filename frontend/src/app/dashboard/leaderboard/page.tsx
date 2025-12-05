'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Medal,
  Trophy,
  TrendingUp,
  Crown,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  totalScore: number;
  rank: number;
  previousRank?: number;
  accuracy?: number;
  predictions: number;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []); // Removed filter dependency

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leaderboard');
      setLeaderboard(response.data.data || []);

      // Fetch user's rank
      const rankResponse = await api.get('/leaderboard/my-rank');
      setMyRank(rankResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-wc-gold" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankChange = (current?: number, previous?: number) => {
    if (!previous || previous === current) {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
    if (current! < previous) {
      return (
        <div className="flex items-center text-green-500">
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs">{previous - current!}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-500">
        <ChevronDown className="w-4 h-4" />
        <span className="text-xs">{current! - previous}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Medal className="w-16 h-16 text-wc-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Medal className="w-10 h-10 text-wc-accent" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Compete with fans worldwide and climb the rankings!
        </p>
      </div>

      {/* My Rank Card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card bg-gradient-to-r from-wc-primary/20 to-wc-accent/20 border-2 border-wc-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-wc-primary/30">
                {getRankIcon(myRank.rank)}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Your Rank</div>
                <div className="text-2xl font-bold">{user?.username}</div>
                <div className="text-sm text-muted-foreground">
                  {myRank.predictions} predictions
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-wc-gold">
                {myRank.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">points</div>
              {myRank.accuracy && (
                <div className="text-sm text-green-500 mt-1">
                  {myRank.accuracy}% accuracy
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="glass-card text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
            <p className="text-muted-foreground">
              Be the first to make predictions and claim the top spot!
            </p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`glass-card cursor-pointer group ${
                entry.id === user?.id ? 'border-2 border-wc-primary/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="flex flex-col items-center w-16">
                    {getRankIcon(entry.rank)}
                    {getRankChange(entry.rank, entry.previousRank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wc-primary to-wc-accent flex items-center justify-center text-white font-bold text-lg">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {entry.username}
                      {entry.id === user?.id && (
                        <span className="text-xs px-2 py-1 rounded-full bg-wc-primary/20 text-wc-primary">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.predictions} predictions
                      {entry.accuracy && ` • ${entry.accuracy}% accuracy`}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-wc-gold">
                      {entry.totalScore}
                    </div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card bg-gradient-to-r from-blue-500/10 to-purple-500/10"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-wc-primary/20">
            <TrendingUp className="w-6 h-6 text-wc-primary" />
          </div>
          <div>
            <h3 className="font-bold mb-2">How Rankings Work</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Make accurate predictions to earn points</li>
              <li>• Higher accuracy = better ranking</li>
              <li>• Rankings update in real-time after each match</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}