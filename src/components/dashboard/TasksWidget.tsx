import React, { useMemo } from "react";
import { CalendarIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";
import { ItemType } from "../../types";
import EmptyState from "../EmptyState";

export const TasksWidget: React.FC = () => {
  const { items: plannerItems, updateItem } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  const todayTasks = useMemo(() => {
    const todayStr = new Date().toDateString();
    return plannerItems.filter(
      (i) =>
        i.type === ItemType.TASK &&
        !i.completed &&
        i.dueDate &&
        new Date(i.dueDate).toDateString() === todayStr,
    );
  }, [plannerItems]);

  const handleComplete = async (id: string) => {
    await updateItem(id, {
      completed: true,
      completedDate: new Date().toISOString(),
    });
  };

  return (
    <WidgetCard
      title="Today's Tasks"
      icon={<CalendarIcon className="h-4 w-4 text-brand" />}
      onClick={() => setActiveView("plan" as any)}
      badge={todayTasks.length}
      size={getWidgetSize("tasks")}
    >
      <div className="space-y-2">
        {todayTasks.length > 0 ? (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() =>
                  updateItem(task.id, { completed: !task.completed })
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand cursor-pointer"
              />
              <span
                className={`text-sm flex-1 ${task.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}
              >
                {task.title}
              </span>
            </div>
          ))
        ) : (
          <EmptyState
            icon="✨"
            title="All clear!"
            description="No tasks due today. Great job!"
            size="sm"
          />
        )}
      </div>
    </WidgetCard>
  );
};
