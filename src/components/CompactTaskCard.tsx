import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { PlannerItem, Priority, Project } from "../types";
import { useTimeEstimation } from "../hooks/useTimeEstimation";
import { BrainCircuitIcon, CalendarIcon } from "./icons";

interface CompactTaskCardProps {
  item: PlannerItem;
  project: Project | null;
  onClick: () => void;
  onComplete: () => void;
  onFocus?: () => void;
  onReschedule?: (newDate: string) => void;
  isDragging?: boolean;
}

const CompactTaskCard: React.FC<CompactTaskCardProps> = ({
  item,
  project,
  onClick,
  onComplete,
  onFocus,
  onReschedule,
  isDragging = false,
}) => {
  const { getTimeEstimate } = useTimeEstimation();
  const [estimate, setEstimate] = useState<{
    suggestedMinutes: number;
    message: string;
  } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDatePicker =
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node);
      const isOutsidePortal =
        portalRef.current && !portalRef.current.contains(event.target as Node);

      if (isOutsideDatePicker && isOutsidePortal) {
        setShowReschedulePicker(false);
      }
    };

    if (showReschedulePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showReschedulePicker]);

  // Load time estimate when component mounts
  useEffect(() => {
    if (item.category && item.estimatedMinutes) {
      getTimeEstimate(item).then((est) => {
        if (
          est &&
          Math.abs(est.suggestedMinutes - item.estimatedMinutes!) > 10
        ) {
          setEstimate(est);
        }
      });
    }
  }, [item.category, item.estimatedMinutes]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "from-red-500/20 to-orange-500/20 border-red-300/50 dark:border-red-700/50";
      case Priority.MEDIUM:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-300/50 dark:border-yellow-700/50";
      case Priority.LOW:
        return "from-green-500/20 to-emerald-500/20 border-green-300/50 dark:border-green-700/50";
    }
  };

  const getPriorityBadgeColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case Priority.MEDIUM:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case Priority.LOW:
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    }
  };

  const getEnergyEmoji = (energy?: string) => {
    switch (energy) {
      case "PEAK":
        return "🔥";
      case "HIGH":
        return "⚡";
      case "MEDIUM":
        return "💪";
      case "LOW":
        return "🌱";
      default:
        return null;
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`
                h-full flex flex-col group relative bg-gradient-to-r ${getPriorityColor(item.priority)}
                backdrop-blur-sm rounded-lg border p-3 transition-all duration-200
                hover:shadow-md hover:scale-[1.02] cursor-pointer
                ${item.requiresFocus && !item.completed ? "ring-2 ring-brand ring-offset-2 dark:ring-offset-slate-900 shadow-brand/20 shadow-lg" : ""}
                ${isDragging ? "opacity-50" : "opacity-100"}
                ${showReschedulePicker ? "z-50 ring-2 ring-purple-500/50 scale-[1.02]" : "z-0"}
            `}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className={`
                        flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200
                        ${
                          item.completed
                            ? "bg-brand border-brand"
                            : "border-slate-300 dark:border-slate-600 hover:border-brand"
                        }
                        flex items-center justify-center
                    `}
        >
          {item.completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div
              className={`
                            font-medium text-sm text-slate-800 dark:text-white
                            ${item.completed ? "line-through opacity-60" : ""}
                        `}
            >
              {item.title}
            </div>
            {item.requiresFocus && !item.completed && (
              <div
                className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand border border-brand/20 dark:bg-brand/20 dark:text-brand-light dark:border-brand/30"
                title="Focus Session required"
              >
                🎯 <span className="hidden sm:inline">Focus</span>
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Time */}
            {(item.startDate || item.dueDate) && (
              <span className="text-slate-600 dark:text-slate-400">
                🕐 {formatTime(item.startDate || item.dueDate || undefined)}
              </span>
            )}

            {/* Priority */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getPriorityBadgeColor(item.priority)}`}
            >
              {item.priority}
            </span>

            {/* Energy */}
            {item.energyLevel && (
              <span className="flex items-center gap-1">
                {getEnergyEmoji(item.energyLevel)}
                <span className="text-slate-600 dark:text-slate-400 text-[10px]">
                  {item.energyLevel}
                </span>
              </span>
            )}

            {/* Duration with Smart Estimate */}
            {item.estimatedMinutes && (
              <span
                className="relative text-slate-600 dark:text-slate-400 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                ⏱️ {item.estimatedMinutes}m{/* Tooltip */}
                {estimate && showTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-64 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] rounded-lg shadow-xl border border-slate-600">
                    <div className="font-semibold mb-1">💡 Smart Estimate</div>
                    <div className="text-slate-200">{estimate.message}</div>
                    <div className="mt-1 text-slate-300">
                      Suggested: {estimate.suggestedMinutes}min
                    </div>
                    <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800 dark:bg-slate-700 border-r border-b border-slate-600"></div>
                  </div>
                )}
              </span>
            )}

            {/* Project */}
            {project && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: `${project.color}20`,
                  color: project.color,
                }}
              >
                {project.name}
              </span>
            )}

            {/* Category */}
            {item.category && (
              <span className="text-slate-500 dark:text-slate-400">
                📁 {item.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (appear on hover) */}
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 flex gap-1 ${
          showReschedulePicker
            ? "opacity-100 z-50"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Reschedule Button */}
        {onReschedule && !item.completed && (
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!showReschedulePicker) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPos({
                    top: rect.bottom + 8,
                    left: rect.left - 150,
                  });
                }
                setShowReschedulePicker(!showReschedulePicker);
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg hover:scale-110 transition-all"
              title="Reschedule"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>

            {/* Date Picker Popup (PORTAL) */}
            {showReschedulePicker &&
              dropdownPos &&
              ReactDOM.createPortal(
                <div
                  ref={portalRef}
                  className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-3 min-w-[200px]"
                  style={{ top: dropdownPos.top, left: dropdownPos.left }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Reschedule to:
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "Today", offset: 0 },
                      { label: "Tomorrow", offset: 1 },
                      { label: "Next Week", offset: 7 },
                      { label: "Custom...", offset: null },
                    ].map(({ label, offset }) => (
                      <button
                        key={label}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (offset !== null) {
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + offset);
                            onReschedule(newDate.toISOString());
                            setShowReschedulePicker(false);
                          } else {
                            // For custom, show native date picker
                            const input = document.createElement("input");
                            input.type = "date";
                            input.onchange = (e) => {
                              const target = e.target as HTMLInputElement;
                              if (target.value) {
                                onReschedule(
                                  new Date(target.value).toISOString(),
                                );
                                setShowReschedulePicker(false);
                              }
                            };
                            input.click();
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>,
                document.body,
              )}
          </div>
        )}

        {/* Focus Button */}
        {onFocus && !item.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFocus();
            }}
            className="p-2 bg-brand hover:bg-brand/90 text-white rounded-lg shadow-lg hover:scale-110 transition-all"
            title="Start Focus Mode"
          >
            <BrainCircuitIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(CompactTaskCard);
