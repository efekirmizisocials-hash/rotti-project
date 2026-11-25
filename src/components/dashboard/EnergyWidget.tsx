import React from "react";
import { motion } from "framer-motion";
import { useUIStore } from "../../store/uiStore";

const energyLevels = ["low", "medium", "high", "peak"] as const;

export const EnergyWidget: React.FC = () => {
  const energy = useUIStore((state) => state.userEnergyLevel);
  const setEnergy = useUIStore((state) => state.setUserEnergyLevel);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-4 shadow-lg border border-slate-100 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-800 dark:text-white font-bold text-lg">
            How's your energy?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Set your energy level to get personalized task recommendations
          </p>
        </div>
        <div className="text-4xl">
          {energy === "low" && "🔋"}
          {energy === "medium" && "⚡"}
          {energy === "high" && "🔥"}
          {energy === "peak" && "⭐"}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {energyLevels.map((level, index) => {
          // Map energy levels to numeric order for progressive fill
          const energyOrder = { low: 1, medium: 2, high: 3, peak: 4 };
          const currentOrder = energyOrder[energy];
          const levelOrder = index + 1; // 1-indexed

          const isFilled = levelOrder <= currentOrder; // Fill all levels up to current
          const isSelected = energy === level; // Exact selection for ring effect

          const bgColors = {
            low: "from-amber-500 to-amber-600",
            medium: "from-teal-500 to-teal-600",
            high: "from-rose-500 to-rose-600",
            peak: "from-purple-500 to-purple-600",
          };
          const lightBg = {
            low: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700",
            medium:
              "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700",
            high: "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700",
            peak: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700",
          };
          const labels = {
            low: { emoji: "🔋", text: "Low", desc: "Simple tasks" },
            medium: { emoji: "⚡", text: "Medium", desc: "Regular work" },
            high: { emoji: "🔥", text: "High", desc: "Deep focus" },
            peak: { emoji: "⭐", text: "Peak", desc: "Flow state" },
          };
          return (
            <motion.button
              key={level}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEnergy(level)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                isFilled
                  ? `bg-gradient-to-br ${bgColors[level]} text-white shadow-lg ${isSelected ? "scale-110 ring-4 ring-white/30 border-white/50" : "scale-105 border-transparent"}`
                  : `${lightBg[level]} text-slate-700 dark:text-slate-200 hover:scale-102 opacity-60`
              }`}
            >
              <div className="text-2xl mb-1">{labels[level].emoji}</div>
              <div className="font-bold text-sm">{labels[level].text}</div>
              <div
                className={`text-xs ${isFilled ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
              >
                {labels[level].desc}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
