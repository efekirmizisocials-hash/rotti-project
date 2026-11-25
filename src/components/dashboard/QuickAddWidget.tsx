import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "../icons";
import { usePlannerItems } from "../../hooks/usePlannerItems";
import { ItemType, Priority } from "../../types";

export const QuickAddWidget: React.FC = () => {
  const { addItem } = usePlannerItems();
  const [quickInput, setQuickInput] = useState("");

  const handleQuickAdd = async () => {
    if (!quickInput.trim()) return;
    await addItem({
      title: quickInput,
      type: ItemType.TASK,
      priority: Priority.LOW,
      category: "Work" as any,
      completed: false,
      creationDate: new Date().toISOString(),
      order: 0,
      tags: [],
      projectId: null,
    });
    setQuickInput("");
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-4 flex items-center"
    >
      <PlusIcon className="h-5 w-5 text-slate-400 ml-4" />
      <input
        type="text"
        value={quickInput}
        onChange={(e) => setQuickInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
        placeholder="Quick add a task..."
        className="flex-1 p-3 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
      />
      {quickInput && (
        <button
          onClick={handleQuickAdd}
          className="px-4 py-2 mr-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          Add
        </button>
      )}
    </motion.div>
  );
};
