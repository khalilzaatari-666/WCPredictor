'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Shield,
  Gift,
  Globe,
  Wallet,
  Star,
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Trophy,
      title: 'Bracket Predictions',
      description: 'Build your complete World Cup bracket from group stage to finals.',
      color: 'text-wc-gold',
      bgColor: 'bg-wc-gold/10',
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Get instant updates as matches progress and see how your predictions stack up.',
      color: 'text-wc-primary',
      bgColor: 'bg-wc-primary/10',
    },
    {
      icon: Shield,
      title: 'Secure & Fair',
      description: 'Blockchain-powered predictions ensure transparency and tamper-proof results.',
      color: 'text-wc-accent',
      bgColor: 'bg-wc-accent/10',
    },
    {
      icon: Gift,
      title: 'Win Rewards',
      description: 'Earn exclusive NFTs, prizes, and bragging rights for accurate predictions.',
      color: 'text-wc-secondary',
      bgColor: 'bg-wc-secondary/10',
    },
    {
      icon: Globe,
      title: 'Global Leaderboard',
      description: 'Compete with fans worldwide and climb the rankings based on your prediction accuracy.',
      color: 'text-wc-primary',
      bgColor: 'bg-wc-primary/10',
    },
    {
      icon: Wallet,
      title: 'Flexible Payments',
      description: 'Pay with credit card, cryptocurrency, or crypto wallet for ultimate flexibility.',
      color: 'text-wc-accent',
      bgColor: 'bg-wc-accent/10',
    },
    {
      icon: Star,
      title: 'Achievement System',
      description: 'Collect badges, unlock achievements, and track your progress throughout the tournament.',
      color: 'text-wc-secondary',
      bgColor: 'bg-wc-secondary/10',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 stadium-pattern opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-4"
          >
            <Star className="w-4 h-4 text-wc-gold" />
            <span className="text-sm font-medium">Features</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Everything You Need to
            <br />
            <span className="gradient-animate bg-clip-text text-transparent">
              Predict Like a Pro
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to give you the ultimate World Cup prediction experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:[&>*:last-child:nth-child(3n+1)]:col-start-2"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card group cursor-pointer relative overflow-hidden"
            >
              {/* Gradient Overlay on Hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${
                    feature.bgColor === 'bg-wc-gold/10'
                      ? 'rgba(251, 191, 36, 0.1)'
                      : feature.bgColor === 'bg-wc-primary/10'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : feature.bgColor === 'bg-wc-accent/10'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(244, 63, 94, 0.1)'
                  } 0%, transparent 100%)`,
                }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-4`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-wc-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>

                {/* Decorative Element */}
                <motion.div
                  className={`absolute top-0 right-0 w-20 h-20 ${feature.bgColor} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
