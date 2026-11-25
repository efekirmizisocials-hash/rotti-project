import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { useUIStore } from "../../store/uiStore";
import { ItemType, Priority } from "../../types";

export const UrgentWidget: React.FC = () => {
  const { items: plannerItems, updateItem } = usePlannerItems();
  const setActiveView = useUIStore((state) => state.setActiveView);

  const urgentTasks = useMemo(() => {
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    return plannerItems.filter(
      (i) =>
        i.type === ItemType.TASK &&
        !i.completed &&
        (i.priority === Priority.HIGH ||
          (i.dueDate && new Date(i.dueDate) < startOfToday)),
    );
  }, [plannerItems]);

  const handleComplete = async (id: string) => {
    await updateItem(id, {
      completed: true,
      completedDate: new Date().toISOString(),
    });
  };

  if (urgentTasks.length === 0) return null;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      className="mt-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl shadow-sm p-4 border border-red-100 dark:border-red-900/30 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setActiveView("plan" as any)}
    >
      <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
        ⚠️ Needs Attention
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {urgentTasks.length}
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {urgentTasks.slice(0, 6).map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleComplete(task.id)}
              className="w-4 h-4 rounded-full border-2 border-red-400 flex-shrink-0"
            />
            <span className="text-sm text-red-700 dark:text-red-300 truncate">
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
