'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Trophy, Plus, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'My Predictions',
      href: '/dashboard/predictions',
      icon: Target,
    },
    {
      label: 'Predict',
      href: '/dashboard/predict',
      icon: Plus,
      isPrimary: true,
    },
    {
      label: 'Achievements',
      href: '/dashboard/achievements',
      icon: Award,
    },
    {
      label: 'Leaderboard',
      href: '/dashboard/leaderboard',
      icon: Trophy,
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 glass">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isPrimary = item.isPrimary;

          if (isPrimary) {
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative -top-6"
                >
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center shadow-lg
                    gradient-gold text-black
                    border-4 border-background
                  `}>
                    <Plus className="w-8 h-8" strokeWidth={3} />
                  </div>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-wc-gold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
