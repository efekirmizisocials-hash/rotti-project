import React from "react";
import { useFinances } from "../../../hooks/useFinances";
import { CashFlowChart } from "../charts/CashFlowChart";
import { SummaryCard } from "../cards/SummaryCard";
import { ExpenseBreakdown } from "../charts/ExpenseBreakdown";

export const FinanceAnalytics: React.FC = () => {
  const { analytics } = useFinances();

  // Calculate Net Worth Change (simple difference between first and last month of available data)
  const netChange = analytics.monthlyTrends.reduce((sum, m) => sum + m.net, 0);
  const isPositive = netChange >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Current Net Worth"
          value={`$${analytics.totalBalance.toLocaleString()}`}
          icon={<span>🏦</span>}
          gradient="from-indigo-500/20 to-purple-600/20"
        />
        <SummaryCard
          title="Yearly Net Flow"
          value={`${isPositive ? "+" : "-"}$${Math.abs(netChange).toLocaleString()}`}
          subtitle="Last 12 months"
          icon={<span>📉</span>}
          gradient={
            isPositive
              ? "from-emerald-500/20 to-teal-600/20"
              : "from-red-500/20 to-rose-600/20"
          }
        />
        <SummaryCard
          title="Avg. Savings Rate"
          value={`${analytics.savingsRate}%`}
          subtitle="This month"
          icon={<span>🐖</span>}
          gradient="from-amber-500/20 to-orange-600/20"
        />
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Cash Flow
            </h3>
            <p className="text-sm text-slate-500">
              Income vs Expenses over the last 12 months
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Expenses
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-slate-600 dark:text-slate-400">
                Net Flow
              </span>
            </div>
          </div>
        </div>
        <CashFlowChart data={analytics.monthlyTrends} />
      </div>

      {/* Breakdown & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Spending Breakdown
          </h3>
          <ExpenseBreakdown data={analytics.expensesByCategory} />
        </div>

        {/* Insights / Tips Card (Placeholder for now, could be AI driven) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span>💡</span> Financial Insights
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <p>
                Your highest spending category this month is{" "}
                <span className="font-semibold text-slate-800 dark:text-white">
                  Food & Dining
                </span>
                .
              </p>
            </li>
            <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <p>
                You have saved{" "}
                <span className="font-semibold text-green-600">
                  {analytics.savingsRate}%
                </span>{" "}
                of your income this month.{" "}
                {analytics.savingsRate > 20
                  ? "Keep it up!"
                  : "Try to aim for 20%."}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
