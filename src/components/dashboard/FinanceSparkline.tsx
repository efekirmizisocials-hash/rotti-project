import React, { useMemo } from "react";
import { BanknotesIcon } from "../icons";
import { useFinances } from "../../hooks/useFinances";
import { useUIStore } from "../../store/uiStore";
import { useDashboardStore } from "../../store/dashboardStore";
import { WidgetCard } from "./WidgetCard";

export const FinanceSparkline: React.FC = () => {
  const { analytics, transactions } = useFinances();
  const setActiveView = useUIStore((state) => state.setActiveView);
  const { getWidgetSize } = useDashboardStore();

  // Calculate last 7 days net flow (income - expenses)
  const sparklineData = useMemo(() => {
    const days = 7;
    const data: Array<{ date: string; net: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTransactions = transactions.filter((t) =>
        t.date.startsWith(dateStr),
      );

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        date: dateStr,
        net: income - expenses,
      });
    }

    return data;
  }, [transactions]);

  // Calculate sparkline path
  const sparklinePath = useMemo(() => {
    if (sparklineData.length === 0) return "";

    const width = 120;
    const height = 40;
    const max = Math.max(...sparklineData.map((d) => Math.abs(d.net)), 1);
    const min = Math.min(...sparklineData.map((d) => d.net), 0);
    const range = max - min || 1;

    const points = sparklineData.map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((d.net - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [sparklineData]);

  // Calculate trend
  const trend = useMemo(() => {
    if (sparklineData.length < 2) return "neutral";
    const first = sparklineData[0].net;
    const last = sparklineData[sparklineData.length - 1].net;
    if (last > first) return "up";
    if (last < first) return "down";
    return "neutral";
  }, [sparklineData]);

  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
        ? "text-red-500"
        : "text-slate-500";

  return (
    <WidgetCard
      title="Finances"
      icon={<BanknotesIcon className="h-4 w-4 text-green-500" />}
      onClick={() => setActiveView("finances" as any)}
      size={getWidgetSize("finance")}
      compactContent={
        <div className="text-center">
          <div className="text-2xl font-black text-green-500">
            ${analytics.totalBalance.toLocaleString()}
          </div>
          <div className={`text-sm font-bold ${trendColor}`}>{trendIcon}</div>
        </div>
      }
    >
      <div className="space-y-3">
        {/* Balance */}
        <div>
          <div className="text-3xl font-black text-slate-800 dark:text-white">
            ${analytics.totalBalance.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current balance
          </div>
        </div>

        {/* Sparkline */}
        <div className="relative">
          <svg width="120" height="40" className="w-full">
            <path
              d={sparklinePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-slate-400"
              }
            />
          </svg>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>7 days ago</span>
            <span className={`font-bold ${trendColor}`}>{trendIcon}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-green-500 font-bold">
              ↑ ${analytics.totalIncome.toLocaleString()}
            </span>
            <div className="text-xs text-slate-400">Income</div>
          </div>
          <div>
            <span className="text-red-500 font-bold">
              ↓ ${analytics.totalExpenses.toLocaleString()}
            </span>
            <div className="text-xs text-slate-400">Expenses</div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
};
