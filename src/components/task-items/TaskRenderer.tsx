import React, { useState, useEffect, useRef } from "react";
import {
  PlannerItem,
  Priority,
  ItemType,
  Project,
  ItemHandlers,
} from "../../types";
import {
  DragHandleIcon,
  LockClosedIcon,
  CalendarEventIcon,
  RepeatIcon,
  CalendarIcon,
  FlagIcon,
  ClockIcon,
  BrainCircuitIcon,
  LinkIcon,
  SplitIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
} from "../icons";
import { useLocalization } from "../../contexts/LocalizationContext";
import { breakdownTask } from "../../mocks/aiMock";
import SharedItemDetails from "./SharedItemDetails";
import { priorityClasses, formatDate, formatTime } from "./constants";

interface TaskRendererProps {
  item: PlannerItem;
  project: Project | null;
  projects: Project[];
  allItems: PlannerItem[];
  itemHandlers: ItemHandlers;
  isDraggable: boolean;
  isBlocked: boolean;
  editingField: keyof PlannerItem | null;
  tempValue: string;
  setTempValue: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLSelectElement | null>;
  startEditing: (field: keyof PlannerItem, value: any) => void;
  handleUpdateAndClose: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  setEditingField: (field: keyof PlannerItem | null) => void;
  newSubTaskTitle: string;
  setNewSubTaskTitle: (title: string) => void;
}

export const TaskRenderer: React.FC<TaskRendererProps> = (props) => {
  const {
    item,
    project,
    projects,
    allItems,
    itemHandlers,
    isDraggable,
    isBlocked,
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
  } = props;
  const { language, t } = useLocalization();
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isDependencyPickerOpen, setDependencyPickerOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [descValue, setDescValue] = useState(item.description || "");
  const dependencyPickerRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // Keep local description in sync
  useEffect(() => {
    setDescValue(item.description || "");
  }, [item.description]);

  const handleDescSave = () => {
    if (descValue !== (item.description || "")) {
      itemHandlers.handleUpdateItem(item.id, { description: descValue });
    }
    setIsDescExpanded(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dependencyPickerRef.current &&
        !dependencyPickerRef.current.contains(event.target as Node)
      )
        setDependencyPickerOpen(false);
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      )
        setIsOptionsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBreakdown = async () => {
    if (!item.subTasks || item.subTasks.length > 0) return;
    setIsBreakingDown(true);
    const subTaskData = await breakdownTask(
      item.title,
      language as "en" | "tr",
    );
    itemHandlers.handleAddSubTasks(item.id, subTaskData);
    setIsBreakingDown(false);
  };

  const handleAddSubTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newSubTaskTitle.trim();
    if (trimmedTitle) {
      itemHandlers.handleAddSingleSubTask(item.id, trimmedTitle);
      setNewSubTaskTitle("");
    }
  };

  const isOverdue =
    item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;
  const dependencyTasks = (item.dependencies ?? [])
    .map((depId) => allItems.find((t) => t.id === depId))
    .filter(Boolean) as PlannerItem[];

  return (
    <>
      <div className="flex items-start gap-3">
        {isDraggable && (
          <div className="mt-1 text-slate-400 cursor-grab">
            <DragHandleIcon title={t("taskItem.dragHandle")} />
          </div>
        )}
        <button
          type="button"
          onClick={() => itemHandlers.handleToggleComplete(item.id)}
          disabled={isBlocked}
          data-tutorial="task-checkbox"
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 active:scale-90 ${
            item.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-brand"
          } ${isBlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {item.completed && <CheckIcon className="h-3.5 w-3.5" />}
        </button>
        <div className="flex-grow">
          {editingField === "title" ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleUpdateAndClose}
              onKeyDown={handleKeyDown}
              className="font-medium text-slate-800 bg-slate-100 rounded-md -m-1 p-1 w-full outline-none ring-2 ring-indigo-300"
            />
          ) : (
            <p
              onClick={() => startEditing("title", item.title)}
              className={`font-medium flex items-center gap-2 cursor-pointer rounded -m-1 p-1 hover:bg-slate-100 ${item.completed ? "line-through text-slate-500" : ""} ${isBlocked ? "text-slate-500" : "text-slate-800"}`}
            >
              {isBlocked && (
                <span title={t("taskItem.blocked")}>
                  <LockClosedIcon className="h-4 w-4 text-slate-400" />
                </span>
              )}{" "}
              {item.title}
            </p>
          )}
          {/* Inline Description/Notes */}
          {isDescExpanded ? (
            <textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescSave}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleDescSave();
              }}
              className="mt-1.5 w-full text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-brand resize-none"
              rows={3}
              placeholder="Add notes, context, or details..."
              autoFocus
            />
          ) : item.description ? (
            <p
              onClick={(e) => {
                e.stopPropagation();
                setIsDescExpanded(true);
              }}
              className="mt-1 text-xs text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 line-clamp-2 transition-colors"
            >
              📝 {item.description}
            </p>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDescExpanded(true);
              }}
              className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-brand cursor-pointer transition-colors"
            >
              + Add note
            </button>
          )}
          {dependencyTasks.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              <span className="font-medium">{t("taskItem.blockedBy")}:</span>
              <span className="ml-1">
                {dependencyTasks.map((dep) => (
                  <span
                    key={dep.id}
                    className={`mr-1 px-1.5 py-0.5 rounded ${dep.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {dep.title}
                  </span>
                ))}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 flex-wrap">
            {editingField === "startDate" ? (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="datetime-local"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleUpdateAndClose}
                onKeyDown={handleKeyDown}
                className="text-xs p-1 bg-slate-100 border-slate-200 rounded-md ring-2 ring-indigo-300"
              />
            ) : item.startDate ? (
              <div
                onClick={() => startEditing("startDate", item.startDate)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 cursor-pointer transition hover:ring-2 hover:ring-indigo-200"
              >
                <CalendarEventIcon className="h-3.5 w-3.5" />
                {t("taskItem.starts")} {formatDate(item.startDate, language)}
              </div>
            ) : null}
            {editingField === "dueDate" ? (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="datetime-local"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleUpdateAndClose}
                onKeyDown={handleKeyDown}
                className="text-xs p-1 bg-slate-100 border-slate-200 rounded-md ring-2 ring-indigo-300"
              />
            ) : item.dueDate ? (
              <div
                onClick={() => startEditing("dueDate", item.dueDate)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition hover:ring-2 hover:ring-indigo-200 ${isOverdue ? "bg-red-100 text-red-700" : "bg-slate-100"}`}
              >
                {item.recurrenceRule && (
                  <RepeatIcon
                    className="h-3.5 w-3.5"
                    title={t("taskItem.recurringTask")}
                  />
                )}
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(item.dueDate, language)} {t("taskItem.at")}{" "}
                {formatTime(item.dueDate, language)}
              </div>
            ) : (
              <button
                onClick={() =>
                  startEditing("dueDate", new Date().toISOString())
                }
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <CalendarIcon className="h-3.5 w-3.5" /> {t("taskItem.addDate")}
              </button>
            )}
            {editingField === "priority" ? (
              <select
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                value={item.priority}
                onChange={(e) => {
                  itemHandlers.handleUpdateItem(item.id, {
                    priority: e.target.value as Priority,
                  });
                  setEditingField(null);
                }}
                onBlur={() => setEditingField(null)}
                className="text-xs font-medium bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-md p-1 capitalize"
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <div
                onClick={() => setEditingField("priority")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 hover:ring-2 hover:scale-105 shadow-sm ${priorityClasses[item.priority].ring} ${priorityClasses[item.priority].bg} ${priorityClasses[item.priority].text}`}
              >
                <FlagIcon className="h-3.5 w-3.5" />
                {item.priority}
              </div>
            )}
            {editingField === "estimatedMinutes" ? (
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleUpdateAndClose}
                onKeyDown={handleKeyDown}
                className="w-20 text-xs p-1 bg-slate-100 border-slate-200 rounded-md"
                min="0"
                placeholder={t("taskItem.minutes")}
              />
            ) : item.estimatedMinutes != null ? (
              <div
                onClick={() =>
                  startEditing("estimatedMinutes", item.estimatedMinutes)
                }
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 cursor-pointer transition hover:ring-2 hover:ring-indigo-200"
              >
                <ClockIcon className="h-3.5 w-3.5" />
                {item.estimatedMinutes} {t("taskItem.min")}
              </div>
            ) : (
              <button
                onClick={() => startEditing("estimatedMinutes", "30")}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <ClockIcon className="h-3.5 w-3.5" />{" "}
                {t("taskItem.addEstimate")}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons - Redesigned */}
        <div className="flex items-center gap-2">
          {/* Focus Button - Primary Action */}
          <button
            onClick={() => itemHandlers.handleStartFocus(item.id)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand to-purple-600 hover:from-brand/90 hover:to-purple-600/90 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
            title={t("taskItem.startFocus")}
          >
            <BrainCircuitIcon className="h-4 w-4" />
            <span>Focus</span>
          </button>

          {/* Options Menu */}
          <div className="relative" ref={optionsMenuRef}>
            <button
              onClick={() => setIsOptionsMenuOpen((p) => !p)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="More options"
            >
              <span className="text-lg font-bold">⋮</span>
            </button>

            {isOptionsMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1">
                {/* Dependencies Option */}
                <button
                  onClick={() => {
                    setDependencyPickerOpen((p) => !p);
                    setIsOptionsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                  <span>Dependencies</span>
                </button>

                {/* Breakdown Option */}
                <button
                  onClick={() => {
                    handleBreakdown();
                    setIsOptionsMenuOpen(false);
                  }}
                  disabled={isBreakingDown || (item.subTasks?.length ?? 0) > 0}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SplitIcon className="h-4 w-4 text-slate-400" />
                  <span>Breakdown</span>
                </button>

                {/* Delete Option */}
                <button
                  onClick={() => {
                    itemHandlers.handleDeleteItem(item.id);
                    setIsOptionsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* Dependency Picker Modal (triggered from menu) */}
            {isDependencyPickerOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-30"
                ref={dependencyPickerRef}
              >
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-white">
                    {t("taskItem.dependsOn")}
                  </h4>
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {allItems
                    .filter(
                      (t) =>
                        t.id !== item.id &&
                        t.type === ItemType.TASK &&
                        !t.completed,
                    )
                    .map((dep) => (
                      <label
                        key={dep.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={(item.dependencies ?? []).includes(dep.id)}
                          onChange={(e) =>
                            e.target.checked
                              ? itemHandlers.handleAddDependency(
                                  item.id,
                                  dep.id,
                                )
                              : itemHandlers.handleRemoveDependency(
                                  item.id,
                                  dep.id,
                                )
                          }
                          className="h-5 w-5 rounded"
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300">
                          {dep.title}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SharedItemDetails
        item={item}
        project={project}
        projects={projects}
        itemHandlers={itemHandlers}
        newTag={newTag}
        setNewTag={setNewTag}
        editingField={editingField}
        setEditingField={setEditingField}
        inputRef={inputRef}
      />
      <div className="mt-4 pl-10 space-y-2">
        {(item.subTasks ?? []).map((subTask) => (
          <div
            key={subTask.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <input
                type="checkbox"
                checked={subTask.completed}
                onChange={() =>
                  itemHandlers.handleToggleSubTaskComplete(item.id, subTask.id)
                }
                className="h-4 w-4 rounded"
              />
              <span
                className={`text-sm truncate ${subTask.completed ? "line-through text-slate-400" : "text-slate-600"}`}
              >
                {subTask.title}
              </span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 bg-slate-100 rounded-full">
              <label
                htmlFor={`time-${subTask.id}`}
                className="pl-2 cursor-pointer"
              >
                <ClockIcon className="h-3 w-3" />
              </label>
              <input
                id={`time-${subTask.id}`}
                type="number"
                min="0"
                step="5"
                value={subTask.estimatedTime ?? ""}
                onChange={(e) =>
                  itemHandlers.handleSetSubTaskTime(
                    item.id,
                    subTask.id,
                    e.target.value === "" ? null : parseInt(e.target.value, 10),
                  )
                }
                placeholder="--"
                className="w-12 bg-transparent text-center outline-none"
              />
              <span className="pr-2 text-slate-400">{t("taskItem.min")}</span>
            </div>
          </div>
        ))}
        <form
          onSubmit={handleAddSubTaskSubmit}
          className="flex items-center gap-3"
        >
          <PlusIcon className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            placeholder={t("taskItem.addSubtaskPlaceholder")}
            className="text-sm bg-transparent w-full outline-none border-b border-dashed border-slate-300 focus:border-brand transition"
          />
        </form>
      </div>
    </>
  );
};
