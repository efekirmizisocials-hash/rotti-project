/**
 * AddItemPanel - Premium Task Creation Experience
 *
 * Features:
 * - Progressive disclosure (Essential → Advanced)
 * - AI-powered natural language parsing
 * - Voice input support
 * - Item-type-aware fields
 * - "Add Another" toggle for batch entry
 * - Success confetti/toast feedback
 * - Full theme support (light + dark)
 * - Smooth animations
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Project,
  PlannerItem,
  ItemType,
  Priority,
  Category,
  Tag,
  EnergyLevel,
  RecurrenceRule,
  SubTask,
} from "../../types";
import { XIcon, ChevronDownIcon } from "../icons";
import { useLocalization } from "../../contexts/LocalizationContext";
import { parseItemFromPrompt } from "../../mocks/aiMock";
import toast from "react-hot-toast";

// Component imports
import { TypeSelector } from "./TypeSelector";
import { SmartInput } from "./SmartInput";
import { EnergyPrioritySection } from "./EnergyPrioritySection";
import { DateTimeSection } from "./DateTimeSection";
import { CategorySection } from "./CategorySection";
import { RecurrenceSection } from "./RecurrenceSection";
import { SubtasksSection } from "./SubtasksSection";
import { LocationSection } from "./LocationSection";
import { PeopleSection } from "./PeopleSection";
import { itemTypeColors } from "./animations";

interface AddItemPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onAddItem: (
    itemData: Omit<PlannerItem, "id" | "order"> & {
      projectName?: string | null;
    },
  ) => void;
}

// Define which fields are relevant for each item type
const typeFieldConfig: Record<
  ItemType,
  {
    showPriority: boolean;
    showEnergy: boolean;
    showDateTime: boolean;
    showDuration: boolean;
    showRecurrence: boolean;
    showSubtasks: boolean;
    showLocation: boolean;
    showPeople: boolean;
    showFocus: boolean;
  }
> = {
  [ItemType.TASK]: {
    showPriority: true,
    showEnergy: true,
    showDateTime: true,
    showDuration: true,
    showRecurrence: true,
    showSubtasks: true,
    showLocation: true,
    showPeople: true,
    showFocus: true,
  },
  [ItemType.HABIT]: {
    showPriority: false,
    showEnergy: true,
    showDateTime: false,
    showDuration: true,
    showRecurrence: true,
    showSubtasks: false,
    showLocation: false,
    showPeople: false,
    showFocus: true,
  },
  [ItemType.EVENT]: {
    showPriority: false,
    showEnergy: false,
    showDateTime: true,
    showDuration: true,
    showRecurrence: true,
    showSubtasks: false,
    showLocation: true,
    showPeople: true,
    showFocus: false,
  },
  [ItemType.GOAL]: {
    showPriority: true,
    showEnergy: false,
    showDateTime: true,
    showDuration: false,
    showRecurrence: false,
    showSubtasks: true,
    showLocation: false,
    showPeople: false,
    showFocus: false,
  },
  [ItemType.ROUTINE]: {
    showPriority: false,
    showEnergy: true,
    showDateTime: true,
    showDuration: true,
    showRecurrence: true,
    showSubtasks: true,
    showLocation: false,
    showPeople: false,
    showFocus: true,
  },
  [ItemType.NOTE]: {
    showPriority: false,
    showEnergy: false,
    showDateTime: false,
    showDuration: false,
    showRecurrence: false,
    showSubtasks: false,
    showLocation: false,
    showPeople: false,
    showFocus: false,
  },
};

/**
 * Merge AI-parsed fields onto the form's current values.
 *
 * Pure function (no logic depends on component state beyond its arguments),
 * exported for unit testing (zero logic change beyond the export). Used
 * once, at submit time, after awaiting parseItemFromPrompt — see
 * AddItemPanel's handleSubmit (parse-on-submit).
 *
 * category is included here — previously the one field silently OMITTED
 * from this merge (every task saved with the Category.WORK default
 * regardless of what the AI returned). Applied the same way priority /
 * dueDate / tags already were: the parsed value wins when present, the
 * existing form value (Category.WORK by default, or whatever the user
 * picked manually) is kept when parsing yields nothing for that field.
 */
export function mergeParsedData(
  parsed: Partial<PlannerItem> | null,
  base: {
    category: Category;
    priority: Priority;
    dueDate: string;
    tags: Tag[];
    estimatedMinutes: number | null;
    energyLevel: EnergyLevel | undefined;
  },
): {
  category: Category;
  priority: Priority;
  dueDate: string | undefined;
  tags: Tag[];
  estimatedMinutes: number | null;
  energyLevel: EnergyLevel | undefined;
} {
  return {
    category: parsed?.category || base.category,
    priority: parsed?.priority || base.priority,
    dueDate: parsed?.dueDate || base.dueDate || undefined,
    tags: parsed?.tags?.length ? parsed.tags : base.tags,
    estimatedMinutes: parsed?.estimatedMinutes ?? base.estimatedMinutes,
    energyLevel: parsed?.energyLevel || base.energyLevel,
  };
}

export const AddItemPanel: React.FC<AddItemPanelProps> = ({
  isOpen,
  onClose,
  projects,
  onAddItem,
}) => {
  const { language, t } = useLocalization();
  const panelRef = useRef<HTMLDivElement>(null);

  // Separate toggle states for each section
  const [showEssential, setShowEssential] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  // Core fields
  const [itemType, setItemType] = useState<ItemType>(ItemType.TASK);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Priority & Energy
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>(
    undefined,
  );

  // DateTime
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

  // Organization
  const [category, setCategory] = useState<Category>(Category.WORK);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  // Advanced
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceRule | null>(null);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [assignedPeople, setAssignedPeople] = useState<string[]>([]);
  const [requiresFocus, setRequiresFocus] = useState(false);

  // AI parsing (parse-on-submit; see handleSubmit)
  const [isParsing, setIsParsing] = useState(false);

  // Get field config for current item type
  const fieldConfig = typeFieldConfig[itemType];
  const typeColors = itemTypeColors[itemType];

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && title.trim()) {
        handleSubmit();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, title]);

  const resetForm = () => {
    setItemType(ItemType.TASK);
    setTitle("");
    setDescription("");
    setPriority(Priority.LOW);
    setEnergyLevel(undefined);
    setStartDate("");
    setDueDate("");
    setEstimatedMinutes(null);
    setCategory(Category.WORK);
    setProjectId(null);
    setTags([]);
    setLocation("");
    setRecurrence(null);
    setSubtasks([]);
    setAssignedPeople([]);
    setRequiresFocus(false);
    setShowEssential(true);
    setShowAdvanced(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || isParsing) return;

    const rawTitle = title.trim();

    // Parse-on-submit: await the AI parse before inserting, so its
    // metadata is never dropped by a race with the insert. Never blocks task
    // creation — on failure or null, fall through with the raw title and the
    // form's own values (below via mergeParsedData's fallback to `base`).
    setIsParsing(true);
    let parsed: Partial<PlannerItem> | null;
    try {
      parsed = await parseItemFromPrompt(rawTitle, language as "en" | "tr");
    } catch (err) {
      parsed = null;
    }
    setIsParsing(false);

    const merged = mergeParsedData(parsed, {
      category,
      priority,
      dueDate,
      tags,
      estimatedMinutes,
      energyLevel,
    });

    const projectName = projectId
      ? projects.find((p) => p.id === projectId)?.name
      : null;

    onAddItem({
      type: itemType,
      title: rawTitle,
      description: description.trim() || undefined,
      creationDate: new Date().toISOString(),
      category: merged.category,
      priority: merged.priority,
      energyLevel: merged.energyLevel,
      tags: merged.tags,
      projectId,
      projectName,
      startDate: startDate || undefined,
      dueDate: merged.dueDate,
      estimatedMinutes: merged.estimatedMinutes,
      completed: false,
      location: location || undefined,
      recurrenceRule: recurrence,
      subTasks: subtasks,
      assignedPeople,
      requiresFocus,
      reminderOffset: null,
      reminderSent: false,
      dependencies: [],
    });

    // Success feedback
    toast.success(`${itemType} created!`, {
      duration: 2000,
      style: {
        background: "#10b981",
        color: "#fff",
        fontWeight: "600",
        borderRadius: "12px",
      },
      iconTheme: { primary: "#fff", secondary: "#10b981" },
    });

    if (addAnother) {
      // Reset fields but keep type, category, project
      setTitle("");
      setDescription("");
      setPriority(Priority.LOW);
      setEnergyLevel(undefined);
      setStartDate("");
      setDueDate("");
      setEstimatedMinutes(null);
      setTags([]);
      setLocation("");
      setRecurrence(null);
      setSubtasks([]);
      setAssignedPeople([]);
      setRequiresFocus(false);
    } else {
      onClose();
    }
  };

  // Check if advanced section has any visible fields for this item type
  const hasAdvancedFields =
    fieldConfig.showLocation ||
    fieldConfig.showSubtasks ||
    fieldConfig.showRecurrence ||
    fieldConfig.showPeople ||
    fieldConfig.showFocus;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop with subtle glow */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-slate-900/70 backdrop-blur-sm"
        onClick={onClose}
        style={{
          background: `radial-gradient(ellipse at center, ${typeColors.primary}18 0%, rgba(0,0,0,0.5) 65%)`,
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl shadow-2xl animate-slide-up"
        style={{
          boxShadow: `0 25px 60px -15px ${typeColors.primary}30, 0 0 0 1px ${typeColors.primary}10`,
        }}
      >
        {/* Gradient accent line with glow at top */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${typeColors.primary}, ${typeColors.secondary})`,
            boxShadow: `0 0 20px 2px ${typeColors.primary}60`,
          }}
        />

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${typeColors.primary}, ${typeColors.secondary})`,
                }}
              />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${typeColors.primary}, ${typeColors.secondary})`,
                }}
              >
                {typeColors.icon}
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {t("app.createNew") || "Create New"} {itemType}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-5 space-y-5">
          {/* Type Selector */}
          <TypeSelector selectedType={itemType} onTypeChange={setItemType} />

          {/* Smart Input */}
          <SmartInput
            value={title}
            onChange={setTitle}
            isParsing={isParsing}
            placeholder={`What ${itemType.toLowerCase()} do you want to create?`}
            autoFocus
          />

          {/* Description - show for all except habits */}
          {itemType !== ItemType.HABIT && (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (optional)..."
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
          )}

          {/* Essential Fields Toggle */}
          <button
            type="button"
            onClick={() => setShowEssential(!showEssential)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span>📋 Essential Options</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform duration-200 ${showEssential ? "rotate-180" : ""}`}
            />
          </button>

          {showEssential && (
            <div className="space-y-5 animate-panel-fade-in">
              {/* Priority & Energy - only if relevant */}
              {(fieldConfig.showPriority || fieldConfig.showEnergy) && (
                <EnergyPrioritySection
                  priority={priority}
                  energyLevel={energyLevel}
                  onPriorityChange={setPriority}
                  onEnergyChange={setEnergyLevel}
                />
              )}

              {/* Date & Time - only if relevant */}
              {fieldConfig.showDateTime && (
                <DateTimeSection
                  startDate={startDate}
                  dueDate={dueDate}
                  estimatedMinutes={estimatedMinutes}
                  onStartDateChange={setStartDate}
                  onDueDateChange={setDueDate}
                  onDurationChange={setEstimatedMinutes}
                />
              )}

              {/* Category, Project, Tags - always show for organization */}
              <CategorySection
                category={category}
                projectId={projectId}
                tags={tags}
                projects={projects}
                onCategoryChange={setCategory}
                onProjectChange={setProjectId}
                onTagsChange={setTags}
              />
            </div>
          )}

          {/* Advanced Fields Toggle - only show if there are advanced fields for this type */}
          {hasAdvancedFields && (
            <>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>⚙️ Advanced Options</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
                />
              </button>

              {showAdvanced && (
                <div className="space-y-5 animate-panel-fade-in">
                  {/* Location */}
                  {fieldConfig.showLocation && (
                    <LocationSection
                      location={location}
                      onLocationChange={setLocation}
                    />
                  )}

                  {/* Subtasks */}
                  {fieldConfig.showSubtasks && (
                    <SubtasksSection
                      subtasks={subtasks}
                      onSubtasksChange={setSubtasks}
                    />
                  )}

                  {/* Recurrence */}
                  {fieldConfig.showRecurrence && (
                    <RecurrenceSection
                      recurrence={recurrence}
                      onRecurrenceChange={setRecurrence}
                    />
                  )}

                  {/* People */}
                  {fieldConfig.showPeople && (
                    <PeopleSection
                      assignedPeople={assignedPeople}
                      onPeopleChange={setAssignedPeople}
                    />
                  )}

                  {/* Focus Mode Toggle */}
                  {fieldConfig.showFocus && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎯</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          Requires Focus Mode
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequiresFocus(!requiresFocus)}
                        className={`
                                                    w-12 h-6 rounded-full transition-all duration-300 relative
                                                    ${
                                                      requiresFocus
                                                        ? "bg-brand"
                                                        : "bg-slate-300 dark:bg-slate-700"
                                                    }
                                                `}
                      >
                        <div
                          className={`
                                                        absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
                                                        ${requiresFocus ? "left-7" : "left-1"}
                                                    `}
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Keyboard hints */}
            <div className="hidden sm:flex text-xs text-slate-400 dark:text-slate-500 items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400 font-mono text-[10px] border border-slate-300 dark:border-slate-600">
                  ⌘↵
                </kbd>
                save
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400 font-mono text-[10px] border border-slate-300 dark:border-slate-600">
                  esc
                </kbd>
                cancel
              </span>
            </div>

            {/* Add Another toggle */}
            <button
              type="button"
              onClick={() => setAddAnother(!addAnother)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                addAnother
                  ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border border-brand/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${
                  addAnother
                    ? "bg-brand border-brand"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                {addAnother && (
                  <svg
                    className="w-2 h-2 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              Add another
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isParsing}
              className="px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
              style={{
                background:
                  title.trim() && !isParsing
                    ? `linear-gradient(135deg, ${typeColors.primary}, ${typeColors.secondary})`
                    : undefined,
                boxShadow:
                  title.trim() && !isParsing
                    ? `0 8px 25px -5px ${typeColors.primary}40`
                    : undefined,
              }}
            >
              {isParsing ? "Creating…" : `Create ${itemType}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemPanel;
