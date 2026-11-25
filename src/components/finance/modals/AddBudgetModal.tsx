import React, { useState, useEffect, useMemo } from "react";
import { Budget, FinanceCategory } from "../../../types";
import { categoryConfig } from "../../../hooks/useFinances";

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    budget: Omit<Budget, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => void;
  existingBudget?: Budget;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingBudget,
}) => {
  const [amount, setAmount] = useState(
    existingBudget ? existingBudget.amount.toString() : "",
  );
  const [category, setCategory] = useState<FinanceCategory>(
    existingBudget ? existingBudget.category : FinanceCategory.FOOD,
  );
  const [period, setPeriod] = useState<"monthly" | "weekly" | "yearly">(
    "monthly",
  );

  useEffect(() => {
    if (existingBudget) {
      setAmount(existingBudget.amount.toString());
      setCategory(existingBudget.category);
      setPeriod(existingBudget.period);
    } else {
      setAmount("");
      setCategory(FinanceCategory.FOOD);
    }
  }, [existingBudget, isOpen]);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    onSave({
      category,
      amount: parseFloat(amount),
      period,
    });
    onClose();
  };

  const categories = useMemo(() => {
    return Object.entries(categoryConfig)
      .filter(([_, config]) => config.type === "expense")
      .map(([key, config]) => ({
        value: key as FinanceCategory,
        ...config,
      }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          {existingBudget ? "Edit Budget" : "Set Budget Limit"}
        </h2>

        <div className="mb-6">
          <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
            Monthly Limit
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 dark:text-slate-500">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-3xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-sm text-slate-400 mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`p-3 rounded-xl text-center transition-all ${
                  category === cat.value
                    ? "bg-brand ring-2 ring-indigo-400"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
                title={cat.label}
              >
                <span className="text-xl">{cat.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!amount}
            className="flex-1 py-3 bg-brand text-white rounded-xl hover:bg-brand-light transition-colors font-semibold"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};
