import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  PlayIcon,
  CheckCircleIcon,
  CalendarIcon,
  PauseIcon,
  ClockIcon,
} from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";

const TIMER_PRESETS = {
  pomodoro: 25 * 60, // 25 minutes
  short: 5 * 60, // 5 minutes
  long: 15 * 60, // 15 minutes
};

export const FocusWidget: React.FC = () => {
  const { items, updateItem } = usePlannerItems();
  const setFocusedItemId = useUIStore((state) => state.setFocusedItemId);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(TIMER_PRESETS.pomodoro);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] =
    useState<keyof typeof TIMER_PRESETS>("pomodoro");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus task logic
  const focusTask = useMemo(() => {
    const incompleteTasks = items.filter(
      (item) => item.type === "Task" && !item.completed,
    );
    if (incompleteTasks.length === 0) return null;

    const urgent = incompleteTasks.find(
      (item) =>
        item.priority === "High" &&
        item.dueDate === new Date().toISOString().split("T")[0],
    );
    if (urgent) return urgent;

    const todayTasks = incompleteTasks.filter(
      (item) => item.dueDate === new Date().toISOString().split("T")[0],
    );
    return todayTasks[0] || incompleteTasks[0];
  }, [items]);

  const handleComplete = (id: string) => {
    updateItem(id, {
      completed: true,
      completedDate: new Date().toISOString(),
    });
  };

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Timer complete notification could go here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds]);

  const handlePresetClick = (preset: keyof typeof TIMER_PRESETS) => {
    setSelectedPreset(preset);
    setTimerSeconds(TIMER_PRESETS[preset]);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(TIMER_PRESETS[selectedPreset]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!focusTask) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-4 text-center"
      >
        <CheckCircleIcon className="h-10 w-10 mx-auto mb-2 opacity-80" />
        <h2 className="text-xl font-bold">All caught up!</h2>
        <p className="text-sm opacity-80">Take a break or plan ahead</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.01 }}
      className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-6 text-white mb-4 shadow-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider opacity-80 mb-1">
            Focus on this
          </p>
          <h2 className="text-2xl font-bold mb-2">{focusTask.title}</h2>
          {focusTask.dueDate && (
            <p className="text-sm opacity-80 flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5" />
              {new Date(focusTask.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleComplete(focusTask.id);
          }}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors"
        >
          <CheckCircleIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Pomodoro Timer Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Focus Timer</span>
          </div>
          <div className="text-3xl font-bold font-mono">
            {formatTime(timerSeconds)}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={toggleTimer}
            className="flex-1 bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isTimerRunning ? (
              <>
                <PauseIcon className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Start
              </>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Timer Presets */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePresetClick("pomodoro")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
              selectedPreset === "pomodoro"
                ? "bg-white text-brand"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            25m
          </button>
          <button
            onClick={() => handlePresetClick("short")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
              selectedPreset === "short"
                ? "bg-white text-brand"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            5m
          </button>
          <button
            onClick={() => handlePresetClick("long")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
              selectedPreset === "long"
                ? "bg-white text-brand"
                : "bg-white/20 hover:bg-white/30"
            }`}
          >
            15m
          </button>
        </div>
      </div>

      {/* Quick Action */}
      <button
        onClick={() => setFocusedItemId(focusTask.id)}
        className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl font-medium transition-colors"
      >
        Enter Focus Mode
      </button>
    </motion.div>
  );
};
