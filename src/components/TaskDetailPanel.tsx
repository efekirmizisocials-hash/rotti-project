/**
 * TaskDetailPanel — Slide-in Right Panel
 *
 * A comprehensive detail view for planner items, inspired by Todoist/Linear.
 * Slides in from the right edge and shows:
 * - Editable title
 * - Description/notes (markdown)
 * - Subtasks with add/toggle
 * - Tags
 * - Project assignment
 * - Priority, due date, recurrence
 * - Time estimate
 * - Activity timeline
 * - Focus mode trigger
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlannerItem,
  Priority,
  Category,
  SubTask,
  ItemType,
  Tag,
  Project,
} from "../types";
import { useItemHandlers } from "../hooks/useItemHandlers";
import { useProjects } from "../hooks/useProjects";
import { useUIStore } from "../store/uiStore";
import {
  XIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  PlusIcon,
  ChevronDownIcon,
  FlagIcon,
  TagIcon,
  MapPinIcon,
} from "./icons";
import toast from "react-hot-toast";

// ==========================================
// TYPES
// ==========================================

interface TaskDetailPanelProps {
  item: PlannerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<PlannerItem>) => void;
  onDelete?: (id: string) => void;
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

const PriorityBadge: React.FC<{ priority: Priority; onClick?: () => void }> = ({
  priority,
  onClick,
}) => {
  const colors = {
    [Priority.HIGH]:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    [Priority.MEDIUM]:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    [Priority.LOW]:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border transition-colors hover:ring-2 hover:ring-offset-1 ${colors[priority]}`}
    >
      <FlagIcon className="h-3 w-3" />
      {priority}
    </button>
  );
};

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  if (category === Category.NONE) return null;
  const colors: Record<string, string> = {
    [Category.WORK]:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    [Category.PERSONAL]:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    [Category.FITNESS]:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    [Category.LEARNING]:
      "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
    [Category.HOME]:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${colors[category] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}
    >
      {category}
    </span>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  item,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { projects } = useProjects();
  const setFocusedItemId = useUIStore((state) => state.setFocusedItemId);

  // Local editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync local state with item
  useEffect(() => {
    if (item) {
      setTitleValue(item.title);
      setDescriptionValue(item.description || item.content || "");
      setLocationValue(item.location || "");
      setEditingTitle(false);
    }
  }, [item?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (
        e.key === "e" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setEditingTitle(true);
        setTimeout(() => titleRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleTitleSave = useCallback(() => {
    if (item && titleValue.trim() && titleValue !== item.title) {
      onUpdate(item.id, { title: titleValue.trim() });
    }
    setEditingTitle(false);
  }, [item, titleValue, onUpdate]);

  const handleDescriptionSave = useCallback(() => {
    if (item && descriptionValue !== (item.description || item.content || "")) {
      onUpdate(item.id, { description: descriptionValue });
    }
  }, [item, descriptionValue, onUpdate]);

  const handleLocationSave = useCallback(() => {
    if (item && locationValue !== (item.location || "")) {
      onUpdate(item.id, { location: locationValue });
    }
  }, [item, locationValue, onUpdate]);

  const handlePriorityChange = useCallback(
    (priority: Priority) => {
      if (item) {
        onUpdate(item.id, { priority });
        setShowPriorityPicker(false);
      }
    },
    [item, onUpdate],
  );

  const handleCategoryChange = useCallback(
    (category: Category) => {
      if (item) {
        onUpdate(item.id, { category });
        setShowCategoryPicker(false);
      }
    },
    [item, onUpdate],
  );

  const handleProjectChange = useCallback(
    (projectId: string | null) => {
      if (item) {
        onUpdate(item.id, { projectId });
        setShowProjectPicker(false);
      }
    },
    [item, onUpdate],
  );

  const handleToggleComplete = useCallback(() => {
    if (item) {
      onUpdate(item.id, {
        completed: !item.completed,
        completedDate: !item.completed ? new Date().toISOString() : undefined,
      });
    }
  }, [item, onUpdate]);

  const handleAddSubTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!item || !newSubTaskTitle.trim()) return;
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        title: newSubTaskTitle.trim(),
        completed: false,
        estimatedTime: null,
      };
      const existing = item.subTasks || [];
      onUpdate(item.id, { subTasks: [...existing, newSubTask] });
      setNewSubTaskTitle("");
    },
    [item, newSubTaskTitle, onUpdate],
  );

  const handleToggleSubTask = useCallback(
    (subTaskId: string) => {
      if (!item) return;
      const updated = (item.subTasks || []).map((st) =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st,
      );
      onUpdate(item.id, { subTasks: updated });
    },
    [item, onUpdate],
  );

  const handleDeleteSubTask = useCallback(
    (subTaskId: string) => {
      if (!item) return;
      const updated = (item.subTasks || []).filter((st) => st.id !== subTaskId);
      onUpdate(item.id, { subTasks: updated });
    },
    [item, onUpdate],
  );

  const handleAddTag = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!item || !newTagValue.trim()) return;
      const existing = item.tags || [];
      if (existing.some((t) => t.label === newTagValue.trim())) return;
      onUpdate(item.id, {
        tags: [
          ...existing,
          { label: newTagValue.trim(), type: "standard" as any },
        ],
      });
      setNewTagValue("");
    },
    [item, newTagValue, onUpdate],
  );

  const handleRemoveTag = useCallback(
    (tagLabel: string) => {
      if (!item) return;
      onUpdate(item.id, {
        tags: (item.tags || []).filter((t) => t.label !== tagLabel),
      });
    },
    [item, onUpdate],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!item) return;
      onUpdate(item.id, { dueDate: e.target.value || null });
    },
    [item, onUpdate],
  );

  // ==========================================
  // DERIVED DATA
  // ==========================================

  const itemProject = useMemo(
    () => (item ? projects.find((p) => p.id === item.projectId) || null : null),
    [item, projects],
  );

  const subtaskProgress = useMemo(() => {
    if (!item?.subTasks?.length) return null;
    const completed = item.subTasks.filter((st) => st.completed).length;
    return {
      completed,
      total: item.subTasks.length,
      percent: Math.round((completed / item.subTasks.length) * 100),
    };
  }, [item?.subTasks]);

  if (!item) return null;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* ---- HEADER ---- */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleComplete}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-brand"
                  }`}
                >
                  {item.completed && <CheckIcon className="h-3.5 w-3.5" />}
                </button>
                <CategoryBadge category={item.category} />
                <PriorityBadge
                  priority={item.priority}
                  onClick={() => setShowPriorityPicker(!showPriorityPicker)}
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setFocusedItemId(item.id);
                    onClose();
                  }}
                  className="p-2 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                  title="Start Focus Session"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      onClose();
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Priority Picker Dropdown */}
            <AnimatePresence>
              {showPriorityPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Priority:
                    </span>
                    {[Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => (
                      <PriorityBadge
                        key={p}
                        priority={p}
                        onClick={() => handlePriorityChange(p)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ---- SCROLLABLE CONTENT ---- */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">
                {/* Title */}
                {editingTitle ? (
                  <input
                    ref={titleRef}
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTitleSave();
                      if (e.key === "Escape") {
                        setTitleValue(item.title);
                        setEditingTitle(false);
                      }
                    }}
                    className="w-full text-xl font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-brand focus:outline-none pb-1"
                    autoFocus
                  />
                ) : (
                  <h2
                    onClick={() => {
                      setEditingTitle(true);
                      setTimeout(() => titleRef.current?.focus(), 50);
                    }}
                    className={`text-xl font-bold cursor-text hover:text-brand transition-colors ${item.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}
                  >
                    {item.title}
                  </h2>
                )}

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Notes
                  </label>
                  <textarea
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    onBlur={handleDescriptionSave}
                    className="w-full h-24 p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand focus:outline-none resize-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    placeholder="Add notes, context, or details..."
                  />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" /> Due Date
                    </label>
                    <input
                      type="date"
                      value={item.dueDate ? item.dueDate.slice(0, 10) : ""}
                      onChange={handleDateChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  {/* Project */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Project
                    </label>
                    <button
                      onClick={() => setShowProjectPicker(!showProjectPicker)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left"
                    >
                      {itemProject ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: itemProject.color }}
                          />
                          <span className="text-slate-700 dark:text-slate-200">
                            {itemProject.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                      <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    {showProjectPicker && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1 max-h-36 overflow-y-auto">
                        <button
                          onClick={() => handleProjectChange(null)}
                          className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          None
                        </button>
                        {projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleProjectChange(p.id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Category
                    </label>
                    <button
                      onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-left"
                    >
                      <span className="text-slate-700 dark:text-slate-200">
                        {item.category}
                      </span>
                      <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    {showCategoryPicker && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1">
                        {Object.values(Category).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Time Estimate */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" /> Estimate
                    </label>
                    <input
                      type="number"
                      value={item.estimatedMinutes || ""}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          estimatedMinutes: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-none text-slate-700 dark:text-slate-200"
                      placeholder="Minutes"
                      min={0}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" /> Location
                    </label>
                    <input
                      type="text"
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                      onBlur={handleLocationSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleLocationSave();
                      }}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-none text-slate-700 dark:text-slate-200"
                      placeholder="Location..."
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <TagIcon className="h-3 w-3" /> Tags
                  </label>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {(item.tags || []).map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md group"
                      >
                        #{tag.label}
                        <button
                          onClick={() => handleRemoveTag(tag.label)}
                          className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <form onSubmit={handleAddTag} className="inline">
                      <input
                        value={newTagValue}
                        onChange={(e) => setNewTagValue(e.target.value)}
                        className="w-20 px-2 py-1 text-xs bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-brand text-slate-600 dark:text-slate-300 placeholder-slate-400"
                        placeholder="+ add"
                      />
                    </form>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subtasks{" "}
                      {subtaskProgress &&
                        `(${subtaskProgress.completed}/${subtaskProgress.total})`}
                    </label>
                    {subtaskProgress && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${subtaskProgress.percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {subtaskProgress.percent}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(item.subTasks || []).map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group"
                      >
                        <button
                          onClick={() => handleToggleSubTask(st.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                            st.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-brand"
                          }`}
                        >
                          {st.completed && (
                            <CheckIcon className="h-2.5 w-2.5" />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${st.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}
                        >
                          {st.title}
                        </span>
                        <button
                          onClick={() => handleDeleteSubTask(st.id)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <form
                      onSubmit={handleAddSubTask}
                      className="flex items-center gap-2 p-2"
                    >
                      <PlusIcon className="h-4 w-4 text-slate-400" />
                      <input
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        placeholder="Add subtask..."
                      />
                    </form>
                  </div>
                </div>

                {/* Activity / Metadata Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Created{" "}
                    {new Date(item.creationDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {item.completedDate && (
                    <p className="text-xs text-green-500">
                      ✅ Completed{" "}
                      {new Date(item.completedDate).toLocaleDateString(
                        "en-US",
                        { weekday: "short", month: "short", day: "numeric" },
                      )}
                    </p>
                  )}
                  {item.focusPoints && item.focusPoints > 0 && (
                    <p className="text-xs text-purple-500">
                      ⚡ {item.focusPoints} focus points earned
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---- FOOTER ---- */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono text-[10px] border border-slate-200 dark:border-slate-600">
                  E
                </kbd>{" "}
                edit title ·{" "}
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono text-[10px] border border-slate-200 dark:border-slate-600">
                  Esc
                </kbd>{" "}
                close
              </span>
              <button
                onClick={() => {
                  setFocusedItemId(item.id);
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-brand to-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-brand/20 active:scale-95 transition-all"
              >
                <ClockIcon className="h-4 w-4" />
                Start Focus
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailPanel;
