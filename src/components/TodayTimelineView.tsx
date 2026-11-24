import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlannerItem, EnergyLevel, Priority } from "../types";
import PlannerItemComponent from "./task-items/PlannerItem";
import CompactTaskCard from "./CompactTaskCard";
import { useProjects } from "../hooks/useProjects";
import { useItemHandlers } from "../hooks/useItemHandlers";
import {
  useTopSuggestions,
  useNextBestTask,
} from "../hooks/useSmartSuggestions";
import { useAIScheduler } from "../hooks/useAIScheduler";
import {
  getEnergyMatchDiff,
  getEnergyMatchClass,
  getEnergyMatchMessage,
} from "../utils/energyMatch";
import { useUIStore } from "../store/uiStore";
import { useLocalization } from "../contexts/LocalizationContext";
import toast from "react-hot-toast";

interface TodayTimelineViewProps {
  items: PlannerItem[];
  onStartFocus: (item: PlannerItem) => void;
  onUpdateItem: (itemId: string, updates: Partial<PlannerItem>) => void;
  onItemClick: (item: PlannerItem) => void;
}

interface TimeSlot {
  hour: number;
  label: string;
  period: "morning" | "midday" | "afternoon" | "evening";
}

const TodayTimelineView: React.FC<TodayTimelineViewProps> = ({
  items,
  onStartFocus,
  onUpdateItem,
  onItemClick,
}) => {
  const { projects } = useProjects();
  const itemHandlers = useItemHandlers();
  const {
    scheduleTasksWithAI,
    isScheduling,
    error: schedulerError,
  } = useAIScheduler();
  const { t, language } = useLocalization();

  // Energy state synced with Dashboard
  const userEnergy = useUIStore((state) => state.userEnergyLevel);
  const setUserEnergy = useUIStore((state) => state.setUserEnergyLevel);

  // Convert between UserEnergyLevel (lowercase) and EnergyLevel (capitalized enum)
  const userToEnergyLevel = (level: string): EnergyLevel => {
    const map: Record<string, EnergyLevel> = {
      low: EnergyLevel.LOW,
      medium: EnergyLevel.MEDIUM,
      high: EnergyLevel.HIGH,
      peak: EnergyLevel.PEAK,
    };
    return map[level] || EnergyLevel.MEDIUM;
  };

  const energyToUserLevel = (level: EnergyLevel): string => {
    const map: Record<EnergyLevel, string> = {
      [EnergyLevel.LOW]: "low",
      [EnergyLevel.MEDIUM]: "medium",
      [EnergyLevel.HIGH]: "high",
      [EnergyLevel.PEAK]: "peak",
    };
    return map[level] || "medium";
  };

  const currentEnergy = userToEnergyLevel(userEnergy);
  const setCurrentEnergy = (level: EnergyLevel) =>
    setUserEnergy(energyToUserLevel(level) as any);

  // Date navigation state
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const [draggedItem, setDraggedItem] = useState<PlannerItem | null>(null);
  const [showSuggestionDetail, setShowSuggestionDetail] = useState(false);
  const [energyOptimized, setEnergyOptimized] = useState(false);

  // Navigation helpers
  const goToPreviousDay = () => {
    const prev = new Date(viewDate);
    prev.setDate(prev.getDate() - 1);
    setViewDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(viewDate);
    next.setDate(next.getDate() + 1);
    setViewDate(next);
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const isToday = useMemo(() => {
    const today = new Date();
    return viewDate.toDateString() === today.toDateString();
  }, [viewDate]);

  // Generate time slots from 6 AM to 11 PM
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour < 12 ? "AM" : "PM";
      const label = `${displayHour}:00 ${period}`;

      let timePeriod: TimeSlot["period"];
      if (hour >= 6 && hour < 12) timePeriod = "morning";
      else if (hour >= 12 && hour < 14) timePeriod = "midday";
      else if (hour >= 14 && hour < 18) timePeriod = "afternoon";
      else timePeriod = "evening";

      slots.push({ hour, label, period: timePeriod });
    }
    return slots;
  }, []);

  // Get current hour for highlighting
  const currentHour = new Date().getHours();

  // Filter and categorize items for the selected date
  const { scheduledItems, unscheduledItems, completedToday } = useMemo(() => {
    const selectedDay = new Date(viewDate);
    selectedDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const scheduled: PlannerItem[] = [];
    const unscheduled: PlannerItem[] = [];
    const completed: PlannerItem[] = [];

    items.forEach((item) => {
      // For tasks with startDate → scheduled (show in timeline)
      if (item.startDate) {
        const startDate = new Date(item.startDate);
        // Only show in timeline if start date matches the selected day
        if (startDate >= selectedDay && startDate < nextDay) {
          scheduled.push(item);
          // Also track if completed for stats
          if (item.completed) {
            completed.push(item);
          }
        }
      } else if (!item.completed) {
        // Tasks without start time and not completed → unscheduled
        unscheduled.push(item);
      }
    });

    return {
      scheduledItems: scheduled.sort(
        (a, b) =>
          new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime(),
      ),
      unscheduledItems: unscheduled.sort((a, b) => {
        if (energyOptimized) {
          // Energy-optimized sorting: energy match first
          const energyLevels = {
            [EnergyLevel.LOW]: 1,
            [EnergyLevel.MEDIUM]: 2,
            [EnergyLevel.HIGH]: 3,
            [EnergyLevel.PEAK]: 4,
          };

          const currentEnergyValue = energyLevels[currentEnergy];
          const aEnergyValue = a.energyLevel
            ? energyLevels[a.energyLevel]
            : currentEnergyValue;
          const bEnergyValue = b.energyLevel
            ? energyLevels[b.energyLevel]
            : currentEnergyValue;

          const aEnergyDiff = Math.abs(aEnergyValue - currentEnergyValue);
          const bEnergyDiff = Math.abs(bEnergyValue - currentEnergyValue);

          if (aEnergyDiff !== bEnergyDiff) {
            return aEnergyDiff - bEnergyDiff; // Closer match first
          }

          // If energy match is same, sort by priority
          const priorityOrder = {
            [Priority.HIGH]: 3,
            [Priority.MEDIUM]: 2,
            [Priority.LOW]: 1,
          };
          const priorityDiff =
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;

          // Then due date
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aDate - bDate;
        } else {
          // Default sorting: priority first
          const priorityOrder = {
            [Priority.HIGH]: 3,
            [Priority.MEDIUM]: 2,
            [Priority.LOW]: 1,
          };
          const priorityDiff =
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;

          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          if (aDate !== bDate) return aDate - bDate;

          return (
            new Date(a.creationDate).getTime() -
            new Date(b.creationDate).getTime()
          );
        }
      }),
      completedToday: completed, // For stats only
    };
  }, [items, energyOptimized, currentEnergy, viewDate]);

  // Map items to their time slots
  const itemsByHour = useMemo(() => {
    const map = new Map<number, PlannerItem[]>();
    scheduledItems.forEach((item) => {
      if (item.startDate) {
        const hour = new Date(item.startDate).getHours();
        if (!map.has(hour)) map.set(hour, []);
        map.get(hour)!.push(item);
      }
    });
    return map;
  }, [scheduledItems]);

  // Get energy period emoji
  const getEnergyEmoji = (energy?: EnergyLevel) => {
    switch (energy) {
      case EnergyLevel.PEAK:
        return "🔥";
      case EnergyLevel.HIGH:
        return "⚡";
      case EnergyLevel.MEDIUM:
        return "💪";
      case EnergyLevel.LOW:
        return "🌱";
      default:
        return "💭";
    }
  };

  // Get period styling
  const getPeriodStyle = (period: TimeSlot["period"]) => {
    switch (period) {
      case "morning":
        return "from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10";
      case "midday":
        return "from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10";
      case "afternoon":
        return "from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10";
      default:
        return "from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10";
    }
  };

  // Calculate completion stats
  const stats = useMemo(() => {
    const allCount =
      scheduledItems.length + unscheduledItems.length + completedToday.length;
    const done = completedToday.length;
    const percentage = allCount > 0 ? Math.round((done / allCount) * 100) : 0;
    return { total: allCount, done, percentage };
  }, [scheduledItems, unscheduledItems, completedToday]);

  // Smart suggestions
  const topSuggestions = useTopSuggestions(unscheduledItems, {
    currentTime: new Date(),
    currentEnergy,
    availableMinutes: 120, // Could calculate based on timeline
  });

  const nextBestTask = useNextBestTask(unscheduledItems, {
    currentTime: new Date(),
    currentEnergy,
  });

  const handleDragStart = (item: PlannerItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (hour: number) => {
    if (draggedItem && itemHandlers.handleUpdateItem) {
      const today = new Date();
      today.setHours(hour, 0, 0, 0);
      itemHandlers.handleUpdateItem(draggedItem.id, {
        startDate: today.toISOString(),
      });
      setDraggedItem(null);
    }
  };

  const handleMagicSchedule = async () => {
    if (unscheduledItems.length === 0) {
      toast.error(t("todayView.noTasksToSchedule"));
      return;
    }

    // Generate available slots from current hour to end of day
    const now = new Date();
    const currentHour = now.getHours();
    const availableSlots: Date[] = [];

    for (let hour = currentHour; hour <= 20; hour++) {
      // Schedule until 8 PM
      const slot = new Date();
      slot.setHours(hour, 0, 0, 0);

      // Skip if slot is already occupied
      const isOccupied = scheduledItems.some((item) => {
        if (!item.startDate) return false;
        const itemHour = new Date(item.startDate).getHours();
        return itemHour === hour;
      });

      if (!isOccupied) {
        availableSlots.push(slot);
      }
    }

    if (availableSlots.length === 0) {
      toast.error(t("todayView.noAvailableSlots"));
      return;
    }

    toast.loading(t("todayView.aiAnalyzing"), { id: "ai-schedule" });

    try {
      const result = await scheduleTasksWithAI(unscheduledItems, {
        currentTime: now,
        currentEnergy,
        availableSlots,
        scheduledTasks: scheduledItems,
      });

      if (!result) {
        toast.error(t("todayView.failedToSchedule"), { id: "ai-schedule" });
        return;
      }

      // Apply the suggestions
      const promises = result.suggestions.map((suggestion) =>
        itemHandlers.handleUpdateItem?.(suggestion.taskId, {
          startDate: suggestion.suggestedSlot,
        }),
      );

      await Promise.all(promises);

      toast.success(`✨ ${result.summary}`, {
        id: "ai-schedule",
        duration: 4000,
      });
    } catch (error) {
      console.error("Magic schedule error:", error);
      toast.error(schedulerError || t("todayView.failedToScheduleRetry"), {
        id: "ai-schedule",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand/10 via-pink-500/10 to-purple-500/10 p-6 border border-brand/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent dark:from-slate-900/50" />

        <div className="relative space-y-4">
          {/* Top Row: Energy & Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Energy Selector - Modern Pill Buttons */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/70 dark:bg-slate-800/70 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
                  {t("todayView.energy")}:
                </span>
                {[
                  {
                    level: EnergyLevel.LOW,
                    emoji: "🔋",
                    label: t("todayView.energyLow"),
                    color: "from-amber-500 to-amber-600",
                    lightBg: "bg-amber-100 dark:bg-amber-900/30",
                    order: 1,
                  },
                  {
                    level: EnergyLevel.MEDIUM,
                    emoji: "⚡",
                    label: t("todayView.energyMed"),
                    color: "from-teal-500 to-teal-600",
                    lightBg: "bg-teal-100 dark:bg-teal-900/30",
                    order: 2,
                  },
                  {
                    level: EnergyLevel.HIGH,
                    emoji: "🔥",
                    label: t("todayView.energyHigh"),
                    color: "from-rose-500 to-rose-600",
                    lightBg: "bg-rose-100 dark:bg-rose-900/30",
                    order: 3,
                  },
                  {
                    level: EnergyLevel.PEAK,
                    emoji: "⭐",
                    label: t("todayView.energyPeak"),
                    color: "from-purple-500 to-purple-600",
                    lightBg: "bg-purple-100 dark:bg-purple-900/30",
                    order: 4,
                  },
                ].map(({ level, emoji, label, color, lightBg, order }) => {
                  // Energy levels mapping for progressive fill
                  const energyOrder = {
                    [EnergyLevel.LOW]: 1,
                    [EnergyLevel.MEDIUM]: 2,
                    [EnergyLevel.HIGH]: 3,
                    [EnergyLevel.PEAK]: 4,
                  };

                  const currentOrder = energyOrder[currentEnergy];
                  const isFilled = order <= currentOrder; // Fill all bars up to selected level
                  const isSelected = currentEnergy === level; // Exact match for border

                  return (
                    <button
                      key={level}
                      onClick={() => setCurrentEnergy(level)}
                      className={`
                                                relative px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300
                                                ${
                                                  isFilled
                                                    ? `bg-gradient-to-br ${color} text-white shadow-md ${isSelected ? "scale-110 ring-2 ring-white/50" : "scale-105"}`
                                                    : `${lightBg} text-slate-700 dark:text-slate-300 hover:scale-105 hover:shadow-sm opacity-60`
                                                }
                                            `}
                    >
                      <span className="flex items-center gap-1">
                        <span className="text-sm">{emoji}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Magic Schedule Button */}
              {unscheduledItems.length > 0 && (
                <button
                  onClick={handleMagicSchedule}
                  disabled={isScheduling}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand to-purple-600 hover:from-brand/90 hover:to-purple-600/90 text-white text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isScheduling ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      <span>{t("todayView.scheduling")}</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{t("todayView.magicSchedule")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Date Navigation */}
            <div className="text-right">
              {/* Navigation Buttons */}
              <div className="flex items-center justify-end gap-2 mb-2">
                <button
                  onClick={goToPreviousDay}
                  className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                  title={t("todayView.previousDay")}
                >
                  <span className="text-slate-600 dark:text-slate-400">←</span>
                </button>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-xs font-semibold bg-brand/20 hover:bg-brand/30 text-brand rounded-lg transition-colors"
                  >
                    {t("common.today")}
                  </button>
                )}
                <button
                  onClick={goToNextDay}
                  className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                  title={t("todayView.nextDay")}
                >
                  <span className="text-slate-600 dark:text-slate-400">→</span>
                </button>
              </div>

              {/* Date Display */}
              <div className="text-xl font-bold text-slate-800 dark:text-white">
                {viewDate.toLocaleDateString(
                  language === "tr" ? "tr-TR" : "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {t("todayView.todaysProgress")}
              </span>
              <span className="font-bold text-brand">
                {stats.done}/{stats.total} {t("todayView.tasks")} •{" "}
                {stats.percentage}%
              </span>
            </div>
            <div className="h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-brand to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - Main Column */}
        <div className="lg:col-span-2 space-y-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span>⏰</span>
            {t("todayView.timeline")}
          </h3>

          <div className="space-y-1">
            {timeSlots.map((slot) => {
              const slotItems = itemsByHour.get(slot.hour) || [];
              const isCurrentHour = slot.hour === currentHour;
              const isPastHour = slot.hour < currentHour;

              return (
                <div
                  key={slot.hour}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(slot.hour)}
                  className={`
                                        group relative flex gap-3 min-h-[60px] rounded-xl transition-all duration-300
                                        ${
                                          isCurrentHour
                                            ? "bg-gradient-to-r from-brand/20 to-pink-500/20 ring-2 ring-brand/50 shadow-lg scale-[1.02]"
                                            : `bg-gradient-to-r ${getPeriodStyle(slot.period)} hover:shadow-md hover:scale-[1.01]`
                                        }
                                        ${isPastHour ? "opacity-60" : "opacity-100"}
                                    `}
                >
                  {/* Time Label */}
                  <div
                    className={`
                                        flex-shrink-0 w-24 flex flex-col items-center justify-center rounded-l-xl
                                        ${isCurrentHour ? "bg-brand/10" : "bg-white/50 dark:bg-slate-800/50"}
                                    `}
                  >
                    <div
                      className={`
                                            text-xs font-semibold
                                            ${
                                              isCurrentHour
                                                ? "text-brand"
                                                : "text-slate-600 dark:text-slate-400"
                                            }
                                        `}
                    >
                      {slot.label}
                    </div>
                    {isCurrentHour && (
                      <div className="text-[10px] text-brand font-medium mt-1 animate-pulse">
                        {t("todayView.now")}
                      </div>
                    )}
                  </div>

                  {/* Task Area */}
                  <div className="flex-1 py-2 pr-3 space-y-2">
                    <AnimatePresence mode="popLayout">
                      {slotItems.length > 0 ? (
                        slotItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                              opacity: 0,
                              scale: 0.95,
                              transition: { duration: 1.5 },
                            }}
                            draggable
                            onDragStart={() => handleDragStart(item)}
                            style={
                              item.estimatedMinutes &&
                              item.estimatedMinutes > 60
                                ? {
                                    minHeight: `${Math.max(76, (item.estimatedMinutes / 60) * 76)}px`,
                                  }
                                : {}
                            }
                          >
                            <CompactTaskCard
                              item={item}
                              project={
                                projects.find((p) => p.id === item.projectId) ||
                                null
                              }
                              onClick={() => onItemClick(item)}
                              onComplete={() => {
                                itemHandlers.handleToggleComplete?.(item.id);
                              }}
                              onFocus={() => onStartFocus(item)}
                              onReschedule={(newDate) => {
                                itemHandlers.handleUpdateItem?.(item.id, {
                                  dueDate: newDate,
                                });
                              }}
                              isDragging={draggedItem?.id === item.id}
                            />
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500 italic opacity-0 group-hover:opacity-100 transition-opacity">
                          {t("todayView.dropTasksHere")}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Unscheduled Tasks */}
        <div className="space-y-4">
          <div className="sticky top-4 space-y-4">
            {/* Next Best Task Suggestion */}
            {nextBestTask && (
              <div className="bg-gradient-to-br from-brand/10 via-purple-500/10 to-pink-500/10 rounded-xl p-4 border-2 border-brand/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-brand flex items-center gap-2">
                    <span>⚡</span>
                    {t("todayView.nextBestTask")}
                  </h3>
                  <button
                    onClick={() =>
                      setShowSuggestionDetail(!showSuggestionDetail)
                    }
                    className="text-xs text-brand/70 hover:text-brand underline"
                  >
                    {showSuggestionDetail
                      ? t("todayView.hide")
                      : t("todayView.why")}
                  </button>
                </div>

                {/* Suggested Task Card */}
                <div className="mb-2">
                  <CompactTaskCard
                    item={nextBestTask.task}
                    project={
                      projects.find(
                        (p) => p.id === nextBestTask.task.projectId,
                      ) || null
                    }
                    onClick={() => onItemClick(nextBestTask.task)}
                    onComplete={() => {
                      itemHandlers.handleToggleComplete?.(nextBestTask.task.id);
                    }}
                    onFocus={() => onStartFocus(nextBestTask.task)}
                    onReschedule={(newDate) => {
                      itemHandlers.handleUpdateItem?.(nextBestTask.task.id, {
                        dueDate: newDate,
                      });
                    }}
                    isDragging={draggedItem?.id === nextBestTask.task.id}
                  />
                </div>

                {/* Suggestion Reasons */}
                {showSuggestionDetail && (
                  <div className="space-y-1 text-xs bg-white/50 dark:bg-slate-800/50 rounded-lg p-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t("todayView.whyWeSuggest")}
                    </div>
                    {nextBestTask.reasons.map((reason, idx) => (
                      <div
                        key={idx}
                        className="text-slate-600 dark:text-slate-400 flex items-start gap-2"
                      >
                        <span className="text-brand">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 border-t border-slate-200 dark:border-slate-700 pt-2">
                      {t("todayView.score")}: {nextBestTask.score}/35{" "}
                      {t("todayView.points")}
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onStartFocus(nextBestTask.task)}
                    className="flex-1 px-3 py-2 bg-brand hover:bg-brand/90 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    🎯 {t("todayView.startNow")}
                  </button>
                  <button
                    onClick={() => {
                      // Schedule for current hour
                      const now = new Date();
                      itemHandlers.handleUpdateItem?.(nextBestTask.task.id, {
                        startDate: now.toISOString(),
                      });
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-brand dark:text-white text-xs font-semibold rounded-lg border border-brand/30 dark:border-slate-600 transition-colors"
                  >
                    📅 {t("todayView.schedule")}
                  </button>
                </div>
              </div>
            )}

            {/* Unscheduled Tasks */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span>📥</span>
                  {t("todayView.unscheduled")} ({unscheduledItems.length})
                </h3>

                {/* Optimize for Energy Button */}
                {unscheduledItems.length > 0 && (
                  <button
                    onClick={() => {
                      setEnergyOptimized(!energyOptimized);
                      toast.success(
                        energyOptimized
                          ? t("todayView.backToPrioritySorting")
                          : `✨ Optimized for ${currentEnergy} energy`,
                        { duration: 2000 },
                      );
                    }}
                    className={`
                                            text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200
                                            ${
                                              energyOptimized
                                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                            }
                                        `}
                  >
                    {energyOptimized
                      ? `⚡ ${t("todayView.optimized")}`
                      : `🔄 ${t("todayView.optimizeForEnergy")}`}
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unscheduledItems.map((item, index) => {
                  // Check if this task is in top 3 suggestions
                  const suggestionRank = topSuggestions.findIndex(
                    (s) => s.task.id === item.id,
                  );
                  const isSuggested =
                    suggestionRank !== -1 && suggestionRank < 3;
                  const isTopSuggestion = nextBestTask?.task.id === item.id;

                  // Calculate energy match
                  const energyDiff = getEnergyMatchDiff(
                    item.energyLevel,
                    currentEnergy,
                  );
                  const energyMatchClass = energyOptimized
                    ? getEnergyMatchClass(energyDiff)
                    : "";
                  const energyMessage = energyOptimized
                    ? getEnergyMatchMessage(energyDiff)
                    : null;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      className="relative"
                    >
                      {/* Suggestion Badge */}
                      {isSuggested && !isTopSuggestion && (
                        <div className="absolute -top-1 -right-1 z-10">
                          <div className="bg-gradient-to-r from-brand to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <span>⚡</span>
                            <span>#{suggestionRank + 1}</span>
                          </div>
                        </div>
                      )}

                      {/* Task Card with Energy Glow */}
                      <div
                        className={`${energyMatchClass} rounded-lg transition-all duration-300`}
                      >
                        <CompactTaskCard
                          item={item}
                          project={
                            projects.find((p) => p.id === item.projectId) ||
                            null
                          }
                          onClick={() => onItemClick(item)}
                          onComplete={() => {
                            itemHandlers.handleToggleComplete?.(item.id);
                          }}
                          onFocus={() => onStartFocus(item)}
                          onReschedule={(newDate) => {
                            itemHandlers.handleUpdateItem?.(item.id, {
                              dueDate: newDate,
                            });
                          }}
                          isDragging={draggedItem?.id === item.id}
                        />
                      </div>

                      {/* Energy Match Message */}
                      {energyMessage && (
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 ml-2">
                          {energyMessage}
                        </div>
                      )}
                    </div>
                  );
                })}
                {unscheduledItems.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                    {t("todayView.allTasksScheduled")}
                  </p>
                )}
              </div>
            </div>

            {/* Completed Today */}
            {completedToday.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
                <h3 className="text-sm font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <span>✅</span>
                  {t("todayView.completedToday")} ({completedToday.length})
                </h3>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                  {completedToday.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span>✓</span>
                      <span className="line-through opacity-75">
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayTimelineView;
