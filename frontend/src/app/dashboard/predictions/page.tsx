'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Trophy,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Prediction {
  id: string;
  predictionId: string;
  champion: string;
  runnerUp: string;
  isPaid: boolean;
  imageUrl?: string;
  createdAt: string;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await api.get('/predictions/my');
      setPredictions(response.data.data.predictions || []);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter((pred) => {
    if (!searchQuery) return true;
    return (
      pred.champion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pred.runnerUp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pred.predictionId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    total: predictions.length,
  };

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
          onClick={() => window.location.href = '/dashboard/predict'}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Prediction
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Total Brackets</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Latest</div>
          <div className="text-xl font-bold text-wc-gold">
            {predictions.length > 0
              ? new Date(predictions[0].createdAt).toLocaleDateString()
              : '-'}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="text-sm text-muted-foreground mb-1">Most Picked Champion</div>
          <div className="text-xl font-bold text-wc-primary">
            {predictions.length > 0 ? predictions[0].champion : '-'}
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="glass-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by champion, runner-up, or prediction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
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
            <button
              onClick={() => window.location.href = '/dashboard/predict'}
              className="btn-primary inline-flex items-center gap-2"
            >
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
              onClick={() => window.location.href = `/dashboard/predictions/${prediction.predictionId}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Bracket Preview */}
                {prediction.imageUrl && (
                  <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden border border-white/20 flex-shrink-0">
                    <img
                      src={prediction.imageUrl}
                      alt="Bracket preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Prediction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-wc-gold">
                      {prediction.predictionId}
                    </span>
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-medium">
                      Paid
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-1">
                    <Trophy className="w-5 h-5 text-wc-gold flex-shrink-0" />
                    <div>
                      <span className="text-sm text-muted-foreground">Champion: </span>
                      <span className="font-bold text-wc-gold">{prediction.champion}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-muted-foreground">Runner-up: </span>
                      <span className="font-bold text-gray-300">{prediction.runnerUp}</span>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(prediction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
