import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SparklesIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUserStats } from "../../hooks/useUserStats";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";
import { ItemType } from "../../types";

export const ProductivityScore: React.FC = () => {
  const { items } = usePlannerItems();
  const { userStats } = useUserStats();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  // Calculate productivity score (0-100)
  const score = useMemo(() => {
    const todayStr = new Date().toDateString();

    // 1. Task completion (40 points max)
    const todayTasks = items.filter(
      (i) =>
        i.type === ItemType.TASK &&
        i.dueDate &&
        new Date(i.dueDate).toDateString() === todayStr,
    );
    const completedTasks = todayTasks.filter((t) => t.completed).length;
    const taskScore =
      todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 40 : 0;

    // 2. Habit completion (30 points max)
    const todayHabits = items.filter((i) => i.type === ItemType.HABIT);
    const completedHabits = todayHabits.filter((h) => {
      if (!h.lastCompletedDate) return false;
      return new Date(h.lastCompletedDate).toDateString() === todayStr;
    }).length;
    const habitScore =
      todayHabits.length > 0 ? (completedHabits / todayHabits.length) * 30 : 0;

    // 3. Focus points (30 points max - normalized to 100 points = 30)
    const focusScore = Math.min((userStats.totalFocusPoints / 100) * 30, 30);

    const total = Math.round(taskScore + habitScore + focusScore);

    return {
      total: Math.min(total, 100),
      breakdown: {
        tasks: Math.round(taskScore),
        habits: Math.round(habitScore),
        focus: Math.round(focusScore),
      },
    };
  }, [items, userStats.totalFocusPoints]);

  // Get score color and label
  const getScoreInfo = (score: number) => {
    if (score >= 90)
      return {
        color: "from-green-500 to-emerald-600",
        label: "Exceptional",
        emoji: "🚀",
      };
    if (score >= 75)
      return {
        color: "from-blue-500 to-indigo-600",
        label: "Great",
        emoji: "⭐",
      };
    if (score >= 60)
      return {
        color: "from-purple-500 to-pink-600",
        label: "Good",
        emoji: "👍",
      };
    if (score >= 40)
      return {
        color: "from-yellow-500 to-orange-600",
        label: "Fair",
        emoji: "📈",
      };
    return {
      color: "from-slate-400 to-slate-600",
      label: "Getting Started",
      emoji: "🌱",
    };
  };

  const scoreInfo = getScoreInfo(score.total);

  // Calculate trend vs yesterday (simplified - would need historical data)
  const trend =
    score.total >= 70 ? "up" : score.total >= 40 ? "stable" : "down";
  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";

  return (
    <WidgetCard
      title="Productivity Score"
      icon={<SparklesIcon className="h-4 w-4 text-purple-500" />}
      size={getWidgetSize("productivityScore")}
      compactContent={
        <div className="text-center">
          <div className="text-3xl mb-1">{scoreInfo.emoji}</div>
          <div
            className={`text-2xl font-black bg-gradient-to-r ${scoreInfo.color} bg-clip-text text-transparent`}
          >
            {score.total}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {scoreInfo.label}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Score display */}
        <div className="text-center">
          <motion.div
            className={`text-5xl font-black bg-gradient-to-r ${scoreInfo.color} bg-clip-text text-transparent`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {score.total}
          </motion.div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {scoreInfo.label}
            </span>
            <span className="text-lg">{scoreInfo.emoji}</span>
            <span className="text-sm text-slate-500">{trendIcon}</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Breakdown
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Tasks
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-brand rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score.breakdown.tasks / 40) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                {score.breakdown.tasks}
              </span>
            </div>
          </div>

          {/* Habits */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Habits
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score.breakdown.habits / 30) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                {score.breakdown.habits}
              </span>
            </div>
          </div>

          {/* Focus */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Focus
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score.breakdown.focus / 30) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">
                {score.breakdown.focus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};
