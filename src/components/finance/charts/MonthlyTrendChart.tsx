import React from "react";

interface MonthlyTrendChartProps {
  data: { month: string; income: number; expenses: number }[];
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
}) => {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);

  return (
    <div className="flex items-stretch justify-between h-40 gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex-1 w-full flex items-end gap-1">
            <div
              className="flex-1 bg-green-500/60 rounded-t transition-all duration-500"
              style={{ height: `${(d.income / maxValue) * 100}%` }}
              title={`Income: $${d.income}`}
            />
            <div
              className="flex-1 bg-red-500/60 rounded-t transition-all duration-500"
              style={{ height: `${(d.expenses / maxValue) * 100}%` }}
              title={`Expenses: $${d.expenses}`}
            />
          </div>
          <span className="text-xs text-slate-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
};
