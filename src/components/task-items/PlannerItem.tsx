import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import {
  PlannerItem,
  ItemType,
  Project,
  ItemHandlers,
  EnergyLevel,
} from "../../types";
import { useLocalization } from "../../contexts/LocalizationContext";
import { TaskRenderer } from "./TaskRenderer";
import { HabitRenderer } from "./HabitRenderer";
import { EventRenderer } from "./EventRenderer";
import { useUIStore, UserEnergyLevel } from "../../store/uiStore";

// Map user energy level to numeric value for comparison
const energyLevelToNumber = (
  level: UserEnergyLevel | EnergyLevel | undefined,
): number => {
  if (!level) return 2; // Default to medium
  const map: Record<string, number> = {
    low: 1,
    LOW: 1,
    medium: 2,
    MEDIUM: 2,
    high: 3,
    HIGH: 3,
    peak: 4,
    PEAK: 4,
  };
  return map[level] ?? 2;
};

interface PlannerItemProps {
  item: PlannerItem;
  project: Project | null;
  projects: Project[];
  allItems: PlannerItem[];
  itemHandlers: ItemHandlers;
  isDraggable: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onStartFocus?: (itemId: string) => void;
  onItemClick?: (item: PlannerItem) => void;
}

const PlannerItemComponent: React.FC<PlannerItemProps> = (props) => {
  const {
    item,
    onStartFocus,
    allItems,
    onDragStart,
    onDragOver,
    onDrop,
    isDraggable,
    onItemClick,
  } = props;
  const { language } = useLocalization();
  const userEnergyLevel = useUIStore((state) => state.userEnergyLevel);
  const [newTag, setNewTag] = useState("");
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  // Energy comparison for visual styling
  const userEnergyNum = energyLevelToNumber(userEnergyLevel);
  const taskEnergyNum = energyLevelToNumber(item.energyLevel);
  const isTooDemanding = taskEnergyNum > userEnergyNum;
  const isPerfectMatch = taskEnergyNum <= userEnergyNum && taskEnergyNum > 0;

  const [editingField, setEditingField] = useState<keyof PlannerItem | null>(
    null,
  );
  const [tempValue, setTempValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      if (
        inputRef.current.tagName === "INPUT" &&
        (inputRef.current as HTMLInputElement).type === "text"
      ) {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [editingField]);

  const handleUpdateAndClose = () => {
    if (!editingField) return;

    const updates: Partial<PlannerItem> = {};
    const originalValue = item[editingField as keyof PlannerItem];

    switch (editingField) {
      case "title":
        if (tempValue.trim() && tempValue.trim() !== item.title) {
          updates.title = tempValue.trim();
        }
        break;
      case "estimatedMinutes": {
        const minutes = tempValue === "" ? null : parseInt(tempValue, 10);
        if (minutes === null) {
          if (item.estimatedMinutes !== null) {
            updates.estimatedMinutes = null;
          }
        } else if (!isNaN(minutes) && minutes !== item.estimatedMinutes) {
          updates.estimatedMinutes = minutes;
        }
        break;
      }
      case "dueDate":
      case "startDate":
      case "endDate": {
        let dateValue = null;
        if (tempValue) {
          const d = new Date(tempValue);
          if (!isNaN(d.getTime())) {
            // Check for valid date
            dateValue = d.toISOString();
          }
        }
        if (dateValue !== originalValue) {
          (updates as any)[editingField] = dateValue;
        }
        break;
      }
      default:
        break;
    }

    if (Object.keys(updates).length > 0) {
      props.itemHandlers.handleUpdateItem(item.id, updates);
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUpdateAndClose();
    if (e.key === "Escape") setEditingField(null);
  };

  const startEditing = (field: keyof PlannerItem, initialValue: any) => {
    setEditingField(field);
    if (["dueDate", "startDate", "endDate"].includes(field) && initialValue) {
      const d = new Date(initialValue);
      if (!isNaN(d.getTime())) {
        // Check for valid date
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        const hours = d.getHours().toString().padStart(2, "0");
        const minutes = d.getMinutes().toString().padStart(2, "0");
        setTempValue(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setTempValue("");
      }
    } else {
      setTempValue(initialValue?.toString() ?? "");
    }
  };

  const isBlocked =
    item.type === ItemType.TASK &&
    (item.dependencies ?? []).some((depId) => {
      const depTask = allItems.find((t) => t.id === depId);
      return depTask ? !depTask.completed : false;
    });

  const isHabitCompletedForPeriod = useMemo(() => {
    if (item.type !== ItemType.HABIT || !item.lastCompletedDate) return false;
    const today = new Date();
    const lastCompleted = new Date(item.lastCompletedDate);
    if (item.frequency === "daily")
      return (
        today.toLocaleDateString(language) ===
        lastCompleted.toLocaleDateString(language)
      );
    if (item.frequency === "weekly") {
      const getWeekStart = (d: Date) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return new Date(date.setDate(date.getDate() - date.getDay()));
      };
      return (
        getWeekStart(today).getTime() === getWeekStart(lastCompleted).getTime()
      );
    }
    return false;
  }, [item, language]);

  const rendererProps = {
    ...props,
    isBlocked,
    isHabitCompletedForPeriod,
    editingField,
    tempValue,
    setTempValue,
    inputRef,
    startEditing,
    handleUpdateAndClose,
    handleKeyDown,
    newTag,
    setNewTag,
    setEditingField,
    newSubTaskTitle,
    setNewSubTaskTitle,
  };

  return (
    <div
      draggable={isDraggable && !!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, item.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop && onDrop(e, item.id)}
      onClick={(e) => {
        // Don't trigger detail panel for clicks on buttons, inputs, etc.
        const target = e.target as HTMLElement;
        if (
          target.closest('button, input, select, textarea, a, [role="button"]')
        )
          return;
        onItemClick?.(item);
      }}
      className={`group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-indigo-300/50 dark:hover:border-indigo-600/50 ${item.completed ? "opacity-60" : ""} ${isBlocked ? "bg-slate-50 opacity-75" : ""} ${isDraggable ? "cursor-move" : ""} ${onItemClick ? "cursor-pointer" : ""} ${isTooDemanding && !item.completed ? "opacity-40 grayscale-[30%]" : ""} ${isPerfectMatch && userEnergyLevel === "low" && !item.completed ? "ring-2 ring-green-400/50" : ""} fade-in`}
    >
      {/* Energy indicator */}
      {isTooDemanding && !item.completed && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full font-medium">
          ⚡ Save for later
        </div>
      )}
      {isPerfectMatch && userEnergyLevel === "low" && !item.completed && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full font-medium">
          ✓ Perfect for now
        </div>
      )}
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-[#F06595]/0 group-hover:from-brand/5 group-hover:to-[#F06595]/5 transition-all duration-300 pointer-events-none"></div>

      <div className="relative">
        {item.type === ItemType.TASK && <TaskRenderer {...rendererProps} />}
        {item.type === ItemType.HABIT && <HabitRenderer {...rendererProps} />}
        {item.type === ItemType.EVENT && <EventRenderer {...rendererProps} />}
      </div>
    </div>
  );
};

export default memo(PlannerItemComponent);
