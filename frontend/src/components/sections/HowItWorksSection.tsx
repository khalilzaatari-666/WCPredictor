'use client';

import { motion } from 'framer-motion';
import { UserPlus, Trophy, Wallet, Award } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Account',
      description: 'Sign up in seconds with email, Google, or crypto wallet.',
      color: 'text-wc-primary',
      bgColor: 'from-wc-primary/20 to-wc-primary/5',
    },
    {
      icon: Trophy,
      title: 'Make Predictions',
      description: 'Build your bracket, predict winners, and submit your predictions.',
      color: 'text-wc-accent',
      bgColor: 'from-wc-accent/20 to-wc-accent/5',
    },
    {
      icon: Wallet,
      title: 'Submit & Pay',
      description: 'Securely pay to lock in your predictions before the tournament starts.',
      color: 'text-wc-gold',
      bgColor: 'from-wc-gold/20 to-wc-gold/5',
    },
    {
      icon: Award,
      title: 'Win Rewards',
      description: 'Earn points, climb leaderboards, and win exclusive prizes!',
      color: 'text-wc-secondary',
      bgColor: 'from-wc-secondary/20 to-wc-secondary/5',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-wc-primary/5 to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-4"
          >
            <Trophy className="w-4 h-4 text-wc-gold" />
            <span className="text-sm font-medium">How It Works</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Start Predicting in
            <br />
            <span className="gradient-animate bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of football fans making predictions for the biggest tournament in the world.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-wc-primary via-wc-accent to-wc-gold opacity-20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="glass-card text-center relative overflow-hidden group"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  <div className="relative z-10">
                    {/* Step Number */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.2 }}
                      className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-wc-primary to-wc-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-wc-primary/50"
                    >
                      {index + 1}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.bgColor} mb-6`}
                    >
                      <step.icon className={`w-10 h-10 ${step.color}`} />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                  />
                </motion.div>

              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started Now</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-wc-accent to-wc-primary"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
