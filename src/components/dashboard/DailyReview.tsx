import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { ItemType } from "../../types";

export const DailyReview: React.FC = () => {
  const { items } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const [journalEntry, setJournalEntry] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in evening (after 5 PM)
  const shouldShow = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 17; // 5 PM or later
  }, []);

  // Calculate today's accomplishments
  const todayStats = useMemo(() => {
    const todayStr = new Date().toDateString();

    const completedTasks = items.filter(
      (i) =>
        i.type === ItemType.TASK &&
        i.completed &&
        i.completedDate &&
        new Date(i.completedDate).toDateString() === todayStr,
    );

    const completedHabits = items.filter(
      (i) =>
        i.type === ItemType.HABIT &&
        i.lastCompletedDate &&
        new Date(i.lastCompletedDate).toDateString() === todayStr,
    );

    return {
      tasks: completedTasks.length,
      habits: completedHabits.length,
      total: completedTasks.length + completedHabits.length,
    };
  }, [items]);

  // Tomorrow's top 3 priorities (incomplete tasks due tomorrow)
  const tomorrowPriorities = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    return items
      .filter(
        (i) =>
          i.type === ItemType.TASK &&
          !i.completed &&
          i.dueDate &&
          new Date(i.dueDate).toDateString() === tomorrowStr,
      )
      .slice(0, 3);
  }, [items]);

  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-white/20 dark:border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <span className="text-2xl">🌙</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              Daily Review
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Time to reflect and plan ahead
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-brand hover:underline"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Today's Accomplishments */}
      <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
          Today's Wins
        </h4>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-brand">
              {todayStats.tasks}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Tasks
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-orange-500">
              {todayStats.habits}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Habits
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-500">
              {todayStats.total}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          {/* Journal Entry */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              How was your day?
            </label>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Reflect on your day... What went well? What could be better?"
              className="w-full h-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          {/* Tomorrow's Priorities */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tomorrow's Top 3
            </h4>
            {tomorrowPriorities.length > 0 ? (
              <div className="space-y-2">
                {tomorrowPriorities.map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <span className="text-xs font-bold text-brand w-5">
                      #{idx + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">
                No tasks scheduled for tomorrow
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("plan" as any)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-brand to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-shadow"
            >
              Plan Tomorrow
            </button>
            <button
              onClick={() => {
                // Save journal entry (would integrate with backend)
                setJournalEntry("");
                setIsExpanded(false);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Save & Close
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
