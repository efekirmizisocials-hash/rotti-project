/**
 * FinancesView Component
 * Personal finance dashboard with transactions, analytics, and budgeting
 */

import React, { useState, useEffect } from "react";
import { useFinances, categoryConfig } from "../hooks/useFinances";
import { useLocalization } from "../contexts/LocalizationContext";
import { Budget } from "../types";
import {
  PlusIcon,
  ChartBarIcon,
  SearchIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
} from "./icons";

// Components
import { TransactionRow } from "./finance/TransactionRow";
import { BudgetCard } from "./finance/BudgetCard";
import { SubscriptionRow } from "./finance/SubscriptionRow";
import { SummaryCard } from "./finance/cards/SummaryCard";
import { ExpenseBreakdown } from "./finance/charts/ExpenseBreakdown";
import { MonthlyTrendChart } from "./finance/charts/MonthlyTrendChart";
import { FinanceAnalytics } from "./finance/analytics/FinanceAnalytics";

// Modals
import { AddTransactionModal } from "./finance/modals/AddTransactionModal";
import { AddBudgetModal } from "./finance/modals/AddBudgetModal";
import { AddSubscriptionModal } from "./finance/modals/AddSubscriptionModal";

const FinancesView: React.FC = () => {
  const {
    transactions,
    loading,
    analytics,
    addTransaction,
    deleteTransaction,
    budgets,
    budgetAnalytics,
    addBudget,
    subscriptions,
    addSubscription,
    deleteSubscription,
  } = useFinances();
  const { t } = useLocalization();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "analytics"
    | "budgets"
    | "subscriptions"
    | "transactions"
    | "archive"
  >("overview");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryConfig[tx.category].label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const txDate = new Date(tx.date);
    const matchesStart = dateRange.start
      ? txDate >= new Date(dateRange.start)
      : true;
    const matchesEnd = dateRange.end ? txDate <= new Date(dateRange.end) : true;
    return matchesSearch && matchesStart && matchesEnd;
  });

  const handleExport = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx) =>
        [
          new Date(tx.date).toLocaleDateString(),
          `"${tx.description}"`,
          categoryConfig[tx.category].label,
          tx.type,
          tx.amount.toFixed(2),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <span className="text-4xl">💰</span>
            {t("financesView.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("financesView.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-light text-white rounded-xl font-semibold transition-colors"
            data-tutorial="add-transaction-button"
          >
            <PlusIcon className="w-5 h-5" />
            {t("financesView.addTransaction")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
        {(
          [
            "overview",
            "analytics",
            "budgets",
            "subscriptions",
            "transactions",
            "archive",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-white dark:bg-slate-700 text-brand shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab === "archive" ? "📦 Archive" : t(`financesView.${tab}`)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title={t("financesView.totalBalance")}
              value={`$${analytics.totalBalance.toLocaleString()}`}
              icon={<span className="text-xl">💵</span>}
              gradient="from-emerald-500/20 to-teal-600/20"
            />
            <SummaryCard
              title={t("financesView.incomeThisMonth")}
              value={`$${analytics.totalIncome.toLocaleString()}`}
              subtitle={t("financesView.totalEarnings")}
              icon={<span className="text-xl">📈</span>}
              gradient="from-green-500/20 to-emerald-600/20"
            />
            <SummaryCard
              title={t("financesView.expensesThisMonth")}
              value={`$${analytics.totalExpenses.toLocaleString()}`}
              subtitle={t("financesView.totalSpending")}
              icon={<span className="text-xl">📉</span>}
              gradient="from-red-500/20 to-rose-600/20"
            />
            <SummaryCard
              title={t("financesView.savingsRate")}
              value={`${analytics.savingsRate}%`}
              subtitle={
                analytics.savingsRate >= 20
                  ? t("financesView.greatJob")
                  : t("financesView.keepSaving")
              }
              icon={<span className="text-xl">🎯</span>}
              gradient="from-[#FF6B6B]/20 to-[#EE5A6F]/20"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-brand dark:text-brand-light" />
                {t("financesView.expenseBreakdown")}
              </h3>
              <ExpenseBreakdown data={analytics.expensesByCategory} />
            </div>

            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                📊 {t("financesView.monthlyTrend")}
              </h3>
              <MonthlyTrendChart data={analytics.monthlyTrends} />
            </div>
          </div>
        </>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && <FinanceAnalytics />}

      {/* BUDGETS TAB */}
      {activeTab === "budgets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t("financesView.monthlyBudgets")}
              </h3>
              <p className="text-sm text-slate-500">
                {t("financesView.trackSpendingLimits")}
              </p>
            </div>
            <button
              onClick={() => {
                setBudgetToEdit(undefined);
                setIsBudgetModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {t("financesView.setNewBudget")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetAnalytics.map((budget) => (
              <BudgetCard
                key={budget.category + budget.period}
                budget={budget}
                onEdit={(b) => {
                  setBudgetToEdit(b);
                  setIsBudgetModalOpen(true);
                }}
              />
            ))}
            {budgetAnalytics.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <p className="text-4xl mb-2">📊</p>
                <p>{t("financesView.noBudgetsYet")}</p>
                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="text-brand hover:underline mt-2"
                >
                  {t("financesView.createOneNow")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t("financesView.subscriptionsAndRecurring")}
              </h3>
              <p className="text-sm text-slate-500">
                {t("financesView.manageRecurringPayments")}
              </p>
            </div>
            <button
              onClick={() => setIsSubModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {t("financesView.addSubscription")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                subscription={sub}
                onDelete={deleteSubscription}
              />
            ))}
            {subscriptions.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <p className="text-4xl mb-2">📅</p>
                <p>{t("financesView.noSubscriptionsTracked")}</p>
                <button
                  onClick={() => setIsSubModalOpen(true)}
                  className="text-brand hover:underline mt-2"
                >
                  {t("financesView.addYourFirstOne")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ARCHIVE TAB - Monthly Summary */}
      {activeTab === "archive" &&
        (() => {
          // Group transactions by YYYY-MM
          const monthMap: Record<
            string,
            { income: number; expenses: number; items: typeof transactions }
          > = {};
          transactions.forEach((tx) => {
            const key = tx.date.slice(0, 7); // "2026-03"
            if (!monthMap[key])
              monthMap[key] = { income: 0, expenses: 0, items: [] };
            if (tx.type === "income") monthMap[key].income += tx.amount;
            else monthMap[key].expenses += tx.amount;
            monthMap[key].items.push(tx);
          });
          const months = Object.entries(monthMap).sort((a, b) =>
            b[0].localeCompare(a[0]),
          );

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  📦 Monthly Archive
                </h3>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors text-slate-600 dark:text-slate-300"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
                </button>
              </div>
              {months.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-2">📅</p>
                  <p>No transactions yet. Start tracking your finances!</p>
                </div>
              ) : (
                months.map(([monthKey, { income, expenses, items }]) => {
                  const label = new Date(monthKey + "-01").toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" },
                  );
                  const net = income - expenses;
                  return (
                    <details
                      key={monthKey}
                      className="group bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-800 dark:text-white font-semibold">
                            {label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {items.length} transactions
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            +${income.toLocaleString()}
                          </span>
                          <span className="text-red-500 dark:text-red-400 font-medium">
                            -${expenses.toLocaleString()}
                          </span>
                          <span
                            className={`font-bold ${net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                          >
                            {net >= 0 ? "+" : ""}
                            {net.toLocaleString()}
                          </span>
                        </div>
                      </summary>
                      <div className="px-6 pb-4 space-y-1 border-t border-slate-100 dark:border-slate-700 pt-3">
                        {items.map((tx) => (
                          <TransactionRow
                            key={tx.id}
                            transaction={tx}
                            onDelete={deleteTransaction}
                          />
                        ))}
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          );
        })()}

      {/* TRANSACTIONS TAB */}
      {(activeTab === "transactions" || activeTab === "overview") && (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              📋 {t("financesView.recentTransactions")}
            </h3>

            {activeTab === "transactions" && (
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors text-slate-600 dark:text-slate-300"
                  title={t("financesView.exportToCsv")}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {t("common.export")}
                </button>
              </div>
            )}
          </div>

          {/* Toolbar (Only visible on Transactions tab) */}
          {activeTab === "transactions" && (
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("financesView.searchTransactions")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  />
                </div>
              </div>
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">💸</p>
              <p className="text-slate-400">
                {t("financesView.noTransactionsFound")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(activeTab === "overview"
                ? transactions.slice(0, 5)
                : filteredTransactions
              ).map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  onDelete={deleteTransaction}
                />
              ))}
              {activeTab === "overview" && transactions.length > 5 && (
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="w-full py-2 text-center text-sm text-slate-500 hover:text-brand transition-colors"
                >
                  {t("financesView.viewAllTransactions")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addTransaction}
      />

      <AddBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setBudgetToEdit(undefined);
        }}
        onSave={addBudget}
        existingBudget={budgetToEdit}
      />

      <AddSubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSave={addSubscription}
      />
    </div>
  );
};

export default FinancesView;
