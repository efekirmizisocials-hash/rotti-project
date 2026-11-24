import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useLocalization } from "../contexts/LocalizationContext";
import { Priority, PlannerItem } from "../types";
import {
  CalendarDaysIcon,
  ListIcon,
  ClipboardCheckIcon,
  ViewTimelineIcon,
  PlusIcon,
  DashboardIcon,
  CheckIcon,
  TrashIcon,
  FlagIcon,
  XIcon,
  ViewColumnsIcon,
} from "./icons";
import { motion, AnimatePresence } from "framer-motion";

// Import view components
import TodayTimelineView from "./TodayTimelineView";
import WeekView from "./WeekView";
import CalendarView from "./CalendarView";
import PlannerItemComponent from "./task-items/PlannerItem";
import QuickAddBar from "./QuickAddBar";
import KanbanView from "./KanbanView";

// Hooks
import { usePlannerItems } from "../hooks/usePlannerItems";
import { useProjects } from "../hooks/useProjects";
import { useItemHandlers } from "../hooks/useItemHandlers";
import { useUIStore, SortType } from "../store/uiStore";

type PlannerTab = "today" | "week" | "month" | "list" | "board";

import ConfirmModal from "./ConfirmModal";
import { TaskDetailPanel } from "./TaskDetailPanel";

// Custom sort dropdown component
const SortDropdown: React.FC<{
  value: SortType;
  onChange: (value: SortType) => void;
  t: (key: string) => string;
}> = ({ value, onChange, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [
    { value: "manual" as SortType, label: t("app.sortManual"), icon: "📋" },
    { value: "dueDate" as SortType, label: t("app.sortDueDate"), icon: "📅" },
    { value: "priority" as SortType, label: t("app.sortPriority"), icon: "🚀" },
  ];

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
      >
        <span>{selected.icon}</span>
        <span className="hidden sm:inline">{selected.label}</span>
        <svg
          className="w-3.5 h-3.5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1 animate-panel-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`
                                w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                ${
                                  value === opt.value
                                    ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light font-medium"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                }
                            `}
            >
              <span>{opt.icon}</span>
              {opt.label}
              {value === opt.value && (
                <span className="ml-auto">
                  <svg
                    className="w-4 h-4 text-brand"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UnifiedPlanner: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<PlannerTab>("today");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlannerItem | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleItemClick = useCallback(
    (item: PlannerItem) => {
      if (batchMode) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) next.delete(item.id);
          else next.add(item.id);
          return next;
        });
        return;
      }
      setSelectedItem(item);
    },
    [batchMode],
  );

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          useUIStore.getState().setComposerOpen(true);
          break;
        case "t":
          setActiveTab("today");
          break;
        case "w":
          setActiveTab("week");
          break;
        case "m":
          setActiveTab("month");
          break;
        case "l":
          setActiveTab("list");
          break;
        case "b":
          setActiveTab("board");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Data Hooks
  const { items: plannerItems } = usePlannerItems();
  const { projects } = useProjects();
  const itemHandlers = useItemHandlers();

  // UI Store
  const activeFilter = useUIStore((state) => state.activeFilter);
  const sortOrder = useUIStore((state) => state.sortOrder);
  const setSortOrder = useUIStore((state) => state.setSortOrder);
  const setFocusedItemId = useUIStore((state) => state.setFocusedItemId);
  const setComposerOpen = useUIStore((state) => state.setComposerOpen);

  // Filtering Logic
  const priorityValues: { [key in Priority]: number } = {
    [Priority.HIGH]: 3,
    [Priority.MEDIUM]: 2,
    [Priority.LOW]: 1,
  };

  const filteredItems = useMemo(() => {
    let tempItems = [...plannerItems];
    if (activeFilter.id) {
      if (activeFilter.type === "tag")
        tempItems = tempItems.filter((item) =>
          item.tags.some((t) => t.label === activeFilter.id),
        );
      if (activeFilter.type === "project")
        tempItems = tempItems.filter(
          (item) => item.projectId === activeFilter.id,
        );
    }

    return tempItems.sort((a, b) => {
      if (sortOrder === "priority") {
        return (
          priorityValues[b.priority] - priorityValues[a.priority] ||
          a.order - b.order
        );
      }
      if (sortOrder === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dateA === dateB) return a.order - b.order;
        return dateA - dateB;
      }
      return a.order - b.order;
    });
  }, [plannerItems, activeFilter, sortOrder]);

  // Calculate counts for tabs
  const tabCounts = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      today: plannerItems.filter((item) => {
        if (item.completed) return false;
        const date = item.startDate
          ? new Date(item.startDate)
          : item.dueDate
            ? new Date(item.dueDate)
            : null;
        if (!date) return true;
        return date >= startOfDay && date <= endOfDay;
      }).length,
      week: plannerItems.filter((item) => {
        if (item.completed) return false;
        const date = item.startDate
          ? new Date(item.startDate)
          : item.dueDate
            ? new Date(item.dueDate)
            : null;
        if (!date) return false;
        return date >= startOfWeek && date <= endOfWeek;
      }).length,
      month: plannerItems.filter((item) => {
        if (item.completed) return false;
        const date = item.startDate
          ? new Date(item.startDate)
          : item.dueDate
            ? new Date(item.dueDate)
            : null;
        if (!date) return false;
        return date >= startOfMonth && date <= endOfMonth;
      }).length,
      list: plannerItems.filter((i) => !i.completed).length,
    };
  }, [plannerItems]);

  // Clean tab config — no emojis, clean icons
  const tabs: {
    id: PlannerTab;
    label: string;
    icon: React.FC<any>;
    count: number;
    shortcut: string;
  }[] = [
    {
      id: "today",
      label: "Today",
      icon: CalendarDaysIcon,
      count: tabCounts.today,
      shortcut: "T",
    },
    {
      id: "week",
      label: "Week",
      icon: ViewTimelineIcon,
      count: tabCounts.week,
      shortcut: "W",
    },
    {
      id: "month",
      label: "Month",
      icon: ClipboardCheckIcon,
      count: tabCounts.month,
      shortcut: "M",
    },
    {
      id: "list",
      label: "All Tasks",
      icon: ListIcon,
      count: tabCounts.list,
      shortcut: "L",
    },
    {
      id: "board",
      label: "Board",
      icon: ViewColumnsIcon,
      count: 0,
      shortcut: "B",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return (
          <TodayTimelineView
            items={plannerItems}
            onStartFocus={(item: PlannerItem) => setFocusedItemId(item.id)}
            onUpdateItem={itemHandlers.handleUpdateItem!}
            onItemClick={handleItemClick}
          />
        );
      case "week":
        return (
          <WeekView
            items={plannerItems}
            onUpdateItemDate={itemHandlers.handleUpdateItemDate!}
            onItemClick={handleItemClick}
          />
        );
      case "month":
        return (
          <CalendarView
            items={plannerItems}
            projects={projects}
            itemHandlers={itemHandlers}
            onUpdateItemDate={itemHandlers.handleUpdateItemDate!}
            onItemClick={handleItemClick}
          />
        );
      case "board":
        return (
          <KanbanView
            items={plannerItems}
            projects={projects}
            itemHandlers={itemHandlers}
            onItemClick={handleItemClick}
          />
        );
      case "list":
        return (
          <>
            <>
              {filteredItems.filter((i) => !i.completed).length > 0 ? (
                <div className="space-y-3">
                  {filteredItems
                    .filter((i) => !i.completed)
                    .map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        {batchMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                return next;
                              });
                            }}
                            className="mt-5 h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <PlannerItemComponent
                            item={item}
                            project={
                              projects.find((p) => p.id === item.projectId) ||
                              null
                            }
                            projects={projects}
                            allItems={plannerItems}
                            itemHandlers={{
                              ...itemHandlers,
                              handleDeleteItem: async (id) =>
                                setItemToDelete(id),
                            }}
                            onStartFocus={(itemId) => setFocusedItemId(itemId)}
                            isDraggable={sortOrder === "manual" && !batchMode}
                            onItemClick={handleItemClick}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* Enhanced empty state */
                <div className="text-center py-16 px-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/10 to-purple-500/10 dark:from-brand/20 dark:to-purple-500/20 mb-4">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {t("app.allClearTitle")}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    {t("app.allClearSubtitle")}
                  </p>
                  <button
                    onClick={() => setComposerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand to-[#EE5A6F] text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 active:scale-95 transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add your first task
                  </button>
                </div>
              )}

              {/* Archive Entry Point */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => useUIStore.getState().setActiveView("archive")}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>View Completed Tasks (Archive)</span>
                </button>
              </div>
            </>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Add Bar */}
      <QuickAddBar
        onAddItem={(item) => itemHandlers.handleAddItem?.(item)}
        onOpenFullComposer={() => setComposerOpen(true)}
      />

      {/* Tab Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-brand dark:text-brand-light shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
                title={`${tab.label} (${tab.shortcut})`}
              >
                {/* Desktop: Icon + Label + Count */}
                <span className="hidden sm:flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-brand/10 text-brand"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>

                {/* Mobile: Icon only + notification dot */}
                <span className="sm:hidden relative">
                  <Icon className="h-4 w-4" />
                  {tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown — custom styled, list view only */}
        <div className="flex items-center gap-2">
          {(activeTab === "list" || activeTab === "board") && (
            <button
              onClick={toggleBatchMode}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                batchMode
                  ? "bg-brand/10 text-brand dark:text-brand-light border border-brand/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent"
              }`}
            >
              <CheckIcon className="h-3.5 w-3.5" />
              {batchMode ? `${selectedIds.size} selected` : "Select"}
            </button>
          )}
          {activeTab === "list" && (
            <SortDropdown value={sortOrder} onChange={setSortOrder} t={t} />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/* Mobile FAB — Floating Action Button for adding tasks */}
      <button
        onClick={() => setComposerOpen(true)}
        className="sm:hidden fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-[#EE5A6F] text-white shadow-xl shadow-brand/30 flex items-center justify-center active:scale-90 transition-transform z-40"
        aria-label="Add new task"
      >
        <PlusIcon className="h-7 w-7" />
      </button>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (itemToDelete) {
            await itemHandlers.handleDeleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
        title={t("app.confirmDelete")}
        message={t("app.deleteItemWarning")}
      />

      {/* Task Detail Slide-in Panel */}
      <TaskDetailPanel
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={(id, updates) => {
          itemHandlers.handleUpdateItem(id, updates);
          // Keep panel synced with latest data
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem((prev) => (prev ? { ...prev, ...updates } : null));
          }
        }}
        onDelete={(id) => {
          setItemToDelete(id);
          setSelectedItem(null);
        }}
      />

      {/* ─── Floating Batch Action Bar ─── */}
      <AnimatePresence>
        {batchMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
          >
            {/* Count */}
            <span className="text-xs font-bold text-brand mr-1">
              {selectedIds.size} items
            </span>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Select All / Deselect */}
            <button
              onClick={() => {
                const allIds = filteredItems
                  .filter((i) => !i.completed)
                  .map((i) => i.id);
                setSelectedIds((prev) =>
                  prev.size === allIds.length ? new Set() : new Set(allIds),
                );
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {selectedIds.size ===
              filteredItems.filter((i) => !i.completed).length
                ? "Deselect All"
                : "Select All"}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Mark Complete */}
            <button
              onClick={() => {
                selectedIds.forEach((id) =>
                  itemHandlers.handleToggleComplete(id),
                );
                setSelectedIds(new Set());
                setBatchMode(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Complete
            </button>

            {/* Set Priority */}
            {[Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => (
              <button
                key={p}
                onClick={() => {
                  selectedIds.forEach((id) =>
                    itemHandlers.handleUpdateItem(id, { priority: p }),
                  );
                  setSelectedIds(new Set());
                  setBatchMode(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
                  p === Priority.HIGH
                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    : p === Priority.MEDIUM
                      ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                      : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                }`}
                title={`Set priority: ${p}`}
              >
                <FlagIcon className="h-3 w-3" />
                {p}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Delete */}
            <button
              onClick={() => {
                selectedIds.forEach((id) => itemHandlers.handleDeleteItem(id));
                setSelectedIds(new Set());
                setBatchMode(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>

            {/* Dismiss */}
            <button
              onClick={toggleBatchMode}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedPlanner;
