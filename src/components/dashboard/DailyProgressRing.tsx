import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUserStats } from "../../hooks/useUserStats";
import { useFinances } from "../../hooks/useFinances";
import { useUIStore } from "../../store/uiStore";
import { ItemType } from "../../types";

export const DailyProgressRing: React.FC = () => {
  const { items } = usePlannerItems();
  const { userStats } = useUserStats();
  const { analytics } = useFinances();
  const setActiveView = useUIStore((state) => state.setActiveView);

  // Calculate today's task completion
  const todayProgress = useMemo(() => {
    const todayStr = new Date().toDateString();
    const todayTasks = items.filter(
      (i) =>
        i.type === ItemType.TASK &&
        i.dueDate &&
        new Date(i.dueDate).toDateString() === todayStr,
    );
    const completed = todayTasks.filter((t) => t.completed).length;
    const total = todayTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  }, [items]);

  // SVG circle calculations
  const size = 100;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (todayProgress.percentage / 100) * circumference;

  const stats = [
    {
      icon: "✅",
      label: "Tasks",
      value: `${todayProgress.completed}/${todayProgress.total}`,
      color: "text-emerald-500",
      onClick: () => setActiveView("plan"),
    },
    {
      icon: "⚡",
      label: "Focus",
      value: userStats.totalFocusPoints,
      color: "text-brand",
      onClick: undefined,
    },
    {
      icon: "🔥",
      label: "Streak",
      value: userStats.dailyFocusStreak,
      color: "text-orange-500",
      onClick: undefined,
      animate: true,
    },
    {
      icon: "💰",
      label: "Balance",
      value: `$${analytics.totalBalance.toLocaleString()}`,
      color: "text-green-500",
      onClick: () => setActiveView("finances" as any),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 dark:border-white/10 shadow-sm"
    >
      <div className="flex items-center gap-6">
        {/* Progress Ring */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-purple-500/20 rounded-full blur-xl" />
          <svg
            width={size}
            height={size}
            className="relative transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700"
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-2xl font-black bg-gradient-to-r from-brand to-purple-600 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {Math.round(todayProgress.percentage)}%
            </motion.div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              done
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          {stats.map((stat, i) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={stat.onClick}
              className="group bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-100 dark:border-slate-600/50 hover:border-slate-200 dark:hover:border-slate-500/50"
            >
              <div className="flex items-center gap-2">
                {stat.animate ? (
                  <motion.span
                    className="text-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {stat.icon}
                  </motion.span>
                ) : (
                  <span className="text-lg">{stat.icon}</span>
                )}
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div
                    className={`text-lg font-black ${stat.color} leading-tight`}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
