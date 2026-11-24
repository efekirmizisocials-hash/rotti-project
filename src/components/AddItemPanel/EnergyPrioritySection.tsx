/**
 * EnergyPrioritySection - Priority and Energy selectors
 * Premium animated selectors with color psychology
 * Theme-aware: works in both light and dark mode
 */

import React from "react";
import {
  FlagIcon,
  Battery0Icon,
  Battery50Icon,
  Battery100Icon,
  BoltIcon,
} from "../icons";
import { Priority, EnergyLevel } from "../../types";
import { priorityColors, energyColors } from "./animations";

interface EnergyPrioritySectionProps {
  priority: Priority;
  energyLevel: EnergyLevel | undefined;
  onPriorityChange: (priority: Priority) => void;
  onEnergyChange: (energy: EnergyLevel) => void;
}

const priorityOptions = [
  { value: Priority.LOW, label: "Low", icon: "○" },
  { value: Priority.MEDIUM, label: "Med", icon: "◐" },
  { value: Priority.HIGH, label: "High", icon: "●" },
];

const energyOptions = [
  {
    value: EnergyLevel.LOW,
    label: "Low",
    icon: <Battery0Icon className="w-6 h-6" />,
  },
  {
    value: EnergyLevel.MEDIUM,
    label: "Med",
    icon: <Battery50Icon className="w-6 h-6" />,
  },
  {
    value: EnergyLevel.HIGH,
    label: "High",
    icon: <Battery100Icon className="w-6 h-6" />,
  },
  {
    value: EnergyLevel.PEAK,
    label: "Peak",
    icon: <BoltIcon className="w-6 h-6" />,
  },
];

export const EnergyPrioritySection: React.FC<EnergyPrioritySectionProps> = ({
  priority,
  energyLevel,
  onPriorityChange,
  onEnergyChange,
}) => {
  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
        <FlagIcon className="h-4 w-4" />
        <span>Priority & Energy</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority selector */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map(({ value, label, icon }) => {
              const isSelected = priority === value;
              const colors = priorityColors[value];

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPriorityChange(value)}
                  className={`
                                        flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl 
                                        text-sm font-medium transition-all duration-300 border
                                        ${
                                          isSelected
                                            ? "shadow-lg"
                                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                        }
                                    `}
                  style={
                    isSelected
                      ? {
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                          color: colors.text,
                          boxShadow: `0 4px 15px ${colors.border}40`,
                        }
                      : {}
                  }
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Energy level selector */}
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-500 mb-2">
            Energy Required
          </label>
          <div className="flex gap-1.5">
            {energyOptions.map(({ value, label, icon }, idx) => {
              const isSelected = energyLevel === value;
              const isActive =
                energyLevel &&
                Object.values(EnergyLevel).indexOf(energyLevel) >= idx;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onEnergyChange(value)}
                  title={label}
                  className={`
                                        flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl 
                                        text-sm font-medium transition-all duration-300 border
                                        ${
                                          isSelected
                                            ? "border-2 shadow-lg"
                                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
                                        }
                                    `}
                  style={{
                    borderColor: isSelected ? energyColors[value] : undefined,
                    boxShadow: isSelected
                      ? `0 4px 15px ${energyColors[value]}40`
                      : undefined,
                  }}
                >
                  <span className="text-xl flex items-center justify-center text-current">
                    {icon}
                  </span>

                  <span
                    className={`text-xs ${isSelected ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"}`}
                  >
                    {label}
                  </span>
                  {/* Battery fill indicator */}
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: isActive ? "100%" : "0%",
                        backgroundColor: energyColors[value],
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyPrioritySection;
