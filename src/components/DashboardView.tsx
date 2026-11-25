import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircleIcon, CogIcon } from "./icons";
import { useUIStore } from "../store/uiStore";
import { useDashboardStore, WidgetId } from "../store/dashboardStore";
import { DashboardSettings } from "./dashboard/DashboardSettings";
import { DailyProgressRing } from "./dashboard/DailyProgressRing";
import { EnergyWidget } from "./dashboard/EnergyWidget";
import { FocusWidget } from "./dashboard/FocusWidget";
import { QuickAddWidget } from "./dashboard/QuickAddWidget";
import { TasksWidget } from "./dashboard/TasksWidget";
import { HabitHeatmap } from "./dashboard/HabitHeatmap";
import { FinanceSparkline } from "./dashboard/FinanceSparkline";
import { UpcomingWidget } from "./dashboard/UpcomingWidget";
import { UrgentWidget } from "./dashboard/UrgentWidget";
import { MiniCalendar } from "./dashboard/MiniCalendar";
import { ProductivityScore } from "./dashboard/ProductivityScore";
import { DailyReview } from "./dashboard/DailyReview";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Widget component mapping
const WIDGET_COMPONENTS: Record<WidgetId, React.FC> = {
  energy: EnergyWidget,
  focus: FocusWidget,
  quickAdd: QuickAddWidget,
  tasks: TasksWidget,
  habits: HabitHeatmap,
  finance: FinanceSparkline,
  upcoming: UpcomingWidget,
  urgent: UrgentWidget,
  miniCalendar: MiniCalendar,
  productivityScore: ProductivityScore,
  dailyReview: DailyReview,
};

interface SortableWidgetProps {
  id: WidgetId;
  Component: React.FC;
  size?: "compact" | "full";
}

const SortableWidget: React.FC<SortableWidgetProps> = ({
  id,
  Component,
  size,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none ${size === "full" ? "md:col-span-2" : ""}`}
    >
      <Component />
    </div>
  );
};

const DashboardView: React.FC = () => {
  const lastCompletedTask = useUIStore((state) => state.lastCompletedTask);
  const setLastCompletedTask = useUIStore(
    (state) => state.setLastCompletedTask,
  );
  const { isWidgetVisible, widgetOrder, reorderWidgets, getWidgetSize } =
    useDashboardStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Showcase build: a single fake demo user.
  const userName = "Demo";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgetOrder.indexOf(active.id as WidgetId);
      const newIndex = widgetOrder.indexOf(over.id as WidgetId);
      reorderWidgets(arrayMove(widgetOrder, oldIndex, newIndex));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const heroWidgets = ["energy", "focus", "quickAdd"];
  const visibleGridWidgets = widgetOrder.filter(
    (id) =>
      !heroWidgets.includes(id) &&
      id !== "urgent" &&
      id !== "dailyReview" &&
      isWidgetVisible(id),
  );

  const hour = new Date().getHours();
  const greeting = useMemo(() => {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, [hour]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark transition-colors duration-500 pb-20">
      {/* Settings Modal */}
      <DashboardSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Success Toast */}
      {lastCompletedTask && (
        <div className="fixed top-4 right-20 z-[60] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-medium">+{lastCompletedTask.points} pts!</span>
          <button
            onClick={() => setLastCompletedTask(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 pt-8 pb-12 relative z-20"
      >
        {/* Greeting Header */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-brand font-bold tracking-[0.15em] uppercase text-[11px] mb-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
              {greeting},{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand to-purple-500">
                {userName}
              </span>
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.1, rotate: 45 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl shadow-sm transition-all border border-slate-200/80 dark:border-slate-700/50"
            title="Dashboard Settings"
          >
            <CogIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Daily Progress Ring + Stats */}
        <div className="mb-8">
          <DailyProgressRing />
        </div>

        {/* 2-5. Hero Widgets */}
        <div className="space-y-4 mb-8">
          {heroWidgets.map((widgetId) => {
            const Component = WIDGET_COMPONENTS[widgetId as WidgetId];
            return isWidgetVisible(widgetId as WidgetId) && Component ? (
              <Component key={widgetId} />
            ) : null;
          })}
        </div>

        {/* 6. Main Grid Layout with Drag-and-Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleGridWidgets}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleGridWidgets.map((widgetId) => (
                <SortableWidget
                  key={widgetId}
                  id={widgetId}
                  Component={WIDGET_COMPONENTS[widgetId]}
                  size={getWidgetSize(widgetId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* 7. Alert Section - Always last */}
        {isWidgetVisible("urgent") && (
          <div className="mt-8">
            <UrgentWidget />
          </div>
        )}

        {/* 8. Daily Review - Evening only */}
        {isWidgetVisible("dailyReview") && (
          <div className="mt-8">
            <DailyReview />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardView;
