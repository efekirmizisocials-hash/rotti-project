/**
 * QuickAddBar - Premium Zero-Friction Task Capture
 *
 * The hero component of the planner. Always visible at top.
 *
 * Features:
 * - Gradient glow border on focus
 * - Animated cycling placeholder text
 * - Smart date shortcut pills (Today, Tomorrow, Next Week)
 * - AI parsing for dates, tags, priority (when enabled)
 * - Voice input support
 * - Success animation flash on task add
 * - `/` keyboard shortcut to focus
 * - Tab to open full composer
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  PlannerItem,
  ItemType,
  Priority,
  Category,
  RecurrenceRule,
} from "../types";
import {
  PlusIcon,
  MicrophoneIcon,
  SparklesIcon,
  ChevronDownIcon,
  ClockIcon,
} from "./icons";
import { parseItemFromPrompt } from "../mocks/aiMock";
import { useLocalization } from "../contexts/LocalizationContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useProjects } from "../hooks/useProjects";
import { parseTagFromString } from "../utils/helpers";
import toast from "react-hot-toast";

interface QuickAddBarProps {
  onAddItem: (
    itemData: Omit<PlannerItem, "id" | "order"> & {
      projectName?: string | null;
    },
  ) => void;
  onOpenFullComposer?: () => void;
}

const PLACEHOLDER_EXAMPLES = [
  'Add a task… "Buy groceries"',
  'Try "Call the dentist tomorrow at 3pm"',
  'Or "Gym session #fitness"',
  'Or "Report due Friday !high"',
  'Or "Team sync every Monday"',
];

// Item type config
const ITEM_TYPES = [
  {
    type: ItemType.TASK,
    label: "Task",
    emoji: "✅",
    color:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  {
    type: ItemType.EVENT,
    label: "Event",
    emoji: "📅",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  {
    type: ItemType.HABIT,
    label: "Habit",
    emoji: "🔁",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  {
    type: ItemType.NOTE,
    label: "Note",
    emoji: "📝",
    color:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
];

// Parse recurrence from natural language
const parseRecurrence = (
  text: string,
): { rule: RecurrenceRule | null; cleanText: string } => {
  const lower = text.toLowerCase();
  let rule: RecurrenceRule | null = null;
  let cleanText = text;

  // "every day" / "daily"
  if (/\b(every\s*day|daily)\b/i.test(lower)) {
    rule = { frequency: "daily", interval: 1 };
    cleanText = text.replace(/\b(every\s*day|daily)\b/i, "").trim();
  }
  // "every week" / "weekly"
  else if (/\b(every\s*week|weekly)\b/i.test(lower)) {
    rule = { frequency: "weekly", interval: 1 };
    cleanText = text.replace(/\b(every\s*week|weekly)\b/i, "").trim();
  }
  // "every monday/tuesday/..."
  else {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    const match = lower.match(/every\s+(\w+)/i);
    if (match && dayMap[match[1]] !== undefined) {
      rule = {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [dayMap[match[1]]],
      };
      cleanText = text.replace(/every\s+\w+/i, "").trim();
    }
  }
  // "every month" / "monthly"
  if (/\b(every\s*month|monthly)\b/i.test(lower)) {
    rule = { frequency: "monthly", interval: 1 };
    cleanText = text.replace(/\b(every\s*month|monthly)\b/i, "").trim();
  }

  return { rule, cleanText };
};

// Parse time estimate from input
const parseTimeEstimate = (
  text: string,
): { minutes: number | null; cleanText: string } => {
  const match =
    text.match(/~?(\d+)\s*(min|mins|minutes|m)\b/i) ||
    text.match(/~?(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours?)\b/i);
  if (!match) return { minutes: null, cleanText: text };
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const minutes = unit.startsWith("h") ? Math.round(val * 60) : val;
  const cleanText = text.replace(match[0], "").trim();
  return { minutes, cleanText };
};

const QuickAddBar: React.FC<QuickAddBarProps> = ({
  onAddItem,
  onOpenFullComposer,
}) => {
  const { language, t } = useLocalization();
  const { projects } = useProjects();
  const [input, setInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ItemType>(ItemType.TASK);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const projectPickerRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    startListening,
    stopListening,
    isSupported,
    error: voiceError,
  } = useVoiceInput({
    onResult: (transcript) =>
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript)),
    onError: (err) => console.error("Voice Error:", err),
  });

  // Cycle placeholder text
  useEffect(() => {
    if (isFocused || input) return;
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isFocused, input]);

  // Global keyboard shortcut: "/" to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Smart date helpers
  const dateShortcuts = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonday = new Date(today);
    nextMonday.setDate(
      nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7),
    );

    return [
      { label: "Today", date: today.toISOString(), icon: "☀️" },
      { label: "Tomorrow", date: tomorrow.toISOString(), icon: "🌅" },
      { label: "Next Mon", date: nextMonday.toISOString(), icon: "📆" },
    ];
  }, []);

  // Close project picker on outside click
  useEffect(() => {
    if (!showProjectPicker) return;
    const handler = (e: MouseEvent) => {
      if (
        projectPickerRef.current &&
        !projectPickerRef.current.contains(e.target as Node)
      ) {
        setShowProjectPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProjectPicker]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isParsing) return;

      const rawInput = input.trim();

      // Parse recurrence and time from input — pure/local, unrelated to AI.
      const { rule: recurrenceRule, cleanText: afterRecurrence } =
        parseRecurrence(rawInput);
      const { minutes: estimatedMinutes, cleanText: cleanTitle } =
        parseTimeEstimate(afterRecurrence);

      const typeLabel =
        ITEM_TYPES.find((t) => t.type === selectedType)?.label || "Task";

      // Parse-on-submit: await the AI parse before inserting, so
      // its metadata (category, priority, dueDate, tags) is never dropped by
      // a race with the insert. Never blocks task creation — on failure or
      // null, fall through with the raw title and no AI metadata.
      setIsParsing(true);
      let parsed: Partial<PlannerItem> | null;
      try {
        parsed = await parseItemFromPrompt(rawInput, language as "en" | "tr");
      } catch (err) {
        parsed = null;
      }
      setIsParsing(false);

      const taskData: Omit<PlannerItem, "id" | "order"> & {
        projectName?: string | null;
      } = {
        type: selectedType,
        title: parsed?.title || cleanTitle.trim() || rawInput,
        category: parsed?.category || Category.NONE,
        priority: parsed?.priority || Priority.LOW,
        tags: parsed?.tags || [],
        projectId: selectedProjectId,
        projectName: (parsed as any)?.projectName || null,
        creationDate: new Date().toISOString(),
        dueDate: selectedDate || parsed?.dueDate,
        completed: false,
        subTasks: [],
        dependencies: [],
        reminderOffset: null,
        reminderSent: false,
        recurrenceRule: recurrenceRule || null,
        estimatedMinutes: estimatedMinutes,
        ...(selectedType === ItemType.HABIT
          ? {
              frequency:
                recurrenceRule?.frequency === "weekly" ? "weekly" : "daily",
              streak: 0,
            }
          : {}),
      };

      onAddItem(taskData);

      // Success feedback
      setShowSuccess(true);
      toast.success(`${typeLabel} added!`, {
        duration: 1500,
        style: {
          background: "#10b981",
          color: "#fff",
          fontWeight: "600",
          borderRadius: "12px",
        },
        iconTheme: { primary: "#fff", secondary: "#10b981" },
      });
      setTimeout(() => setShowSuccess(false), 600);

      // Reset
      setInput("");
      setSelectedDate(null);
    },
    [
      input,
      isParsing,
      language,
      selectedDate,
      selectedType,
      selectedProjectId,
      onAddItem,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Tab" && onOpenFullComposer) {
      e.preventDefault();
      onOpenFullComposer();
    }
    if (e.key === "Escape") {
      setInput("");
      setSelectedDate(null);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative mb-5">
      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
                        flex items-center gap-2 rounded-2xl transition-all duration-300
                        bg-white dark:bg-slate-800/90
                        border-2
                        ${
                          showSuccess
                            ? "border-green-400 dark:border-green-500 animate-success-flash"
                            : isFocused
                              ? "border-brand dark:border-brand shadow-lg shadow-brand/10 dark:shadow-brand/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }
                        ${!isFocused && !showSuccess ? "animate-quickadd-glow" : ""}
                    `}
        >
          {/* Type Selector */}
          <div className="pl-3 flex items-center gap-1">
            {ITEM_TYPES.map(({ type, emoji, color }) => (
              <button
                key={type}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSelectedType(type)}
                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all duration-150 ${
                  selectedType === type
                    ? `${color} border ring-1 ring-offset-1 ring-brand/30 scale-110`
                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105"
                }`}
                title={type}
                data-tutorial={`type-selector-${type.toLowerCase()}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIdx]}
            className="flex-1 py-3.5 px-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium"
            data-tutorial="quick-add-input"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pr-3">
            {/* AI Parsing Indicator */}
            {isParsing && (
              <div className="p-2">
                <SparklesIcon className="h-4 w-4 text-brand animate-spin" />
              </div>
            )}

            {/* Voice Input — disabled with an explanatory tooltip when unsupported, rather than hidden */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              title={isSupported ? undefined : (voiceError ?? undefined)}
              aria-label={
                isSupported ? undefined : "Voice input is not available"
              }
              className={`p-2 rounded-xl transition-all duration-200 ${
                !isSupported
                  ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                  : isListening
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              style={
                isListening ? { animation: "pulse-ring 1.5s infinite" } : {}
              }
            >
              <MicrophoneIcon className="h-4 w-4" />
            </button>

            {/* Project Picker */}
            <div ref={projectPickerRef} className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-1 text-xs font-medium ${
                  selectedProjectId
                    ? "bg-brand/10 text-brand dark:text-brand-light"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
                title="Assign project"
              >
                {selectedProjectId ? (
                  <>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          projects.find((p) => p.id === selectedProjectId)
                            ?.color || "#6366f1",
                      }}
                    />
                    <span className="hidden sm:inline max-w-[60px] truncate">
                      {projects.find((p) => p.id === selectedProjectId)?.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px]">📁</span>
                )}
              </button>
              {showProjectPicker && (
                <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-20 py-1 max-h-44 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedProjectId(null);
                      setShowProjectPicker(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    No project
                  </button>
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setShowProjectPicker(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expand to Full Composer */}
            {onOpenFullComposer && (
              <button
                type="button"
                onClick={onOpenFullComposer}
                className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all duration-200"
                title="Open full composer (Tab)"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || isParsing}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                input.trim() && !isParsing
                  ? "bg-gradient-to-r from-brand to-[#EE5A6F] text-white shadow-md shadow-brand/25 hover:shadow-lg hover:shadow-brand/30 active:scale-95"
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
              data-tutorial="quick-add-submit"
            >
              {isParsing ? (
                <span className="flex items-center gap-1.5">
                  <SparklesIcon className="h-4 w-4 animate-spin" />
                  Adding…
                </span>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Smart Date Shortcut Pills — shown when focused and no input yet */}
      {isFocused && (
        <div className="flex items-center gap-2 mt-2.5 px-1 animate-panel-fade-in">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">
            Quick date:
          </span>
          {dateShortcuts.map(({ label, date, icon }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur
                setSelectedDate(selectedDate === date ? null : date);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                selectedDate === date
                  ? "bg-brand/15 dark:bg-brand/20 text-brand dark:text-brand-light border border-brand/30 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}

          {/* Keyboard hint */}
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 hidden sm:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
              Tab
            </kbd>
            <span>full composer</span>
          </span>
        </div>
      )}

      {/* Hint — only when not focused */}
      {!isFocused && (
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-400 dark:text-slate-500">
          <span>Type naturally: "Call the dentist tomorrow at 3pm #work"</span>
          <span className="hidden sm:inline items-center gap-1">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono border border-slate-200 dark:border-slate-600 mx-0.5">
              /
            </kbd>{" "}
            to focus
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickAddBar;
