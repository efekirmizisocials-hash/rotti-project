import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";

interface CashFlowChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
    net: number;
  }[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            tick={{ fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          <Bar
            dataKey="income"
            name="Income"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net Flow"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="net"
            fill="#6366f1"
            stroke="#6366f1"
            fillOpacity={0.1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
