/**
 * RecurrenceSection - Recurring pattern selector
 * Daily, Weekly (with day picker), Monthly, Custom
 */

import React from "react";
import { RepeatIcon } from "../icons";
import { RecurrenceRule } from "../../types";

interface RecurrenceSectionProps {
  recurrence: RecurrenceRule | null;
  onRecurrenceChange: (rule: RecurrenceRule | null) => void;
}

const frequencyOptions: {
  label: string;
  value: RecurrenceRule["frequency"] | "none";
}[] = [
  { label: "None", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const daysOfWeek = [
  { label: "S", value: 0, name: "Sun" },
  { label: "M", value: 1, name: "Mon" },
  { label: "T", value: 2, name: "Tue" },
  { label: "W", value: 3, name: "Wed" },
  { label: "T", value: 4, name: "Thu" },
  { label: "F", value: 5, name: "Fri" },
  { label: "S", value: 6, name: "Sat" },
];

export const RecurrenceSection: React.FC<RecurrenceSectionProps> = ({
  recurrence,
  onRecurrenceChange,
}) => {
  const handleFrequencyChange = (
    freq: RecurrenceRule["frequency"] | "none",
  ) => {
    if (freq === "none") {
      onRecurrenceChange(null);
    } else {
      onRecurrenceChange({
        frequency: freq,
        interval: 1,
        daysOfWeek: freq === "weekly" ? [1, 2, 3, 4, 5] : undefined, // Mon-Fri default
      });
    }
  };

  const toggleDayOfWeek = (dayValue: number) => {
    if (!recurrence || recurrence.frequency !== "weekly") return;

    const currentDays = recurrence.daysOfWeek || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter((d) => d !== dayValue)
      : [...currentDays, dayValue].sort();

    onRecurrenceChange({
      ...recurrence,
      daysOfWeek: newDays,
    });
  };

  const currentFreq = recurrence?.frequency || "none";

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <RepeatIcon className="h-4 w-4" />
        <span>Repeat</span>
      </div>

      {/* Frequency selector */}
      <div className="flex gap-2">
        {frequencyOptions.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleFrequencyChange(value)}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${
                currentFreq === value
                  ? "bg-gradient-to-r from-purple-600 to-brand-dark text-white shadow-lg shadow-purple-500/25"
                  : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Days of week selector (for weekly) */}
      {recurrence?.frequency === "weekly" && (
        <div className="flex gap-2 animate-fade-in">
          {daysOfWeek.map(({ label, value, name }) => {
            const isSelected = recurrence.daysOfWeek?.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleDayOfWeek(value)}
                title={name}
                className={`
                  w-10 h-10 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    isSelected
                      ? "bg-gradient-to-br from-brand to-[#EE5A6F] text-white shadow-lg shadow-indigo-500/30"
                      : "bg-slate-800/50 border border-slate-700/50 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Interval selector */}
      {recurrence && (
        <div className="flex items-center gap-3 animate-fade-in">
          <span className="text-sm text-slate-500">Every</span>
          <input
            type="number"
            min={1}
            max={30}
            value={recurrence.interval}
            onChange={(e) =>
              onRecurrenceChange({
                ...recurrence,
                interval: parseInt(e.target.value) || 1,
              })
            }
            className="w-16 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 text-center focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          />
          <span className="text-sm text-slate-500">
            {recurrence.frequency === "daily" &&
              (recurrence.interval === 1 ? "day" : "days")}
            {recurrence.frequency === "weekly" &&
              (recurrence.interval === 1 ? "week" : "weeks")}
            {recurrence.frequency === "monthly" &&
              (recurrence.interval === 1 ? "month" : "months")}
          </span>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RecurrenceSection;
