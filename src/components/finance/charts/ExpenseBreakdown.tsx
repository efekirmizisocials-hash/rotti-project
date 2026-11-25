import React, { useMemo } from "react";
import { FinanceCategory } from "../../../types";
import { categoryConfig } from "../../../hooks/useFinances";

interface ExpenseBreakdownProps {
  data: Record<FinanceCategory, number>;
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ data }) => {
  const sortedData = useMemo(() => {
    return Object.entries(data)
      .map(([cat, amount]) => ({
        category: cat as FinanceCategory,
        amount,
        config: categoryConfig[cat as FinanceCategory],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [data]);

  const maxAmount = Math.max(...sortedData.map((d) => d.amount), 1);

  if (sortedData.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8">
        No expenses this month
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedData.map(({ category, amount, config }) => (
        <div key={category} className="flex items-center gap-3">
          <span className="text-lg w-8">{config.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                {config.label}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ${amount.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(amount / maxAmount) * 100}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
