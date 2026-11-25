import React, { useState } from "react";
import { Subscription } from "../../../types";

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    sub: Omit<Subscription, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => void;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [nextDate, setNextDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = () => {
    if (!name || !amount) return;
    onSave({
      name,
      amount: parseFloat(amount),
      currency: "USD",
      billingCycle: cycle,
      nextBillingDate: new Date(nextDate).toISOString(),
      status: "active",
      category: "subscriptions",
    });
    onClose();
    setName("");
    setAmount("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
          Add Subscription
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 block mb-1">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix"
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm text-slate-500 block mb-1">Cost</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-500 block mb-1">
                Billing Cycle
              </label>
              <select
                value={cycle}
                onChange={(e: any) => setCycle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-slate-500 block mb-1">
                Next Billing
              </label>
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !amount}
            className="flex-1 py-3 bg-brand text-white rounded-xl hover:bg-brand-light transition-colors font-semibold disabled:opacity-50"
          >
            Add Subscription
          </button>
        </div>
      </div>
    </div>
  );
};
