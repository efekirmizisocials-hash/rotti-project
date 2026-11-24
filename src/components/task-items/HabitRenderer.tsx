import React from "react";
import { PlannerItem, Project, ItemHandlers } from "../../types";
import { RepeatIcon, FireIcon, TrashIcon } from "../icons";
import { useLocalization } from "../../contexts/LocalizationContext";
import SharedItemDetails from "./SharedItemDetails";

interface HabitRendererProps {
  item: PlannerItem;
  project: Project | null;
  projects: Project[];
  itemHandlers: ItemHandlers;
  isHabitCompletedForPeriod: boolean;
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
}

export const HabitRenderer: React.FC<HabitRendererProps> = (props) => {
  const {
    item,
    isHabitCompletedForPeriod,
    itemHandlers,
    editingField,
    tempValue,
    setTempValue,
    inputRef,
    startEditing,
    handleUpdateAndClose,
    handleKeyDown,
    setEditingField,
  } = props;
  const { t } = useLocalization();
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-3">
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
                className="font-medium text-slate-800 cursor-pointer rounded -m-1 p-1 hover:bg-slate-100"
              >
                {item.title}
              </p>
            )}
            <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
              {t("itemTypes.habit")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 flex-wrap">
            {editingField === "frequency" ? (
              <select
                ref={inputRef as React.RefObject<HTMLSelectElement>}
                value={item.frequency || ""}
                onChange={(e) => {
                  itemHandlers.handleUpdateItem(item.id, {
                    frequency: e.target.value as "daily" | "weekly",
                  });
                  setEditingField(null);
                }}
                onBlur={() => setEditingField(null)}
                className="text-xs font-medium bg-slate-100 border-slate-200 rounded-md p-1 capitalize"
              >
                <option value="daily">{t("taskItem.daily")}</option>
                <option value="weekly">{t("taskItem.weekly")}</option>
              </select>
            ) : (
              <div
                onClick={() => setEditingField("frequency")}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 capitalize cursor-pointer transition hover:ring-2 hover:ring-indigo-200"
              >
                <RepeatIcon className="h-3.5 w-3.5" />
                {item.frequency}
              </div>
            )}
            {(item.streak ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                <FireIcon className="h-3.5 w-3.5" />
                {item.streak} {t("taskItem.dayStreak")}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => itemHandlers.handleLogHabit(item.id)}
            disabled={isHabitCompletedForPeriod}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition text-white bg-brand hover:bg-brand-dark disabled:bg-green-500"
            data-tutorial="log-habit-button"
          >
            {isHabitCompletedForPeriod
              ? t("taskItem.logged")
              : t("taskItem.log")}
          </button>
          <button
            onClick={() => itemHandlers.handleDeleteItem(item.id)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"
          >
            <TrashIcon title={t("taskItem.delete")} />
          </button>
        </div>
      </div>
      <SharedItemDetails {...props} />
    </>
  );
};
