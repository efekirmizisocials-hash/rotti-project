import React, { useState, useMemo } from "react";
import { Transaction, TransactionType, FinanceCategory } from "../../../types";
import { categoryConfig } from "../../../hooks/useFinances";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: Omit<Transaction, "id" | "userId" | "createdAt">) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<FinanceCategory>(
    FinanceCategory.FOOD,
  );
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    onAdd({
      type,
      amount: parseFloat(amount),
      currency: "USD",
      category,
      description: description || categoryConfig[category].label,
      date: new Date(date).toISOString(),
    });

    // Reset
    setAmount("");
    setDescription("");
    onClose();
  };

  const categories = useMemo(() => {
    return Object.entries(categoryConfig)
      .filter(([_, config]) => config.type === type)
      .map(([key, config]) => ({
        value: key as FinanceCategory,
        ...config,
      }));
  }, [type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          Add Transaction
        </h2>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-6">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setCategory(
                  t === "expense"
                    ? FinanceCategory.FOOD
                    : FinanceCategory.SALARY,
                );
              }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                type === t
                  ? t === "expense"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {t === "expense" ? "📉 Expense" : "📈 Income"}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
            Amount
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
              data-tutorial="transaction-amount-input"
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="text-sm text-slate-400 mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
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

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={categoryConfig[category].label}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-brand"
          />
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="text-sm text-slate-600 dark:text-slate-400 mb-1 block">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-brand"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 py-3 bg-brand text-white rounded-xl hover:bg-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            data-tutorial="save-transaction-button"
          >
            Add {type === "expense" ? "Expense" : "Income"}
          </button>
        </div>
      </div>
    </div>
  );
};
