'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LearningProgress {
  completedLessons: string[];
  xp: number;
  streak: number;
  lastActive: string;
}

const DEFAULT: LearningProgress = {
  completedLessons: [],
  xp: 0,
  streak: 1,
  lastActive: new Date().toISOString().split('T')[0],
};

export function useLearningProgress(slug: string) {
  const storageKey = `learning-progress-${slug}`;
  const [progress, setProgress] = useState<LearningProgress>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  const completeLesson = useCallback(
    (lessonId: string, xpReward: number) => {
      setProgress(prev => {
        if (prev.completedLessons.includes(lessonId)) return prev;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak =
          prev.lastActive === yesterday ? prev.streak + 1 :
          prev.lastActive === today ? prev.streak : 1;

        const next: LearningProgress = {
          completedLessons: [...prev.completedLessons, lessonId],
          xp: prev.xp + xpReward,
          streak: newStreak,
          lastActive: today,
        };

        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}

        return next;
      });
    },
    [storageKey],
  );

  const isCompleted = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons],
  );

  const resetProgress = useCallback(() => {
    localStorage.removeItem(storageKey);
    setProgress(DEFAULT);
  }, [storageKey]);

  return { progress, completeLesson, isCompleted, hydrated, resetProgress };
}
