import { useMemo } from "react";
import { PlannerItem, EnergyLevel, Priority } from "../types";

interface TaskSuggestion {
  task: PlannerItem;
  score: number;
  reasons: string[];
}

interface SmartSuggestionsContext {
  currentTime: Date;
  currentEnergy: EnergyLevel;
  availableMinutes?: number; // Time available until next scheduled item
}

/**
 * Smart task suggestion algorithm
 * Suggests tasks based on:
 * - Energy level match
 * - Priority
 * - Due date urgency
 * - Time fit (estimated duration vs available time)
 */
export function useSmartSuggestions(
  tasks: PlannerItem[],
  context: SmartSuggestionsContext,
): TaskSuggestion[] {
  const suggestions = useMemo(() => {
    const { currentTime, currentEnergy, availableMinutes = 480 } = context;

    const energyLevels = {
      [EnergyLevel.PEAK]: 4,
      [EnergyLevel.HIGH]: 3,
      [EnergyLevel.MEDIUM]: 2,
      [EnergyLevel.LOW]: 1,
    };

    const priorityWeights = {
      [Priority.HIGH]: 3,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 1,
    };

    const scored: TaskSuggestion[] = tasks.map((task) => {
      const reasons: string[] = [];
      let score = 0;

      // 1. Energy Match Score (0-10 points)
      if (task.energyLevel) {
        const taskEnergyValue = energyLevels[task.energyLevel];
        const currentEnergyValue = energyLevels[currentEnergy];
        const energyDiff = Math.abs(taskEnergyValue - currentEnergyValue);

        if (energyDiff === 0) {
          score += 10;
          reasons.push(`✨ Perfect energy match (${task.energyLevel})`);
        } else if (energyDiff === 1) {
          score += 6;
          reasons.push(`⚡ Good energy match`);
        } else if (energyDiff === 2) {
          score += 3;
          reasons.push(`Energy mismatch`);
        } else {
          score += 0;
          reasons.push(`⚠️ Save for when you have more energy`);
        }
      } else {
        // No energy requirement = flexible
        score += 5;
      }

      // 2. Priority Score (0-9 points)
      const priorityScore = priorityWeights[task.priority] * 3;
      score += priorityScore;
      if (task.priority === Priority.HIGH) {
        reasons.push(`🔴 High priority`);
      }

      // 3. Due Date Urgency (0-8 points)
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const hoursUntilDue =
          (dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDue < 0) {
          // Overdue!
          score += 8;
          reasons.push(`⏰ OVERDUE!`);
        } else if (hoursUntilDue < 4) {
          // Due very soon
          score += 7;
          reasons.push(`⏰ Due in ${Math.round(hoursUntilDue)}h`);
        } else if (hoursUntilDue < 24) {
          // Due today
          score += 5;
          reasons.push(`📅 Due today`);
        } else if (hoursUntilDue < 48) {
          // Due tomorrow
          score += 3;
          reasons.push(`📅 Due tomorrow`);
        } else {
          score += 1;
        }
      }

      // 4. Time Fit Score (0-5 points)
      const estimatedMinutes = task.estimatedMinutes || 30;
      if (estimatedMinutes <= availableMinutes) {
        const fitRatio = estimatedMinutes / availableMinutes;
        if (fitRatio < 0.3) {
          // Quick task
          score += 5;
          reasons.push(`⚡ Quick win (${estimatedMinutes}min)`);
        } else if (fitRatio < 0.7) {
          // Good fit
          score += 4;
          reasons.push(`✓ Fits your schedule (${estimatedMinutes}min)`);
        } else {
          // Takes most of available time
          score += 2;
          reasons.push(`Needs ${estimatedMinutes}min`);
        }
      } else {
        // Doesn't fit
        score -= 3;
        reasons.push(`⚠️ Not enough time (needs ${estimatedMinutes}min)`);
      }

      // 5. Time of Day Bonus (0-3 points)
      const hour = currentTime.getHours();

      // Morning boost for PEAK energy tasks
      if (hour >= 8 && hour < 12 && task.energyLevel === EnergyLevel.PEAK) {
        score += 3;
        reasons.push(`🌅 Perfect for morning focus`);
      }

      // Afternoon boost for MEDIUM energy tasks
      if (hour >= 14 && hour < 17 && task.energyLevel === EnergyLevel.MEDIUM) {
        score += 2;
      }

      // Evening boost for LOW energy tasks
      if (hour >= 17 && task.energyLevel === EnergyLevel.LOW) {
        score += 2;
        reasons.push(`🌙 Perfect for evening`);
      }

      return {
        task,
        score,
        reasons:
          reasons.length > 0
            ? reasons.slice(0, 3)
            : ["Consider tackling this next"],
      };
    });

    // Sort by score (highest first)
    return scored.sort((a, b) => b.score - a.score);
  }, [
    tasks,
    context.currentTime,
    context.currentEnergy,
    context.availableMinutes,
  ]);

  return suggestions;
}

/**
 * Get the single best task suggestion
 */
export function useNextBestTask(
  tasks: PlannerItem[],
  context: SmartSuggestionsContext,
): TaskSuggestion | null {
  const suggestions = useSmartSuggestions(tasks, context);
  return suggestions.length > 0 ? suggestions[0] : null;
}

/**
 * Get top N task suggestions
 */
export function useTopSuggestions(
  tasks: PlannerItem[],
  context: SmartSuggestionsContext,
  count: number = 3,
): TaskSuggestion[] {
  const suggestions = useSmartSuggestions(tasks, context);
  return suggestions.slice(0, count);
}
