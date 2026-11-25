import React from "react";
import { Transaction } from "../../types";
import { categoryConfig } from "../../hooks/useFinances";
import { TrashIcon } from "../icons";

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onDelete,
}) => {
  const config = categoryConfig[transaction.category];
  const isExpense = transaction.type === "expense";

  return (
    <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: config.color + "33" }}
        >
          {config.emoji}
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-white">
            {transaction.description}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(transaction.date).toLocaleDateString()} • {config.label}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p
          className={`font-bold ${isExpense ? "text-red-400" : "text-green-400"}`}
        >
          {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
        </p>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
