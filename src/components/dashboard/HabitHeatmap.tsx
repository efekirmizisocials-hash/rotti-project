import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FireIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";
import { ItemType } from "../../types";

export const HabitHeatmap: React.FC = () => {
  const { items: plannerItems } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  // Get all habits
  const habits = useMemo(
    () => plannerItems.filter((i) => i.type === ItemType.HABIT),
    [plannerItems],
  );

  // Generate last 12 weeks of data (84 days)
  const heatmapData = useMemo(() => {
    const days = 84;
    const today = new Date();
    const data: Array<{ date: string; count: number; percentage: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      // Count completed habits for this day
      const completedCount = habits.filter((h) => {
        if (!h.lastCompletedDate) return false;
        return new Date(h.lastCompletedDate).toDateString() === dateStr;
      }).length;

      const totalHabits = habits.length || 1;
      const percentage = (completedCount / totalHabits) * 100;

      data.push({
        date: dateStr,
        count: completedCount,
        percentage,
      });
    }

    return data;
  }, [habits]);

  // Get color intensity based on completion percentage
  const getColor = (percentage: number) => {
    if (percentage === 0) return "bg-slate-100 dark:bg-slate-800";
    if (percentage < 25) return "bg-orange-200 dark:bg-orange-900/40";
    if (percentage < 50) return "bg-orange-300 dark:bg-orange-700/60";
    if (percentage < 75) return "bg-orange-400 dark:bg-orange-600/80";
    return "bg-orange-500 dark:bg-orange-500";
  };

  // Group by weeks (12 rows of 7 days)
  const weeks = useMemo(() => {
    const result: (typeof heatmapData)[] = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
      result.push(heatmapData.slice(i, i + 7));
    }
    return result;
  }, [heatmapData]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const reversedData = [...heatmapData].reverse();
    for (const day of reversedData) {
      if (day.count > 0) streak++;
      else break;
    }
    return streak;
  }, [heatmapData]);

  return (
    <WidgetCard
      title="Habit Streak"
      icon={<FireIcon className="h-4 w-4 text-orange-500" />}
      onClick={() => setActiveView("plan" as any)}
      size={getWidgetSize("habits")}
      compactContent={
        <div className="text-center">
          <motion.div
            className="text-3xl mb-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🔥
          </motion.div>
          <div className="text-2xl font-black text-orange-500">
            {currentStreak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">days</div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Streak info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🔥
            </motion.span>
            <div>
              <div className="text-2xl font-black text-orange-500">
                {currentStreak} days
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Current streak
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {habits.length} habits
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              tracked
            </div>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Last 12 weeks
          </div>
          <div className="flex flex-col gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex gap-1">
                {week.map((day, dayIdx) => (
                  <motion.div
                    key={dayIdx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                    className={`w-3 h-3 rounded-sm ${getColor(day.percentage)} transition-colors cursor-pointer hover:ring-2 hover:ring-orange-400`}
                    title={`${day.date}: ${day.count} habits completed`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-900/40" />
              <div className="w-3 h-3 rounded-sm bg-orange-300 dark:bg-orange-700/60" />
              <div className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-600/80" />
              <div className="w-3 h-3 rounded-sm bg-orange-500 dark:bg-orange-500" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};
