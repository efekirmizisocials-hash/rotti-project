import React, { useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ListIcon,
  CalendarDaysIcon,
  FireIcon,
} from "./icons";
import { EnergyLevel, PlannerItem, Priority } from "../types";
import PlannerItemComponent from "./task-items/PlannerItem";
import { useProjects } from "../hooks/useProjects";
import { useItemHandlers } from "../hooks/useItemHandlers";
import { useLocalization } from "../contexts/LocalizationContext";
import { useUIStore } from "../store/uiStore";

interface WeekViewProps {
  items: PlannerItem[];
  onUpdateItemDate: (itemId: string, newDate: string | null) => void;
  onItemClick: (item: PlannerItem) => void;
}

interface DayData {
  date: Date;
  dateKey: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  isPast: boolean;
  items: PlannerItem[];
  amItems: PlannerItem[];
  pmItems: PlannerItem[];
  completionRate: number;
  capacity: number; // 0-100%
}

const WeekView: React.FC<WeekViewProps> = ({
  items,
  onUpdateItemDate,
  onItemClick,
}) => {
  const { projects } = useProjects();
  const itemHandlers = useItemHandlers();
  const { language } = useLocalization();
  const weekStartPref = useUIStore((state) => state.weekStart);
  const [draggedItem, setDraggedItem] = useState<PlannerItem | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate week days based on current date + offset
  const { weekStart, weekEnd, weekDays } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);

    const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff =
      weekStartPref === "monday"
        ? currentDay === 0
          ? 6
          : currentDay - 1
        : currentDay;

    start.setDate(today.getDate() - diff + weekOffset * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });

    return { weekStart: start, weekEnd: end, weekDays: days };
  }, [weekOffset, weekStartPref]);

  // Process day data with insights
  const daysData: DayData[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentHour = new Date().getHours();

    return weekDays.map((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;

      // Filter items for this day
      const dayItems = items.filter((item) => {
        if (!item.dueDate && !item.startDate) return false;
        const itemDate = new Date(item.dueDate || item.startDate!);
        return itemDate.toDateString() === date.toDateString();
      });

      // Split AM/PM
      const amItems = dayItems.filter((item) => {
        const time = new Date(item.startDate || item.dueDate!);
        return time.getHours() < 12;
      });

      const pmItems = dayItems.filter((item) => {
        const time = new Date(item.startDate || item.dueDate!);
        return time.getHours() >= 12;
      });

      // Calculate metrics
      const completed = dayItems.filter((i) => i.completed).length;
      const total = dayItems.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Capacity: estimate based on estimated minutes (assume 8hr workday = 480min)
      const totalMinutes = dayItems.reduce(
        (sum, item) => sum + (item.estimatedMinutes || 30),
        0,
      );
      const capacity = Math.min(100, (totalMinutes / 480) * 100);

      return {
        date,
        dateKey,
        dayName: date.toLocaleDateString(language, { weekday: "short" }),
        dayNum: date.getDate(),
        isToday,
        isPast,
        items: dayItems,
        amItems,
        pmItems,
        completionRate,
        capacity,
      };
    });
  }, [weekDays, items, language]);

  // Week-level insights
  const weekInsights = useMemo(() => {
    const totalTasks = daysData.reduce((sum, day) => sum + day.items.length, 0);
    const totalCompleted = daysData.reduce(
      (sum, day) => sum + day.items.filter((i) => i.completed).length,
      0,
    );
    const avgCapacity =
      daysData.reduce((sum, day) => sum + day.capacity, 0) / 7;

    const busiestDay = daysData.reduce((max, day) =>
      day.items.length > max.items.length ? day : max,
    );

    const lightestDay = daysData
      .filter((d) => d.items.length > 0)
      .reduce(
        (min, day) => (day.items.length < min.items.length ? day : min),
        daysData[0],
      );

    return {
      totalTasks,
      totalCompleted,
      completionRate: totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0,
      avgCapacity,
      busiestDay,
      lightestDay,
    };
  }, [daysData]);

  // Get period status (energy & count)
  const getPeriodStatus = (items: PlannerItem[]) => {
    if (items.length === 0)
      return { emoji: "😴", label: "Rest", color: "text-slate-400" };

    // Calculate max energy
    const energyLevels = {
      [EnergyLevel.LOW]: 1,
      [EnergyLevel.MEDIUM]: 2,
      [EnergyLevel.HIGH]: 3,
      [EnergyLevel.PEAK]: 4,
    };
    const maxEnergy = Math.max(
      ...items.map(
        (i) => energyLevels[i.energyLevel || EnergyLevel.MEDIUM] || 2,
      ),
      0,
    );

    // Calculate intensity based on count and energy
    const count = items.length;

    if (maxEnergy === 4)
      return { emoji: "🔥", label: "Peak", color: "text-rose-500" };
    if (maxEnergy === 3)
      return { emoji: "⚡", label: "High", color: "text-amber-500" };
    if (count > 4)
      return { emoji: "😤", label: "Busy", color: "text-orange-500" };
    if (count > 2)
      return { emoji: "💪", label: "Steady", color: "text-blue-500" };

    return { emoji: "☕", label: "Light", color: "text-green-500" };
  };

  // Get capacity color
  const getCapacityColor = (capacity: number) => {
    if (capacity < 50) return "from-green-500 to-emerald-500";
    if (capacity < 80) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const handleDragStart = (e: React.DragEvent, item: PlannerItem) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, date: Date, period: "am" | "pm") => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain") || draggedItem?.id;

    if (itemId && itemHandlers.handleUpdateItem) {
      const newDate = new Date(date);
      newDate.setHours(period === "am" ? 9 : 14, 0, 0, 0);

      itemHandlers.handleUpdateItem(itemId, {
        startDate: newDate.toISOString(),
        dueDate: newDate.toISOString(),
      });
      setDraggedItem(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Week Overview Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 border border-indigo-500/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent dark:from-slate-900/50" />

        <div className="relative space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                  📆{" "}
                  {weekOffset === 0
                    ? "This Week"
                    : weekOffset === 1
                      ? "Next Week"
                      : weekOffset === -1
                        ? "Last Week"
                        : "Week"}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWeekOffset((prev) => prev - 1)}
                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-400"
                    title="Previous week"
                  >
                    ←
                  </button>
                  {weekOffset !== 0 && (
                    <button
                      onClick={() => setWeekOffset(0)}
                      className="px-3 py-1 text-xs font-semibold bg-brand/20 hover:bg-brand/30 text-brand rounded-lg transition-colors"
                    >
                      This Week
                    </button>
                  )}
                  <button
                    onClick={() => setWeekOffset((prev) => prev + 1)}
                    className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-400"
                    title="Next week"
                  >
                    →
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {weekStart.toLocaleDateString(language, {
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {weekEnd.toLocaleDateString(language, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Week Stats */}
            <div className="flex items-center gap-4">
              <div className="text-right px-4 py-2 bg-white/70 dark:bg-slate-800/70 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Completion
                </div>
                <div className="text-lg font-bold text-brand">
                  {Math.round(weekInsights.completionRate)}%
                </div>
              </div>
              <div className="text-right px-4 py-2 bg-white/70 dark:bg-slate-800/70 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Capacity
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(weekInsights.avgCapacity)}%
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Weekly Progress
              </span>
              <span className="font-bold text-brand">
                {weekInsights.totalCompleted}/{weekInsights.totalTasks} tasks
              </span>
            </div>
            <div className="h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${weekInsights.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-3">
        {daysData.map((day) => (
          <div
            key={day.dateKey}
            className={`
                            group relative bg-white dark:bg-slate-800 rounded-xl border transition-all duration-300 overflow-hidden
                            ${
                              day.isToday
                                ? "border-brand ring-2 ring-brand/30 shadow-lg"
                                : "border-slate-200 dark:border-slate-700 hover:border-brand/50 hover:shadow-md"
                            }
                            ${day.isPast ? "opacity-75" : "opacity-100"}
                        `}
          >
            {/* Day Header */}
            <div
              className={`
                            relative text-center p-3 border-b backdrop-blur-sm
                            ${
                              day.isToday
                                ? "bg-gradient-to-r from-brand/10 to-pink-500/10 border-brand/20"
                                : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                            }
                        `}
            >
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {day.dayName}
              </div>
              <div
                className={`
                                text-2xl font-bold mt-1
                                ${
                                  day.isToday
                                    ? "text-brand"
                                    : "text-slate-700 dark:text-slate-300"
                                }
                            `}
              >
                {day.dayNum}
              </div>

              {/* Capacity Indicator */}
              {day.capacity > 0 && (
                <div className="mt-2">
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getCapacityColor(day.capacity)} transition-all duration-500`}
                      style={{ width: `${Math.min(100, day.capacity)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                    {Math.round(day.capacity)}% loaded
                  </div>
                </div>
              )}
            </div>

            {/* AM Section */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.date, "am")}
              className="p-2 min-h-[100px] border-b border-slate-100 dark:border-slate-700/50 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  AM
                </span>
                <span
                  className={`text-[10px] font-medium ${getPeriodStatus(day.amItems).color}`}
                >
                  {getPeriodStatus(day.amItems).emoji}
                </span>
              </div>
              <div className="space-y-1">
                {day.amItems.slice(0, 3).map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="text-xs cursor-pointer transition-transform hover:scale-[1.03]"
                      onClick={() => onItemClick(item)}
                    >
                      <div
                        className={`
                                                flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors
                                                ${
                                                  item.completed
                                                    ? "opacity-50 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-brand/40"
                                                }
                                            `}
                        style={
                          proj
                            ? {
                                borderLeftColor: proj.color,
                                borderLeftWidth: 3,
                              }
                            : {}
                        }
                      >
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            itemHandlers.handleToggleComplete?.(item.id);
                          }}
                          className="h-3 w-3 rounded border-slate-300 text-brand focus:ring-0 cursor-pointer flex-shrink-0"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.priority === Priority.HIGH ? "bg-red-500" : item.priority === Priority.MEDIUM ? "bg-yellow-500" : "bg-green-500"}`}
                        />
                        <span
                          className={`truncate ${item.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {day.amItems.length > 3 && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
                    +{day.amItems.length - 3} more
                  </div>
                )}
                {day.amItems.length === 0 && (
                  <div className="text-[10px] text-slate-300 dark:text-slate-600 text-center py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Drop here
                  </div>
                )}
              </div>
            </div>

            {/* PM Section */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.date, "pm")}
              className="p-2 min-h-[100px] hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  PM
                </span>
                <span
                  className={`text-[10px] font-medium ${getPeriodStatus(day.pmItems).color}`}
                >
                  {getPeriodStatus(day.pmItems).emoji}
                </span>
              </div>
              <div className="space-y-1">
                {day.pmItems.slice(0, 3).map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="text-xs cursor-pointer transition-transform hover:scale-[1.03]"
                      onClick={() => onItemClick(item)}
                    >
                      <div
                        className={`
                                                flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors
                                                ${
                                                  item.completed
                                                    ? "opacity-50 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                    : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-brand/40"
                                                }
                                            `}
                        style={
                          proj
                            ? {
                                borderLeftColor: proj.color,
                                borderLeftWidth: 3,
                              }
                            : {}
                        }
                      >
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            itemHandlers.handleToggleComplete?.(item.id);
                          }}
                          className="h-3 w-3 rounded border-slate-300 text-brand focus:ring-0 cursor-pointer flex-shrink-0"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.priority === Priority.HIGH ? "bg-red-500" : item.priority === Priority.MEDIUM ? "bg-yellow-500" : "bg-green-500"}`}
                        />
                        <span
                          className={`truncate ${item.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {day.pmItems.length > 3 && (
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center">
                    +{day.pmItems.length - 3} more
                  </div>
                )}
                {day.pmItems.length === 0 && (
                  <div className="text-[10px] text-slate-300 dark:text-slate-600 text-center py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Drop here
                  </div>
                )}
              </div>
            </div>

            {/* Quick view button */}
            <button
              onClick={() => setSelectedDay(day)}
              className="w-full py-1 text-[10px] font-medium text-brand hover:bg-brand/5 transition-colors border-t border-slate-100 dark:border-slate-700"
            >
              View All
            </button>
          </div>
        ))}
      </div>

      {/* Unscheduled Tasks */}
      {(() => {
        const unscheduled = items.filter(
          (item) => !item.dueDate && !item.startDate && !item.completed,
        );
        if (unscheduled.length === 0) return null;
        return (
          <details className="group/unsched bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-center gap-2">
                <span>📥</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Unscheduled
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {unscheduled.length}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Drag to a day to schedule
              </span>
            </summary>
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {unscheduled.slice(0, 12).map((item) => {
                const proj = projects.find((p) => p.id === item.projectId);
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="text-xs cursor-pointer active:cursor-grabbing transition-transform hover:scale-[1.03]"
                    onClick={() => onItemClick(item)}
                  >
                    <div
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-brand/40 transition-colors"
                      style={
                        proj
                          ? { borderLeftColor: proj.color, borderLeftWidth: 3 }
                          : {}
                      }
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() =>
                          itemHandlers.handleToggleComplete?.(item.id)
                        }
                        className="h-3 w-3 rounded border-slate-300 text-brand focus:ring-0 cursor-pointer flex-shrink-0"
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.priority === Priority.HIGH ? "bg-red-500" : item.priority === Priority.MEDIUM ? "bg-yellow-500" : "bg-green-500"}`}
                      />
                      <span className="truncate text-slate-700 dark:text-slate-200">
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
              {unscheduled.length > 12 && (
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center">
                  +{unscheduled.length - 12} more
                </div>
              )}
            </div>
          </details>
        );
      })()}

      {/* Week Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <span>💡</span>
            Week Insights
          </h3>
          <div className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
            <p>
              • <strong>{weekInsights.busiestDay.dayName}</strong> looks packed
              with {weekInsights.busiestDay.items.length} tasks
            </p>
            {weekInsights.avgCapacity > 80 && (
              <p className="text-orange-600 dark:text-orange-400">
                ⚠️ Week is {Math.round(weekInsights.avgCapacity)}% loaded.
                Consider rescheduling non-urgent tasks.
              </p>
            )}
            {weekInsights.avgCapacity < 50 && (
              <p className="text-green-600 dark:text-green-400">
                ✨ Light week ahead! Great for deep work or getting ahead.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
            <span>🎯</span>
            Quick Tips
          </h3>
          <div className="space-y-2 text-xs text-purple-700 dark:text-purple-400">
            <p>• Drag tasks between days to reschedule</p>
            <p>• Drop on AM/PM sections for time-of-day placement</p>
            <p>• Click "View All" to see full day details</p>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-brand/10 to-purple-500/10 p-6 border-b border-slate-200 dark:border-slate-700 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedDay.dayName},{" "}
                    {selectedDay.date.toLocaleDateString(language, {
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedDay.items.length} tasks •{" "}
                    {Math.round(selectedDay.completionRate)}% complete
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {selectedDay.items.length > 0 ? (
                selectedDay.items.map((item) => (
                  <PlannerItemComponent
                    key={item.id}
                    item={item}
                    project={
                      projects.find((p) => p.id === item.projectId) || null
                    }
                    projects={projects}
                    allItems={items}
                    itemHandlers={itemHandlers}
                    isDraggable={false}
                    onStartFocus={() => {
                      onItemClick(item);
                      setSelectedDay(null);
                    }}
                  />
                ))
              ) : (
                <p className="text-center py-12 text-slate-400 dark:text-slate-500">
                  No tasks scheduled for this day
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekView;
