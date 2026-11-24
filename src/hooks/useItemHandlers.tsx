import React, { useMemo } from "react";
// Force refresh
import { usePlannerItems } from "./usePlannerItems";
import { useUserStats } from "./useUserStats";
import { useUIStore } from "../store/uiStore";
import { useLocalization } from "../contexts/LocalizationContext";
import { ItemHandlers, Tag, PlannerItem, ItemType } from "../types";
import { useTaskAnalytics } from "./useTaskAnalytics";
import toast from "react-hot-toast";

export function useItemHandlers(): ItemHandlers {
  const {
    items: plannerItems,
    addItem: addPlannerItem,
    updateItem,
    deleteItem,
  } = usePlannerItems();
  const { userStats, updateStats: updateUserStats } = useUserStats();
  const { logCompletion } = useTaskAnalytics();
  const setLastCompletedTask = useUIStore(
    (state) => state.setLastCompletedTask,
  );
  const setFocusedItemId = useUIStore((state) => state.setFocusedItemId);
  const { t } = useLocalization();

  return useMemo(
    () => ({
      handleToggleComplete: async (itemId) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newCompleted = !item.completed;
        const updates: Partial<PlannerItem> = {
          completed: newCompleted,
          completedDate: newCompleted ? new Date().toISOString() : undefined,
          streak:
            item.type === ItemType.HABIT && newCompleted
              ? (item.streak || 0) + 1
              : item.streak,
        };

        try {
          await updateItem(itemId, updates);
          if (newCompleted) {
            setLastCompletedTask({ item, points: item.focusPoints || 0 });
            if (item.focusPoints) {
              const newTotal =
                (userStats.totalFocusPoints || 0) + item.focusPoints;
              updateUserStats({ totalFocusPoints: newTotal });
            }

            // Log completion event for pattern learning
            logCompletion(item);
          }
        } catch (e) {
          console.error(e);
        }
      },
      handleLogHabit: async (itemId) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (item) {
          const newCompleted = !item.completed;
          const updates: Partial<PlannerItem> = {
            completed: newCompleted,
            completedDate: newCompleted ? new Date().toISOString() : undefined,
            streak:
              item.type === ItemType.HABIT && newCompleted
                ? (item.streak || 0) + 1
                : item.streak,
          };
          await updateItem(itemId, updates);
        }
      },
      handleDeleteItem: async (itemId) => {
        const itemToDelete = plannerItems.find((i) => i.id === itemId);
        await deleteItem(itemId);

        // Show toast with Undo action
        toast.success(
          (toastObj) => (
            <div className="flex items-center gap-2">
              <span>{t("app.itemDeleted")}</span>
              <button
                onClick={async () => {
                  toast.dismiss(toastObj.id);
                  if (itemToDelete) {
                    // Remove ID to let addItem generate a new one (limitations: breaks incoming dependencies)
                    const { id, ...rest } = itemToDelete;
                    await addPlannerItem(rest);
                    toast.success("Item restored");
                  }
                }}
                className="px-2 py-1 bg-white text-slate-800 rounded text-xs font-bold border border-slate-200 hover:bg-slate-50"
              >
                Undo
              </button>
            </div>
          ),
          { duration: 4000 },
        );
      },
      handleAddSubTasks: async (itemId, subTasks) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newSubTasks = [
          ...(item.subTasks || []),
          ...subTasks.map((st) => ({
            ...st,
            id: crypto.randomUUID(),
            completed: false,
          })),
        ];
        await updateItem(itemId, { subTasks: newSubTasks });
      },
      handleToggleSubTaskComplete: async (itemId, subTaskId) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item || !item.subTasks) return;
        const newSubTasks = item.subTasks.map((st) =>
          st.id === subTaskId ? { ...st, completed: !st.completed } : st,
        );
        await updateItem(itemId, { subTasks: newSubTasks });
      },
      handleSetSubTaskTime: async (itemId, subTaskId, time) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item || !item.subTasks) return;
        const newSubTasks = item.subTasks.map((st) =>
          st.id === subTaskId ? { ...st, estimatedTime: time } : st,
        );
        await updateItem(itemId, { subTasks: newSubTasks });
      },
      handleUpdateItem: async (itemId, updates) => {
        await updateItem(itemId, updates);
      },
      handleAddItemTag: async (itemId, tagString) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const { parseTagFromString } = await import("../utils/helpers");
        const newTag: Tag = parseTagFromString(tagString);
        if (
          item.tags.some(
            (t) => t.label === newTag.label && t.type === newTag.type,
          )
        )
          return;
        const newTags = [...item.tags, newTag];
        await updateItem(itemId, { tags: newTags });
      },
      handleRemoveItemTag: async (itemId, tagLabel) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newTags = item.tags.filter((t) => t.label !== tagLabel);
        await updateItem(itemId, { tags: newTags });
      },
      handleAddDependency: async (itemId, depId) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newDeps = [...(item.dependencies || []), depId];
        await updateItem(itemId, { dependencies: newDeps });
      },
      handleRemoveDependency: async (itemId, depId) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newDeps = (item.dependencies || []).filter((d) => d !== depId);
        await updateItem(itemId, { dependencies: newDeps });
      },
      handleSetItemProject: async (itemId, projectId) => {
        await updateItem(itemId, { projectId });
      },
      handleAddSingleSubTask: async (itemId, title) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newSubTasks = [
          ...(item.subTasks || []),
          {
            id: crypto.randomUUID(),
            title,
            completed: false,
            estimatedTime: null,
          },
        ];
        await updateItem(itemId, { subTasks: newSubTasks });
      },
      handleStartFocus: (itemId) => {
        setFocusedItemId(itemId);
      },
      handleAddEmotionalLog: async (itemId, feeling) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        const newLog = [
          ...(item.emotionalLog || []),
          { timestamp: new Date().toISOString(), feeling },
        ];
        await updateItem(itemId, { emotionalLog: newLog });
      },
      handleUpdateItemDate: async (itemId, newDate) => {
        const item = plannerItems.find((i) => i.id === itemId);
        if (!item) return;
        // Explicitly set to null if newDate is null (unschedule), otherwise use the date
        await updateItem(itemId, {
          dueDate: newDate === null ? null : newDate,
        });
      },
      handleAddItem: async (itemData) => {
        const { projectName, ...item } = itemData;
        // Assuming addPlannerItem handles defaults (IDs, dates)
        await addPlannerItem(item as any); // Cast to any or partial to avoid strict Omit<PlannerItem...> mismatch if types vary slightly
      },
    }),
    [
      plannerItems,
      addPlannerItem,
      updateItem,
      deleteItem,
      userStats,
      updateUserStats,
      t,
      setLastCompletedTask,
      setFocusedItemId,
    ],
  );
}
