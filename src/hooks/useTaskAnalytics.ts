import { useState, useCallback } from "react";
import { PlannerItem, EnergyLevel } from "../types";
import { getEnergyMatchDiff } from "../utils/energyMatch";
import { newId, readCollection, writeCollection } from "../mocks/localDb";

const STORAGE_KEY = "completion-events";
const MAX_EVENTS = 200;

interface CompletionEvent {
  id: string;
  taskId?: string;
  taskTitle: string;
  taskType: string;
  taskCategory?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  wasOnTime?: boolean;
  energyMatchScore?: number;
  completedHourOfDay: number;
  createdAt: string;
}

const readEvents = (): CompletionEvent[] =>
  readCollection<CompletionEvent[]>(STORAGE_KEY) ?? [];

/**
 * Hook for logging and querying task completion patterns.
 * Showcase build: events are kept in localStorage (last 200).
 */
export function useTaskAnalytics() {
  const [isLogging, setIsLogging] = useState(false);

  const logCompletion = useCallback(
    async (item: PlannerItem, currentEnergy?: EnergyLevel) => {
      setIsLogging(true);
      const now = new Date();
      const event: CompletionEvent = {
        id: newId(),
        taskId: item.id,
        taskTitle: item.title,
        taskType: item.type,
        taskCategory: item.category,
        estimatedMinutes: item.estimatedMinutes ?? undefined,
        wasOnTime: item.dueDate ? new Date(item.dueDate) >= now : undefined,
        energyMatchScore:
          currentEnergy && item.energyLevel
            ? getEnergyMatchDiff(item.energyLevel, currentEnergy)
            : undefined,
        completedHourOfDay: now.getHours(),
        createdAt: now.toISOString(),
      };
      writeCollection(
        STORAGE_KEY,
        [event, ...readEvents()].slice(0, MAX_EVENTS),
      );
      setIsLogging(false);
    },
    [],
  );

  const getCategoryPatterns = useCallback(async (category: string) => {
    return readEvents()
      .filter((e) => e.taskCategory === category)
      .slice(0, 50);
  }, []);

  const getAverageDuration = useCallback(
    async (category?: string, _titleKeywords?: string[]) => {
      const durations = readEvents()
        .filter((e) => !category || e.taskCategory === category)
        .map((e) => e.actualMinutes)
        .filter((m): m is number => typeof m === "number" && m > 0);
      if (durations.length === 0) return null;
      return Math.round(
        durations.reduce((a, b) => a + b, 0) / durations.length,
      );
    },
    [],
  );

  const getProductivityInsights = useCallback(async () => {
    const events = readEvents();
    if (events.length === 0) return null;
    const timed = events.filter((e) => e.wasOnTime !== undefined);
    const onTimeRate = timed.length
      ? Math.round(
          (timed.filter((e) => e.wasOnTime).length / timed.length) * 100,
        )
      : null;
    const byHour = new Map<number, number>();
    events.forEach((e) =>
      byHour.set(
        e.completedHourOfDay,
        (byHour.get(e.completedHourOfDay) ?? 0) + 1,
      ),
    );
    const mostProductiveHour =
      [...byHour.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { totalCompleted: events.length, onTimeRate, mostProductiveHour };
  }, []);

  return {
    logCompletion,
    getCategoryPatterns,
    getAverageDuration,
    getProductivityInsights,
    isLogging,
  };
}
