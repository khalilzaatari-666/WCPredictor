'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Prediction {
  id: string;
  predictionId: string;
  homeTeam: string;
  awayTeam: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore?: number;
  actualAwayScore?: number;
  matchDate: string;
  status: 'pending' | 'correct' | 'incorrect';
  score: number;
  createdAt: string;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'correct' | 'incorrect'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/predictions/my');
      setPredictions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter((pred) => {
    const matchesFilter = filter === 'all' || pred.status === filter;
    const matchesSearch =
      pred.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pred.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: predictions.length,
    correct: predictions.filter((p) => p.status === 'correct').length,
    incorrect: predictions.filter((p) => p.status === 'incorrect').length,
    pending: predictions.filter((p) => p.status === 'pending').length,
  };

  const accuracy = stats.total > 0 ? ((stats.correct / (stats.correct + stats.incorrect)) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Target className="w-16 h-16 text-wc-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Target className="w-10 h-10 text-wc-primary" />
            My Predictions
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your predictions and accuracy
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Prediction
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Total</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Correct</div>
          <div className="text-3xl font-bold text-green-500">{stats.correct}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
          <div className="text-3xl font-bold text-wc-primary">{accuracy}%</div>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'correct', 'incorrect'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === f
                    ? 'bg-wc-primary text-white'
                    : 'glass hover:bg-white/5'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card text-center py-12"
          >
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No predictions found</h3>
            <p className="text-muted-foreground mb-6">
              Start making predictions to see them here!
            </p>
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Make Your First Prediction
            </button>
          </motion.div>
        ) : (
          filteredPredictions.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="glass-card cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div>
                    {prediction.status === 'correct' && (
                      <div className="p-2 rounded-full bg-green-500/20">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    )}
                    {prediction.status === 'incorrect' && (
                      <div className="p-2 rounded-full bg-red-500/20">
                        <XCircle className="w-6 h-6 text-red-500" />
                      </div>
                    )}
                    {prediction.status === 'pending' && (
                      <div className="p-2 rounded-full bg-yellow-500/20">
                        <Clock className="w-6 h-6 text-yellow-500" />
                      </div>
                    )}
                  </div>

                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-bold">{prediction.homeTeam}</span>
                      <span className="text-2xl font-bold text-wc-primary">
                        {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                      </span>
                      <span className="font-bold">{prediction.awayTeam}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(prediction.matchDate).toLocaleDateString()}
                      </span>
                      {prediction.actualHomeScore !== undefined && (
                        <span>
                          Actual: {prediction.actualHomeScore} - {prediction.actualAwayScore}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {prediction.score > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-wc-gold">
                        +{prediction.score}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
