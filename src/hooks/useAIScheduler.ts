import { useState, useCallback } from "react";
import { PlannerItem, EnergyLevel } from "../types";

interface ScheduleSuggestion {
  taskId: string;
  suggestedSlot: string; // ISO timestamp
  reason: string;
  confidence: number; // 0-100
}

interface AutoScheduleResult {
  suggestions: ScheduleSuggestion[];
  summary: string;
}

interface AutoScheduleContext {
  currentTime: Date;
  currentEnergy: EnergyLevel;
  availableSlots: Date[]; // Available hourly slots for today
  scheduledTasks: PlannerItem[]; // Already scheduled tasks
}

/**
 * Mock auto-scheduler for the showcase build.
 *
 * The full app asks a language model to place tasks into free time slots.
 * Here no model is called: tasks are simply assigned, in order, to the
 * next free slots and a fixed explanation is returned.
 */
export function useAIScheduler() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [error] = useState<string | null>(null);

  const scheduleTasksWithAI = useCallback(
    async (
      unscheduledTasks: PlannerItem[],
      context: AutoScheduleContext,
    ): Promise<AutoScheduleResult | null> => {
      if (unscheduledTasks.length === 0) return null;

      setIsScheduling(true);
      await new Promise((r) => setTimeout(r, 600));

      const slots = context.availableSlots.filter(
        (s) => s.getTime() >= context.currentTime.getTime(),
      );
      const suggestions: ScheduleSuggestion[] = unscheduledTasks
        .slice(0, slots.length)
        .map((task, i) => ({
          taskId: task.id,
          suggestedSlot: slots[i].toISOString(),
          reason: "Demo suggestion: next free slot.",
          confidence: 70,
        }));

      setIsScheduling(false);
      return {
        suggestions,
        summary: `Demo mode: scheduled ${suggestions.length} task${suggestions.length === 1 ? "" : "s"} into free slots.`,
      };
    },
    [],
  );

  return { scheduleTasksWithAI, isScheduling, error };
}
