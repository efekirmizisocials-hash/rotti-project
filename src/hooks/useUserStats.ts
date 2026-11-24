/**
 * useUserStats (showcase build): focus-point stats kept in localStorage.
 */

import { useCallback } from "react";
import { create } from "zustand";
import { readCollection, writeCollection } from "../mocks/localDb";

const STORAGE_KEY = "user-stats";

export interface UserStats {
  totalFocusPoints: number;
  dailyFocusStreak: number;
  lastFocusSessionDate: string | null;
}

interface UseUserStatsReturn {
  userStats: UserStats;
  loading: boolean;
  error: string | null;
  updateStats: (updates: Partial<UserStats>) => Promise<UserStats>;
  refetch: () => Promise<void>;
}

const defaultStats: UserStats = {
  totalFocusPoints: 0,
  dailyFocusStreak: 0,
  lastFocusSessionDate: null,
};

const loadStats = (): UserStats => ({
  ...defaultStats,
  ...(readCollection<UserStats>(STORAGE_KEY) ?? {}),
});

const useStatsStore = create<{ stats: UserStats }>(() => ({
  stats: loadStats(),
}));

useStatsStore.subscribe((state, prev) => {
  if (state.stats !== prev.stats) writeCollection(STORAGE_KEY, state.stats);
});

export function resetUserStats(): void {
  useStatsStore.setState({ stats: defaultStats });
}

export function useUserStats(): UseUserStatsReturn {
  const userStats = useStatsStore((s) => s.stats);

  const updateStats = useCallback(
    async (updates: Partial<UserStats>): Promise<UserStats> => {
      const next = { ...useStatsStore.getState().stats, ...updates };
      useStatsStore.setState({ stats: next });
      return next;
    },
    [],
  );

  const refetch = useCallback(async () => {
    useStatsStore.setState({ stats: loadStats() });
  }, []);

  return { userStats, loading: false, error: null, updateStats, refetch };
}

export default useUserStats;
