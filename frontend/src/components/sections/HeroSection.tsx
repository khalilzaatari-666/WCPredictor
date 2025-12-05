'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function HeroSection() {
  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: '10K+' },
    { icon: Trophy, label: 'Predictions', value: '50K+' },
    { icon: TrendingUp, label: 'Accuracy', value: '87%' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 stadium-pattern">
        <div className="absolute inset-0 gradient-animate opacity-30" />

        {/* Floating Soccer Balls */}
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 text-8xl opacity-10"
        >
          ⚽
        </motion.div>
        <motion.div
          animate={floatingAnimation}
          transition={{ delay: 1 }}
          className="absolute bottom-20 right-20 text-6xl opacity-10"
        >
          ⚽
        </motion.div>
        <motion.div
          animate={floatingAnimation}
          transition={{ delay: 2 }}
          className="absolute top-1/2 right-10 text-7xl opacity-10"
        >
          🏆
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-wc-gold" />
              <span className="text-sm font-medium">FIFA World Cup 2026</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
            >
              Predict the{' '}
              <span className="gradient-animate bg-clip-text text-transparent inline-block trophy-shine">
                Future
              </span>
              <br />
              Win Big! 🏆
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto"
            >
              Make your predictions for FIFA World Cup 2026. Compete with fans worldwide,
              unlock achievements, and win exclusive rewards!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Start Predicting</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-wc-primary to-wc-accent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </Link>

              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="glass-card text-center group hover:scale-105 transition-transform cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-wc-primary/20 mb-2"
                  >
                    <stat.icon className="w-6 h-6 text-wc-primary" />
                  </motion.div>
                  <div className="text-2xl font-bold text-wc-gold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-wc-primary/50 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-wc-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
