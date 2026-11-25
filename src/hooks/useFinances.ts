/**
 * useFinances (showcase build)
 *
 * Transactions, accounts, budgets and subscriptions kept in localStorage
 * (seeded with fictional demo data). Same public API as the full app's
 * hook; no backend, no auth.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Transaction,
  FinanceAccount,
  FinanceCategory,
  TransactionType,
  Budget,
  Subscription,
} from "../types";
import toast from "react-hot-toast";
import { newId, readCollection, writeCollection } from "../mocks/localDb";
import {
  DEMO_USER_ID,
  buildSeedAccounts,
  buildSeedBudgets,
  buildSeedSubscriptions,
  buildSeedTransactions,
} from "../mocks/financeSeed";

const KEYS = {
  transactions: "finance-transactions",
  accounts: "finance-accounts",
  budgets: "finance-budgets",
  subscriptions: "finance-subscriptions",
} as const;

function load<T>(key: string, seed: () => T[]): T[] {
  const stored = readCollection<T[]>(key);
  if (stored) return stored;
  const seeded = seed();
  writeCollection(key, seeded);
  return seeded;
}

/** Removes stored finance data so the seed is rebuilt on next load. */
export function resetFinanceData(): void {
  Object.values(KEYS).forEach((k) => writeCollection(k, null));
}

export const categoryConfig: Record<
  FinanceCategory,
  { emoji: string; label: string; color: string; type: TransactionType }
> = {
  // Expenses
  [FinanceCategory.HOUSING]: {
    emoji: "🏠",
    label: "Housing",
    color: "#6366f1",
    type: "expense",
  },
  [FinanceCategory.FOOD]: {
    emoji: "🍔",
    label: "Food & Dining",
    color: "#f97316",
    type: "expense",
  },
  [FinanceCategory.TRANSPORT]: {
    emoji: "🚗",
    label: "Transportation",
    color: "#3b82f6",
    type: "expense",
  },
  [FinanceCategory.ENTERTAINMENT]: {
    emoji: "🎬",
    label: "Entertainment",
    color: "#ec4899",
    type: "expense",
  },
  [FinanceCategory.UTILITIES]: {
    emoji: "💡",
    label: "Utilities",
    color: "#eab308",
    type: "expense",
  },
  [FinanceCategory.SHOPPING]: {
    emoji: "🛍️",
    label: "Shopping",
    color: "#8b5cf6",
    type: "expense",
  },
  [FinanceCategory.HEALTH]: {
    emoji: "💊",
    label: "Health",
    color: "#ef4444",
    type: "expense",
  },
  [FinanceCategory.EDUCATION]: {
    emoji: "📚",
    label: "Education",
    color: "#14b8a6",
    type: "expense",
  },
  [FinanceCategory.TRAVEL]: {
    emoji: "✈️",
    label: "Travel",
    color: "#06b6d4",
    type: "expense",
  },
  [FinanceCategory.SUBSCRIPTIONS]: {
    emoji: "📱",
    label: "Subscriptions",
    color: "#a855f7",
    type: "expense",
  },
  [FinanceCategory.RENT]: {
    emoji: "🏘️",
    label: "Rent",
    color: "#dc2626",
    type: "expense",
  },
  [FinanceCategory.PHONE_BILL]: {
    emoji: "📞",
    label: "Phone Bill",
    color: "#2563eb",
    type: "expense",
  },
  [FinanceCategory.OTHER_EXPENSE]: {
    emoji: "📦",
    label: "Other",
    color: "#64748b",
    type: "expense",
  },
  // Income
  [FinanceCategory.SALARY]: {
    emoji: "💼",
    label: "Salary",
    color: "#22c55e",
    type: "income",
  },
  [FinanceCategory.FREELANCE]: {
    emoji: "💻",
    label: "Freelance",
    color: "#10b981",
    type: "income",
  },
  [FinanceCategory.INVESTMENTS]: {
    emoji: "📈",
    label: "Investments",
    color: "#059669",
    type: "income",
  },
  [FinanceCategory.GIFTS]: {
    emoji: "🎁",
    label: "Gifts",
    color: "#34d399",
    type: "income",
  },
  [FinanceCategory.OTHER_INCOME]: {
    emoji: "💰",
    label: "Other Income",
    color: "#4ade80",
    type: "income",
  },
};

export function useFinances() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    load(KEYS.transactions, buildSeedTransactions),
  );
  const [accounts, setAccounts] = useState<FinanceAccount[]>(() =>
    load(KEYS.accounts, buildSeedAccounts),
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    load(KEYS.budgets, buildSeedBudgets),
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    load(KEYS.subscriptions, buildSeedSubscriptions),
  );
  const loading = false;
  const error: string | null = null;

  // Persist every change.
  useEffect(() => writeCollection(KEYS.transactions, transactions), [transactions]);
  useEffect(() => writeCollection(KEYS.accounts, accounts), [accounts]);
  useEffect(() => writeCollection(KEYS.budgets, budgets), [budgets]);
  useEffect(() => writeCollection(KEYS.subscriptions, subscriptions), [subscriptions]);

  const fetchData = useCallback(async () => {
    setTransactions(load(KEYS.transactions, buildSeedTransactions));
    setAccounts(load(KEYS.accounts, buildSeedAccounts));
    setBudgets(load(KEYS.budgets, buildSeedBudgets));
    setSubscriptions(load(KEYS.subscriptions, buildSeedSubscriptions));
  }, []);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "userId" | "createdAt">) => {
      const newTx: Transaction = {
        ...transaction,
        id: newId(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      toast.success(
        `${transaction.type === "income" ? "Income" : "Expense"} added! 💰`,
      );
      return newTx;
    },
    [],
  );

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted");
  }, []);

  const addAccount = useCallback(
    async (account: Omit<FinanceAccount, "id" | "userId" | "createdAt">) => {
      const newAccount: FinanceAccount = {
        ...account,
        id: newId(),
        userId: DEMO_USER_ID,
        createdAt: new Date().toISOString(),
      };
      setAccounts((prev) => [...prev, newAccount]);
      toast.success("Account added! 🏦");
      return newAccount;
    },
    [],
  );

  const addBudget = useCallback(
    async (
      budget: Omit<Budget, "id" | "userId" | "createdAt" | "updatedAt">,
    ) => {
      const now = new Date().toISOString();
      const newBudget: Budget = {
        ...budget,
        id: newId(),
        userId: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now,
      };
      // Upsert: one budget per category + period.
      setBudgets((prev) => [
        ...prev.filter(
          (b) =>
            b.category !== newBudget.category || b.period !== newBudget.period,
        ),
        newBudget,
      ]);
      toast.success("Budget saved! 📊");
      return newBudget;
    },
    [],
  );

  const addSubscription = useCallback(
    async (
      subscription: Omit<
        Subscription,
        "id" | "userId" | "createdAt" | "updatedAt"
      >,
    ) => {
      const now = new Date().toISOString();
      const newSub: Subscription = {
        ...subscription,
        id: newId(),
        userId: DEMO_USER_ID,
        createdAt: now,
        updatedAt: now,
      };
      setSubscriptions((prev) => [...prev, newSub]);
      toast.success("Subscription added! 📅");
      return newSub;
    },
    [],
  );

  const deleteSubscription = useCallback(async (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    toast.success("Subscription removed");
  }, []);

  // Analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthTx = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth,
    );

    const totalIncome = thisMonthTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = thisMonthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
        : 0;

    // Expense breakdown by category
    const expensesByCategory = thisMonthTx
      .filter((t) => t.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        },
        {} as Record<FinanceCategory, number>,
      );

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTx = transactions.filter((t) => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const income = monthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expenses = monthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      monthlyTrends.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        income,
        expenses,
        net: income - expenses,
      });
    }

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      savingsRate,
      expensesByCategory,
      monthlyTrends,
    };
  }, [transactions, accounts]);

  // Budget Analytics
  const budgetAnalytics = useMemo(() => {
    return budgets
      .map((budget) => {
        const spent = analytics.expensesByCategory[budget.category] || 0;
        const remaining = budget.amount - spent;
        const percentage = Math.min((spent / budget.amount) * 100, 100);

        return {
          ...budget,
          spent,
          remaining,
          percentage,
          isOverBudget: spent > budget.amount,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets, analytics.expensesByCategory]);

  return {
    transactions,
    accounts,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    addAccount,
    addBudget,
    addSubscription,
    deleteSubscription,
    subscriptions,
    budgets,
    budgetAnalytics,
    analytics,
    refetch: fetchData,
  };
}

export default useFinances;
