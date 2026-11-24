import React, { useState, useMemo } from "react";
import {
  PlannerItem,
  Category,
  ItemType,
  Priority,
  ItemHandlers,
  Project,
} from "../types";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  TrashIcon,
  CalendarDaysIcon,
} from "./icons";
import { useLocalization } from "../contexts/LocalizationContext";
import PlannerItemComponent from "./task-items/PlannerItem";
import { useUIStore } from "../store/uiStore";

const categoryColors: {
  [key in Category]: { bg: string; border: string; text: string; dot: string };
} = {
  [Category.WORK]: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-500",
    text: "text-blue-800 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  [Category.PERSONAL]: {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-500",
    text: "text-purple-800 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  [Category.FITNESS]: {
    bg: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-500",
    text: "text-green-800 dark:text-green-300",
    dot: "bg-green-500",
  },
  [Category.LEARNING]: {
    bg: "bg-yellow-50 dark:bg-yellow-900/30",
    border: "border-yellow-500",
    text: "text-yellow-800 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  [Category.HOME]: {
    bg: "bg-orange-50 dark:bg-orange-900/30",
    border: "border-orange-500",
    text: "text-orange-800 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  [Category.NONE]: {
    bg: "bg-slate-50 dark:bg-slate-800",
    border: "border-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfWeek = (d: Date, weekStart: "monday" | "sunday" = "sunday") => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = weekStart === "monday" ? (day === 0 ? 6 : day - 1) : day;
  date.setDate(date.getDate() - diff);
  return date;
};
const addDays = (d: Date, days: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
};
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();
const formatDate = (d: Date, language: string) =>
  d.toLocaleDateString(language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

interface PlannerViewProps {
  items: PlannerItem[];
  projects: Project[];
  itemHandlers: ItemHandlers;
  onUpdateItemDate: (itemId: string, newDate: string | null) => void;
  onItemClick: (item: PlannerItem) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({
  items,
  projects,
  itemHandlers,
  onUpdateItemDate,
  onItemClick,
}) => {
  const { language, t } = useLocalization();
  const weekStartPref = useUIStore((state) => state.weekStart);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rescheduleItemId, setRescheduleItemId] = useState<string | null>(null);

  // Store dragged item ID in state as fallback
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const handleToday = () => setCurrentDate(new Date());

  const unscheduledTasks = useMemo(
    () =>
      items
        .filter(
          (item) =>
            item.type === ItemType.TASK && !item.dueDate && !item.completed,
        )
        .sort((a, b) => b.priority.localeCompare(a.priority)),
    [items],
  );

  const { headerText, dayNames } = useMemo(() => {
    const header = currentDate.toLocaleString(language, {
      month: "long",
      year: "numeric",
    });
    const names = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      const start = startOfWeek(day, weekStartPref);
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toLocaleString(language, { weekday: "short" });
    });
    return { headerText: header, dayNames: names };
  }, [currentDate, language, weekStartPref]);

  // === DRAG & DROP HANDLERS ===
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    itemId: string,
  ) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItemId(itemId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverDate(null);
    setDraggedItemId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = e.dataTransfer.getData("text/plain") || draggedItemId;
    if (itemId) {
      // Set to midnight (00:00:00) so task appears in "Inbox" not at a specific hour
      const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      onUpdateItemDate(itemId, dateOnly.toISOString());
    }
    setDragOverDate(null);
    setIsDragging(false);
    setDraggedItemId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    dateKey: string,
  ) => {
    e.preventDefault();
    setDragOverDate(dateKey);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverDate(null);
    }
  };

  // === ACTION HANDLERS ===
  const handleUnschedule = (itemId: string) => {
    console.log("Unscheduling item:", itemId);
    onUpdateItemDate(itemId, null);
    // Item will disappear from modal as it no longer has a date
  };

  const handleReschedule = (itemId: string, newDate: Date) => {
    // Set to midnight (00:00:00) for date-only scheduling
    const dateOnly = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
    );
    onUpdateItemDate(itemId, dateOnly.toISOString());
    setRescheduleItemId(null);
  };

  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, weekStartPref);
  const days = Array.from({ length: 42 }).map((_, i) =>
    addDays(new Date(startDate), i),
  );

  // Month stats
  const monthStats = useMemo(() => {
    const monthItems = items.filter((item) => {
      if (item.type !== ItemType.TASK) return false;
      if (!item.dueDate) return false;
      const itemDate = new Date(item.dueDate);
      return (
        itemDate.getMonth() === currentDate.getMonth() &&
        itemDate.getFullYear() === currentDate.getFullYear()
      );
    });
    const completed = monthItems.filter((i) => i.completed).length;
    const overdue = monthItems.filter(
      (i) => !i.completed && new Date(i.dueDate!) < new Date(),
    ).length;
    return { total: monthItems.length, completed, overdue };
  }, [items, currentDate]);

  // Get items for selected date (for modal)
  const itemsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return items.filter((item) => {
      if (item.type === ItemType.TASK)
        return item.dueDate && isSameDay(new Date(item.dueDate), selectedDate);
      if (item.type === ItemType.EVENT)
        return (
          item.startDate && isSameDay(new Date(item.startDate), selectedDate)
        );
      return false;
    });
  }, [items, selectedDate]);

  return (
    <div className="flex gap-6 h-full">
      {/* Unscheduled Tasks Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">
          {t("calendarView.unscheduledTasks")} ({unscheduledTasks.length})
        </h3>
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {unscheduledTasks.length > 0 ? (
            unscheduledTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-[#FF6B6B] dark:hover:border-indigo-600 transition-all"
              >
                <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${categoryColors[task.category].dot}`}
                  ></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
              {t("calendarView.noUnscheduledTasks")}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
        <header className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              {t("calendarView.today")}
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
              {headerText}
            </h2>
          </div>
          {isDragging && (
            <span className="text-sm text-brand dark:text-brand-light animate-pulse">
              📅 Drag to a day to schedule
            </span>
          )}
        </header>

        {/* Month Stats Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            📋{" "}
            <span className="font-medium text-slate-800 dark:text-white">
              {monthStats.total}
            </span>{" "}
            tasks
          </span>
          <span className="text-green-600 dark:text-green-400">
            ✅ <span className="font-medium">{monthStats.completed}</span> done
          </span>
          {monthStats.overdue > 0 && (
            <span className="text-red-600 dark:text-red-400">
              ⚠️ <span className="font-medium">{monthStats.overdue}</span>{" "}
              overdue
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2 border-b border-slate-200 dark:border-slate-700"
            >
              {day}
            </div>
          ))}
          {days.map((d, i) => {
            const dateKey = d.toISOString();
            const itemsForDay = items.filter((item) => {
              if (item.type === ItemType.TASK)
                return item.dueDate && isSameDay(new Date(item.dueDate), d);
              if (item.type === ItemType.EVENT)
                return item.startDate && isSameDay(new Date(item.startDate), d);
              return false;
            });

            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(d, new Date());
            const isDragOver = dragOverDate === dateKey;

            return (
              <div
                key={i}
                onClick={() => itemsForDay.length > 0 && setSelectedDate(d)}
                onDrop={(e) => handleDrop(e, d)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, dateKey)}
                onDragLeave={handleDragLeave}
                className={`
                                    min-h-24 border-b border-r border-slate-200 dark:border-slate-700 p-1.5 transition-all
                                    ${isCurrentMonth ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900"}
                                    ${isDragOver ? "bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-brand ring-inset scale-[1.02]" : ""}
                                    ${itemsForDay.length > 0 ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50" : ""}
                                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm ${
                      isToday
                        ? "bg-brand text-white rounded-full h-6 w-6 flex items-center justify-center font-bold"
                        : isCurrentMonth
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {itemsForDay.length > 3 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 rounded">
                      +{itemsForDay.length - 3}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {itemsForDay.slice(0, 3).map((item) => {
                    const isOverdue =
                      !item.completed &&
                      item.dueDate &&
                      new Date(item.dueDate) < new Date();
                    const hasRecurrence = !!(item as any).recurrenceRule;

                    // Check if this is a workout event
                    const isWorkout = (item as any).workout_data !== undefined;

                    if (isWorkout) {
                      return (
                        <div
                          key={item.id}
                          className="text-xs px-1.5 py-1 rounded bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-1 shadow-sm"
                        >
                          <span>💪</span>
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick(item);
                        }}
                        className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 cursor-pointer hover:ring-1 hover:ring-brand/40 transition-all ${
                          item.completed
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 line-through"
                            : isOverdue
                              ? "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                              : `${categoryColors[item.category].bg} ${categoryColors[item.category].text}`
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!item.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            itemHandlers.handleToggleComplete?.(item.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-2.5 w-2.5 rounded border-slate-300 text-brand focus:ring-0 cursor-pointer flex-shrink-0"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            item.priority === Priority.HIGH
                              ? "bg-red-500"
                              : item.priority === Priority.MEDIUM
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                        {hasRecurrence && (
                          <span className="flex-shrink-0 text-[9px]">🔁</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedDate(null);
            setRescheduleItemId(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatDate(selectedDate, language)}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {itemsForSelectedDate.length}{" "}
                  {itemsForSelectedDate.length === 1 ? "task" : "tasks"}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setRescheduleItemId(null);
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              {itemsForSelectedDate.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No tasks for this day
                </p>
              ) : (
                itemsForSelectedDate.map((item) => (
                  <PlannerItemComponent
                    key={item.id}
                    item={item}
                    project={
                      projects.find((p) => p.id === item.projectId) || null
                    }
                    projects={projects}
                    allItems={items}
                    itemHandlers={{
                      ...itemHandlers,
                      handleUpdateItemDate: (id, date) =>
                        handleReschedule(id, new Date(date!)),
                    }}
                    isDraggable={false}
                    onStartFocus={() => {
                      onItemClick(item);
                      setSelectedDate(null);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerView;
