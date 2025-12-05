'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AchievementToast from '@/components/ui/AchievementToast';

interface Achievement {
  name: string;
  description: string;
  icon?: string;
  points?: number;
}

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  const showAchievement = useCallback((achievement: Achievement) => {
    if (currentAchievement) {
      // If there's already an achievement showing, add to queue
      setQueue((prev) => [...prev, achievement]);
    } else {
      setCurrentAchievement(achievement);
    }
  }, [currentAchievement]);

  const handleClose = useCallback(() => {
    setCurrentAchievement(null);

    // Show next achievement from queue if any
    setTimeout(() => {
      setQueue((prev) => {
        if (prev.length > 0) {
          setCurrentAchievement(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 300);
  }, []);

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      <AchievementToast achievement={currentAchievement} onClose={handleClose} />
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievement must be used within AchievementProvider');
  }
  return context;
}
