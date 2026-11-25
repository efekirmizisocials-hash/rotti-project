import React, { useMemo } from "react";
import { ClockIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";
import { ItemType } from "../../types";

export const UpcomingWidget: React.FC = () => {
  const { items: plannerItems } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return plannerItems
      .filter(
        (i) =>
          i.type === ItemType.TASK &&
          !i.completed &&
          i.dueDate &&
          new Date(i.dueDate) > now,
      )
      .slice(0, 5);
  }, [plannerItems]);

  return (
    <WidgetCard
      title="Coming Up"
      icon={<ClockIcon className="h-4 w-4 text-indigo-500" />}
      onClick={() => setActiveView("plan" as any)}
      size={getWidgetSize("upcoming")}
    >
      <div className="space-y-2">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 w-12 text-xs flex-shrink-0">
                {task.dueDate &&
                  new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
              </span>
              <span className="text-slate-700 dark:text-slate-200 truncate">
                {task.title}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 py-2 text-center">
            Nothing scheduled
          </p>
        )}
      </div>
    </WidgetCard>
  );
};
