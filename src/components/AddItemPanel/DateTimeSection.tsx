/**
 * DateTimeSection - Start date, due date, and duration selectors
 * With smart date shortcuts (Today, Tomorrow, Next Week)
 * Theme-aware: works in both light and dark mode
 */

import React, { useState, useMemo } from "react";
import { CalendarIcon, ClockIcon } from "../icons";
import { DatePicker } from "../ui/DatePicker";

interface DateTimeSectionProps {
  startDate: string;
  dueDate: string;
  estimatedMinutes: number | null;
  onStartDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  onDurationChange: (minutes: number | null) => void;
}

const durationPresets = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
];

export const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  startDate,
  dueDate,
  estimatedMinutes,
  onStartDateChange,
  onDueDateChange,
  onDurationChange,
}) => {
  const [isCustom, setIsCustom] = useState(
    estimatedMinutes !== null &&
      ![15, 30, 45, 60, 120, 180].includes(estimatedMinutes),
  );

  // Smart date shortcuts
  const dateShortcuts = useMemo(() => {
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonday = new Date(today);
    nextMonday.setDate(
      nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7),
    );
    const nextWeekend = new Date(today);
    nextWeekend.setDate(
      nextWeekend.getDate() + ((6 - nextWeekend.getDay() + 7) % 7 || 7),
    );

    return [
      { label: "Today", date: today.toISOString(), icon: "☀️" },
      { label: "Tomorrow", date: tomorrow.toISOString(), icon: "🌅" },
      { label: "Next Mon", date: nextMonday.toISOString(), icon: "📆" },
      { label: "Weekend", date: nextWeekend.toISOString(), icon: "🏖️" },
    ];
  }, []);

  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  const handlePresetClick = (value: number) => {
    setIsCustom(false);
    onDurationChange(estimatedMinutes === value ? null : value);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    if (
      !estimatedMinutes ||
      [15, 30, 45, 60, 120, 180].includes(estimatedMinutes)
    ) {
      onDurationChange(null);
    }
  };

  const handleShortcutClick = (date: string) => {
    onDueDateChange(dueDate === date ? "" : date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        <CalendarIcon className="h-4 w-4" />
        <span>Schedule</span>
      </div>

      {/* Smart Date Shortcuts */}
      <div className="flex flex-wrap gap-2">
        {dateShortcuts.map(({ label, date, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleShortcutClick(date)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              dueDate === date
                ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border border-brand/30 shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/50"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Start Date */}
        <div className="relative group">
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
            Start
          </label>
          <div className="relative">
            <DatePicker
              value={startDate}
              onChange={(iso) => onStartDateChange(iso || "")}
              placeholder="Start Date"
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="relative group">
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
            Due
          </label>
          <div className="relative">
            <DatePicker
              value={dueDate}
              onChange={(iso) => onDueDateChange(iso || "")}
              placeholder="Due Date"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-1.5">
            Duration
          </label>
          <div className="flex flex-wrap gap-1">
            {durationPresets.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => handlePresetClick(value)}
                className={`
                                    px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                    ${
                                      !isCustom && estimatedMinutes === value
                                        ? "bg-gradient-to-r from-brand to-[#EE5A6F] text-white shadow-lg shadow-brand/25"
                                        : "bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300"
                                    }
                                `}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleCustomClick}
              className={`
                                px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200
                                ${
                                  isCustom
                                    ? "bg-gradient-to-r from-brand to-[#EE5A6F] text-white shadow-lg shadow-brand/25"
                                    : "bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-300"
                                }
                            `}
            >
              ✏️
            </button>
          </div>

          {/* Custom input */}
          {isCustom && (
            <div className="relative mt-2 animate-panel-fade-in">
              <input
                type="number"
                min={1}
                max={480}
                value={estimatedMinutes || ""}
                onChange={(e) =>
                  onDurationChange(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder="Minutes..."
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">
                min
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSection;
