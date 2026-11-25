import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
}) => (
  <div
    className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-white/20 rounded-xl">{icon}</div>
      <span className="text-sm text-slate-600 dark:text-white/70">{title}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    {subtitle && <p className="text-sm text-slate-500 dark:text-white/60 mt-1">{subtitle}</p>}
  </div>
);
