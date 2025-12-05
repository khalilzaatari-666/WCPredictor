'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Trophy, Star, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface AchievementToastProps {
  achievement: {
    name: string;
    description: string;
    icon?: string;
    points?: number;
  } | null;
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed top-4 right-4 z-[100] max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-wc-gold/50 bg-gradient-to-br from-wc-gold/20 via-wc-primary/20 to-wc-accent/20 backdrop-blur-xl shadow-2xl">
            {/* Animated Background Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-wc-gold/10 to-wc-primary/10 blur-3xl"
              />
            </div>

            {/* Content */}
            <div className="relative p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 3,
                  }}
                  className="p-3 rounded-xl bg-wc-gold/30 backdrop-blur-sm"
                >
                  <Trophy className="w-8 h-8 text-wc-gold" />
                </motion.div>
                <div>
                  <div className="text-sm font-medium text-wc-gold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Achievement Unlocked!
                  </div>
                  <h3 className="text-xl font-bold text-white">{achievement.name}</h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-200 mb-3">{achievement.description}</p>

              {/* Points Badge */}
              {achievement.points && (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-wc-gold/20 border border-wc-gold/30">
                    <Star className="w-4 h-4 text-wc-gold" />
                    <span className="text-sm font-bold text-wc-gold">
                      +{achievement.points} points
                    </span>
                  </div>
                </div>
              )}

              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{
                      y: [0, -100, -200],
                      x: [0, Math.random() * 100 - 50],
                      opacity: [1, 1, 0],
                      rotate: [0, Math.random() * 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '50%',
                    }}
                  >
                    <Sparkles
                      className="w-4 h-4"
                      style={{
                        color: ['#FFD700', '#FF6B9D', '#00F5FF'][Math.floor(Math.random() * 3)],
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
