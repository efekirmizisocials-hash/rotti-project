import React, { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../icons";

interface DatePickerProps {
  value: string | undefined; // ISO string or undefined
  onChange: (iso: string | undefined) => void;
  label?: string;
  includeTime?: boolean;
  placeholder?: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplay(iso: string | undefined, includeTime: boolean): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (!includeTime) return dateStr;
  const timeStr = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  includeTime = true,
  placeholder = "Pick a date…",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const parsed = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(
    parsed?.getFullYear() ?? new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed?.getMonth() ?? new Date().getMonth(),
  );
  const [timeH, setTimeH] = useState(
    parsed ? String(parsed.getHours()).padStart(2, "0") : "09",
  );
  const [timeM, setTimeM] = useState(
    parsed ? String(parsed.getMinutes()).padStart(2, "0") : "00",
  );

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayClick = (day: number) => {
    const h = includeTime ? parseInt(timeH, 10) : 0;
    const m = includeTime ? parseInt(timeM, 10) : 0;
    const d = new Date(viewYear, viewMonth, day, h, m);
    onChange(d.toISOString());
    if (!includeTime) setIsOpen(false);
  };

  const handleTimeChange = (h: string, m: string) => {
    setTimeH(h);
    setTimeM(m);
    if (value) {
      const d = new Date(value);
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      onChange(d.toISOString());
    }
  };

  const selectedDay =
    parsed &&
    parsed.getFullYear() === viewYear &&
    parsed.getMonth() === viewMonth
      ? parsed.getDate()
      : null;

  const today = new Date();
  const todayDay =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth
      ? today.getDate()
      : null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm transition-all
                    ${
                      isOpen
                        ? "border-brand bg-brand/5 dark:bg-brand/10"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-brand/50"
                    } text-slate-700 dark:text-slate-200`}
      >
        <span className={value ? "" : "text-slate-400"}>
          {value ? formatDisplay(value, includeTime) : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="p-0.5 rounded text-slate-400 hover:text-red-500 transition-colors"
            >
              <XIcon className="w-3 h-3" />
            </span>
          )}
          <span className="text-slate-400 text-base">📅</span>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else setViewMonth((m) => m - 1);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else setViewMonth((m) => m + 1);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 px-3 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs text-slate-500 font-medium py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const isSelected = day === selectedDay;
              const isToday = day === todayDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full transition-all font-medium
                                        ${
                                          isSelected
                                            ? "bg-brand text-white shadow-lg shadow-brand/30"
                                            : isToday
                                              ? "border border-brand/40 text-brand"
                                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker */}
          {includeTime && (
            <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
              <span className="text-slate-400 text-sm">🕐</span>
              <input
                type="number"
                min={0}
                max={23}
                value={timeH}
                onChange={(e) =>
                  handleTimeChange(e.target.value.padStart(2, "0"), timeM)
                }
                className="w-12 text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1 text-sm text-slate-800 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
              <span className="text-slate-500 font-bold">:</span>
              <input
                type="number"
                min={0}
                max={59}
                step={5}
                value={timeM}
                onChange={(e) =>
                  handleTimeChange(timeH, e.target.value.padStart(2, "0"))
                }
                className="w-12 text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-1 text-sm text-slate-800 dark:text-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-auto px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
