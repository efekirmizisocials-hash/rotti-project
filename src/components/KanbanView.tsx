/**
 * KanbanView — Board-style task management
 *
 * Columns: To Do | In Progress | Done
 *
 * Features:
 * - Drag-and-drop between columns via HTML5 DnD
 * - Animated column transitions
 * - Color-coded priority indicators
 * - Lightweight task cards with project dots, due dates, subtask progress
 * - Click card to open TaskDetailPanel
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  PlannerItem,
  Priority,
  ItemType,
  Project,
  ItemHandlers,
} from "../types";
import { CheckIcon, ClockIcon } from "./icons";
import { motion, AnimatePresence } from "framer-motion";

// ==========================================
// TYPES
// ==========================================

type KanbanStatus = "todo" | "in_progress" | "done";

interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface KanbanViewProps {
  items: PlannerItem[];
  projects: Project[];
  itemHandlers: ItemHandlers;
  onItemClick?: (item: PlannerItem) => void;
}

// ==========================================
// COLUMN DEFINITIONS
// ==========================================

const COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    emoji: "📋",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50/50 dark:bg-blue-900/10",
    borderColor: "border-blue-200 dark:border-blue-800/50",
  },
  {
    id: "in_progress",
    title: "In Progress",
    emoji: "🚀",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50/50 dark:bg-amber-900/10",
    borderColor: "border-amber-200 dark:border-amber-800/50",
  },
  {
    id: "done",
    title: "Done",
    emoji: "✅",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50/50 dark:bg-green-900/10",
    borderColor: "border-green-200 dark:border-green-800/50",
  },
];

// ==========================================
// HELPERS
// ==========================================

const getItemStatus = (item: PlannerItem): KanbanStatus => {
  if (item.completed) return "done";
  if (item.startDate && new Date(item.startDate) <= new Date())
    return "in_progress";
  return "todo";
};

const priorityColor: Record<Priority, string> = {
  [Priority.HIGH]: "bg-red-500",
  [Priority.MEDIUM]: "bg-amber-400",
  [Priority.LOW]: "bg-green-400",
};

// ==========================================
// CARD COMPONENT
// ==========================================

const KanbanCard: React.FC<{
  item: PlannerItem;
  project: Project | null;
  onClick?: () => void;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
}> = ({ item, project, onClick, onDragStart }) => {
  const subtaskCount = item.subTasks?.length || 0;
  const subtaskDone = item.subTasks?.filter((st) => st.completed).length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={(e) => onDragStart(e as any, item.id)}
      onClick={onClick}
      className={`
                group relative p-3.5 bg-white dark:bg-slate-800 rounded-xl
                border border-slate-200/60 dark:border-slate-700/60
                shadow-sm hover:shadow-md hover:border-brand/30 dark:hover:border-brand/40
                cursor-pointer transition-all duration-200
                hover:scale-[1.02] active:scale-[0.98]
                ${item.completed ? "opacity-60" : ""}
            `}
    >
      {/* Priority strip */}
      <div
        className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${priorityColor[item.priority]}`}
      />

      {/* Title */}
      <h4
        className={`text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-2 pl-2 ${item.completed ? "line-through text-slate-400" : ""}`}
      >
        {item.title}
      </h4>

      {/* Metadata Row */}
      <div className="flex items-center gap-2 flex-wrap pl-2">
        {/* Project */}
        {project && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </span>
        )}

        {/* Due date */}
        {item.dueDate && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <ClockIcon className="h-2.5 w-2.5" />
            {new Date(item.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {/* Subtask progress */}
        {subtaskCount > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <CheckIcon className="h-2.5 w-2.5" />
            {subtaskDone}/{subtaskCount}
          </span>
        )}

        {/* Tags */}
        {item.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag.label}
            className="text-[10px] font-medium text-brand/80 dark:text-brand/60"
          >
            #{tag.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const KanbanView: React.FC<KanbanViewProps> = ({
  items,
  projects,
  itemHandlers,
  onItemClick,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(
    null,
  );

  // Categorize items into columns
  const columnItems = useMemo(() => {
    const taskItems = items.filter(
      (i) => i.type === ItemType.TASK || i.type === ItemType.HABIT,
    );
    const map: Record<KanbanStatus, PlannerItem[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    taskItems.forEach((item) => {
      const status = getItemStatus(item);
      map[status].push(item);
    });
    // Sort non-done by priority
    const priorityOrder = {
      [Priority.HIGH]: 0,
      [Priority.MEDIUM]: 1,
      [Priority.LOW]: 2,
    };
    map.todo.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
    map.in_progress.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
    // Show only recent 15 completed, newest first
    map.done.sort((a, b) => {
      const aDate = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const bDate = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return bDate - aDate;
    });
    map.done = map.done.slice(0, 15);
    return map;
  }, [items]);

  // DnD handlers
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: KanbanStatus) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverColumn(columnId);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: KanbanStatus) => {
      e.preventDefault();
      setDragOverColumn(null);
      const itemId = e.dataTransfer.getData("text/plain");
      if (!itemId) return;

      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const currentStatus = getItemStatus(item);
      if (currentStatus === columnId) return;

      // Apply status change
      switch (columnId) {
        case "done":
          itemHandlers.handleUpdateItem(itemId, {
            completed: true,
            completedDate: new Date().toISOString(),
          });
          break;
        case "in_progress":
          itemHandlers.handleUpdateItem(itemId, {
            completed: false,
            completedDate: undefined,
            startDate: new Date().toISOString(),
          });
          break;
        case "todo":
          itemHandlers.handleUpdateItem(itemId, {
            completed: false,
            completedDate: undefined,
            startDate: undefined,
          });
          break;
      }
    },
    [items, itemHandlers],
  );

  const totalItems =
    columnItems.todo.length +
    columnItems.in_progress.length +
    columnItems.done.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {COLUMNS.map((col) => {
        const colItems = columnItems[col.id];
        const isDragTarget = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`
                            flex flex-col rounded-2xl border 
                            ${col.bgColor} ${col.borderColor}
                            ${isDragTarget ? "ring-2 ring-brand/40 ring-offset-2 dark:ring-offset-slate-900 scale-[1.01]" : ""}
                            transition-all duration-200
                        `}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/30">
              <div className="flex items-center gap-2">
                <span className="text-sm">{col.emoji}</span>
                <span className={`text-sm font-bold ${col.color}`}>
                  {col.title}
                </span>
              </div>
              <span className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {colItems.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {colItems.map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    project={
                      projects.find((p) => p.id === item.projectId) || null
                    }
                    onClick={() => onItemClick?.(item)}
                    onDragStart={handleDragStart}
                  />
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {colItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
                  <span className="text-2xl mb-1">
                    {col.id === "done" ? "🎉" : "📭"}
                  </span>
                  <span className="text-xs font-medium">
                    {col.id === "done"
                      ? "Nothing completed yet"
                      : "Drop items here"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
