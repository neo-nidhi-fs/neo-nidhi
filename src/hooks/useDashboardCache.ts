'use client';

import { useCallback } from 'react';
import { IChallenge } from '@/types';

export interface DashboardUserSnapshot {
  name?: string;
  savingsBalance: number;
  fd: number;
  rd?: number;
  loanBalance: number;
  accruedRdInterest?: number;
  mpin?: string | null;
  features?: Record<string, unknown>;
  financeFeaturesEnabled?: boolean;
}

export interface CreditScoreSnapshot {
  score: number;
  rating: string;
  source: string;
}

export interface DashboardCacheSnapshot {
  user: DashboardUserSnapshot;
  activeChallenges: IChallenge[];
  creditScoreData: CreditScoreSnapshot | null;
  savedAt: number;
}

function getCacheKey(userId: string) {
  return `dashboard_cache_${userId}`;
}

export function useDashboardCache(userId: string) {
  const readCache = useCallback((): DashboardCacheSnapshot | null => {
    if (!userId || typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(getCacheKey(userId));
      if (!raw) return null;
      return JSON.parse(raw) as DashboardCacheSnapshot;
    } catch {
      return null;
    }
  }, [userId]);

  const saveCache = useCallback(
    (snapshot: Omit<DashboardCacheSnapshot, 'savedAt'>) => {
      if (!userId || typeof window === 'undefined') return;
      try {
        const entry: DashboardCacheSnapshot = { ...snapshot, savedAt: Date.now() };
        localStorage.setItem(getCacheKey(userId), JSON.stringify(entry));
      } catch {
        // localStorage quota exceeded or unavailable — silently ignore
      }
    },
    [userId]
  );

  const clearCache = useCallback(() => {
    if (!userId || typeof window === 'undefined') return;
    try {
      localStorage.removeItem(getCacheKey(userId));
    } catch {
      // ignore
    }
  }, [userId]);

  return { readCache, saveCache, clearCache };
}
