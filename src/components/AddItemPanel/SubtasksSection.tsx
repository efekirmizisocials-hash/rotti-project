/**
 * SubtasksSection - Clean, card-based subtask list
 */

import React, { useState } from "react";
import { PlusIcon, XIcon, CheckIcon, ListBulletIcon } from "../icons";
import { SubTask } from "../../types";

interface SubtasksSectionProps {
  subtasks: SubTask[];
  onSubtasksChange: (subtasks: SubTask[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const SubtasksSection: React.FC<SubtasksSectionProps> = ({
  subtasks,
  onSubtasksChange,
}) => {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newItem: SubTask = {
      id: generateId(),
      title: newSubtask.trim(),
      completed: false,
      estimatedTime: null,
    };

    onSubtasksChange([...subtasks, newItem]);
    setNewSubtask("");
  };

  const handleToggleComplete = (id: string) => {
    onSubtasksChange(
      subtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st,
      ),
    );
  };

  const handleRemoveSubtask = (id: string) => {
    onSubtasksChange(subtasks.filter((st) => st.id !== id));
  };

  const handleUpdateTitle = (id: string, title: string) => {
    onSubtasksChange(
      subtasks.map((st) => (st.id === id ? { ...st, title } : st)),
    );
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <ListBulletIcon className="h-4 w-4" />
          <span>Subtasks</span>
          {subtasks.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-full text-xs">
              {completedCount}/{subtasks.length}
            </span>
          )}
        </div>
      </div>

      {/* Subtasks container */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        {/* Existing subtasks */}
        {subtasks.length > 0 && (
          <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(subtask.id)}
                  className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                                        ${
                                          subtask.completed
                                            ? "bg-green-500 border-green-500 text-white"
                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-brand"
                                        }
                                    `}
                >
                  {subtask.completed && <CheckIcon className="w-3 h-3" />}
                </button>

                {/* Title input */}
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) =>
                    handleUpdateTitle(subtask.id, e.target.value)
                  }
                  className={`
                                        flex-1 bg-transparent text-sm focus:outline-none
                                        ${
                                          subtask.completed
                                            ? "text-slate-400 dark:text-slate-500 line-through"
                                            : "text-slate-700 dark:text-slate-200"
                                        }
                                    `}
                />

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(subtask.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new subtask input */}
        <form
          onSubmit={handleAddSubtask}
          className={`flex items-center gap-3 px-4 py-3 ${subtasks.length > 0 ? "border-t border-slate-200 dark:border-slate-700/50" : ""}`}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <PlusIcon className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask..."
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {newSubtask.trim() && (
            <button
              type="submit"
              className="px-3 py-1 text-xs font-medium text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors"
            >
              Add
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubtasksSection;
