'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy,
  Home,
  Target,
  Medal,
  Award,
  User,
  LogOut,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AchievementProvider } from '@/contexts/AchievementContext';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Trophy, label: 'Make Prediction', href: '/dashboard/predict' },
    { icon: Target, label: 'My Predictions', href: '/dashboard/predictions' },
    { icon: Medal, label: 'Leaderboard', href: '/dashboard/leaderboard' },
    { icon: Award, label: 'Achievements', href: '/dashboard/achievements' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ];

  if (!isAuthenticated) return null;

  return (
    <AchievementProvider>
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button Removed - replaced by Bottom Nav */}
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-wc-gold" />
                <div>
                  <div className="text-xl font-bold gradient-animate bg-clip-text text-transparent">
                    WC2026
                  </div>
                  <div className="text-xs text-muted-foreground">Predictor</div>
                </div>
              </Link>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-semibold">{user?.username}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/profile')}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <motion.aside
          animate={{ width: isSidebarCollapsed ? '80px' : '256px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="hidden md:block min-h-[calc(100vh-73px)] border-r border-white/10 glass relative"
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: isSidebarCollapsed ? 0 : 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-wc-primary text-white'
                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                    }`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-4 w-6 h-6 bg-wc-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-wc-primary/80 transition-colors z-10"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </motion.button>
        </motion.aside>


        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      <MobileBottomNav />
    </div>
    </AchievementProvider>
  );
}
