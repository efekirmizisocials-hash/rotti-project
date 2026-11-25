import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";
import { ItemType } from "../../types";

export const MiniCalendar: React.FC = () => {
  const { items } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  // Generate 7-day strip (today + 6 upcoming days)
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Count tasks/events for this day
      const dateStr = date.toDateString();
      const dayItems = items.filter(
        (item) =>
          item.type === ItemType.TASK &&
          item.dueDate &&
          new Date(item.dueDate).toDateString() === dateStr,
      );

      const completed = dayItems.filter((t) => t.completed).length;
      const total = dayItems.length;

      days.push({
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        isToday: i === 0,
        itemCount: total,
        completedCount: completed,
        hasItems: total > 0,
      });
    }

    return days;
  }, [items]);

  return (
    <WidgetCard
      title="This Week"
      icon={<CalendarIcon className="h-4 w-4 text-indigo-500" />}
      onClick={() => setActiveView("plan" as any)}
      size={getWidgetSize("upcoming")}
      compactContent={
        <div className="text-center">
          <div className="text-2xl mb-1">📅</div>
          <div className="text-lg font-black text-indigo-500">
            {weekDays[0].dayName}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {weekDays[0].itemCount} tasks
          </div>
        </div>
      }
    >
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDays.map((day, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`
                            flex-shrink-0 w-14 p-2 rounded-lg text-center cursor-pointer
                            transition-all hover:scale-105
                            ${
                              day.isToday
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                                : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }
                        `}
            onClick={() => setActiveView("plan" as any)}
          >
            {/* Day name */}
            <div
              className={`text-xs font-medium ${day.isToday ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
            >
              {day.dayName}
            </div>

            {/* Day number */}
            <div
              className={`text-xl font-black ${day.isToday ? "text-white" : "text-slate-800 dark:text-white"}`}
            >
              {day.dayNumber}
            </div>

            {/* Task dots */}
            {day.hasItems && (
              <div className="flex justify-center gap-0.5 mt-1">
                {day.completedCount > 0 && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${day.isToday ? "bg-green-300" : "bg-green-500"}`}
                  />
                )}
                {day.itemCount > day.completedCount && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${day.isToday ? "bg-white/50" : "bg-slate-400"}`}
                  />
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">This week</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {weekDays.reduce((sum, d) => sum + d.itemCount, 0)} tasks
          </span>
        </div>
      </div>
    </WidgetCard>
  );
};
