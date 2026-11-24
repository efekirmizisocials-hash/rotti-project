import React from "react";
import { PlannerItem, Project, ItemHandlers } from "../../types";
import { CalendarEventIcon, ClockIcon, TrashIcon } from "../icons";
import { useLocalization } from "../../contexts/LocalizationContext";
import SharedItemDetails from "./SharedItemDetails";
import { formatTime } from "./constants";

interface EventRendererProps {
  item: PlannerItem;
  project: Project | null;
  projects: Project[];
  itemHandlers: ItemHandlers;
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

export const EventRenderer: React.FC<EventRendererProps> = (props) => {
  const {
    item,
    itemHandlers,
    editingField,
    tempValue,
    setTempValue,
    inputRef,
    startEditing,
    handleUpdateAndClose,
    handleKeyDown,
  } = props;
  const { language, t } = useLocalization();
  return (
    <>
      <div className="flex items-start gap-3">
        <div className="mt-1 text-slate-400">
          <CalendarEventIcon className="h-5 w-5" />
        </div>
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
              className="font-medium text-slate-800 cursor-pointer rounded -m-1 p-1 hover:bg-slate-100"
            >
              {item.title}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100">
              <ClockIcon className="h-3.5 w-3.5" />
              {editingField === "startDate" ? (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="datetime-local"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleUpdateAndClose}
                  onKeyDown={handleKeyDown}
                  className="text-xs p-0.5 bg-slate-200 border-slate-300 rounded"
                />
              ) : (
                <span
                  onClick={() => startEditing("startDate", item.startDate)}
                  className="cursor-pointer p-1 rounded hover:bg-slate-200"
                >
                  {formatTime(item.startDate, language)}
                </span>
              )}{" "}
              -{" "}
              {editingField === "endDate" ? (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="datetime-local"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleUpdateAndClose}
                  onKeyDown={handleKeyDown}
                  className="text-xs p-0.5 bg-slate-200 border-slate-300 rounded"
                />
              ) : (
                <span
                  onClick={() => startEditing("endDate", item.endDate)}
                  className="cursor-pointer p-1 rounded hover:bg-slate-200"
                >
                  {formatTime(item.endDate, language)}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => itemHandlers.handleDeleteItem(item.id)}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition"
        >
          <TrashIcon title={t("taskItem.delete")} />
        </button>
      </div>
      <SharedItemDetails {...props} />
    </>
  );
};
