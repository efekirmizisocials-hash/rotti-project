/**
 * TypeSelector - Premium animated type tabs
 * Task | Habit | Event
 * Theme-aware: works in both light and dark mode
 */

import React, { useRef, useEffect, useState } from "react";
import { ItemType } from "../../types";
import { itemTypeColors } from "./animations";

interface TypeSelectorProps {
  selectedType: ItemType;
  onTypeChange: (type: ItemType) => void;
}

const typeConfig: { type: ItemType; label: string; icon: string }[] = [
  { type: ItemType.TASK, label: "Task", icon: "✓" },
  { type: ItemType.HABIT, label: "Habit", icon: "↻" },
  { type: ItemType.EVENT, label: "Event", icon: "📅" },
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when selection changes
  useEffect(() => {
    if (!containerRef.current) return;

    const selectedIdx = typeConfig.findIndex((t) => t.type === selectedType);
    const buttons = containerRef.current.querySelectorAll("button");

    if (buttons[selectedIdx]) {
      const btn = buttons[selectedIdx] as HTMLButtonElement;
      setIndicatorStyle({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      });
    }
  }, [selectedType]);

  return (
    <div className="relative overflow-x-auto scrollbar-hide">
      <div
        ref={containerRef}
        className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl relative min-w-max"
      >
        {/* Animated indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            background: `linear-gradient(135deg, ${itemTypeColors[selectedType].primary}, ${itemTypeColors[selectedType].secondary})`,
            boxShadow: `0 0 20px ${itemTypeColors[selectedType].primary}40`,
          }}
        />

        {/* Type buttons */}
        {typeConfig.map(({ type, label, icon }) => {
          const isSelected = selectedType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => onTypeChange(type)}
              className={`
                                relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg 
                                text-sm font-medium transition-all duration-200
                                ${
                                  isSelected
                                    ? "text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                }
                            `}
              style={{
                transform: isSelected ? "scale(1.02)" : "scale(1)",
              }}
            >
              <span className="text-base">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TypeSelector;
