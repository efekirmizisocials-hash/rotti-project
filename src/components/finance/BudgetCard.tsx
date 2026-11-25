import React, { useState, useRef, useEffect } from "react";
import { Budget, FinanceCategory } from "../../types";
import { categoryConfig } from "../../hooks/useFinances";
import { motion } from "framer-motion";

interface BudgetCardProps {
  budget: Budget & {
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
  };
  onEdit: (budget: Budget) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit }) => {
  const config = categoryConfig[budget.category];
  const isOver = budget.isOverBudget;

  // Determine color based on usage
  let progressColor = "bg-green-500";
  if (budget.percentage > 75) progressColor = "bg-yellow-500";
  if (budget.percentage > 90) progressColor = "bg-red-400";
  if (isOver) progressColor = "bg-red-600";

  return (
    <div
      onClick={() => onEdit(budget)}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
            style={{ backgroundColor: config.color + "20" }}
          >
            {config.emoji}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-white leading-tight">
              {config.label}
            </h4>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}{" "}
              Budget
            </div>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`font-bold ${isOver ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}
          >
            ${budget.spent.toFixed(0)}
          </p>
          <p className="text-xs text-slate-400">
            of ${budget.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute left-0 top-0 h-full rounded-full ${progressColor}`}
        />
      </div>

      {/* Status Text or Warning */}
      <div className="flex justify-between items-center mt-2 text-xs">
        {isOver ? (
          <span className="text-red-500 font-medium flex items-center gap-1">
            ⚠️ Over by ${Math.abs(budget.remaining).toFixed(0)}
          </span>
        ) : (
          <span className="text-slate-500">
            ${budget.remaining.toFixed(0)} left
          </span>
        )}
        <span className="text-slate-400 group-hover:text-brand transition-colors">
          Edit
        </span>
      </div>
    </div>
  );
};
