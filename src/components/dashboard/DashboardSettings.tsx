import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, EyeIcon, EyeOffIcon } from "../icons";
import { useDashboardStore, WidgetId } from "../../store/dashboardStore";

interface DashboardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const WIDGET_LABELS: Record<WidgetId, { label: string; icon: string }> = {
  energy: { label: "Energy Selector", icon: "⚡" },
  focus: { label: "Focus Task", icon: "🎯" },
  quickAdd: { label: "Quick Add", icon: "➕" },
  tasks: { label: "Tasks", icon: "✓" },
  habits: { label: "Habits", icon: "🔥" },
  finance: { label: "Finance", icon: "💰" },
  upcoming: { label: "Upcoming", icon: "📅" },
  urgent: { label: "Urgent", icon: "⚠️" },
  miniCalendar: { label: "Mini Calendar", icon: "🗓️" },
  productivityScore: { label: "Productivity Score", icon: "📊" },
  dailyReview: { label: "Daily Review", icon: "📝" },
};

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    widgetSettings,
    toggleWidgetVisibility,
    setWidgetSize,
    resetToDefaults,
  } = useDashboardStore();

  const handleReset = () => {
    if (confirm("Reset all dashboard settings to default?")) {
      resetToDefaults();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Dashboard Settings
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Customize which widgets appear on your dashboard
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <XIcon className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Widget List */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                <div className="space-y-3">
                  {(Object.keys(WIDGET_LABELS) as WidgetId[]).map(
                    (widgetId) => {
                      const widget = WIDGET_LABELS[widgetId];
                      const settings = widgetSettings[widgetId];

                      return (
                        <div
                          key={widgetId}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{widget.icon}</span>
                            <div>
                              <h3 className="font-medium text-slate-800 dark:text-white">
                                {widget.label}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Size Toggle */}
                            <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1">
                              <button
                                onClick={() =>
                                  setWidgetSize(widgetId, "compact")
                                }
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  settings.size === "compact"
                                    ? "bg-brand text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                              >
                                Compact
                              </button>
                              <button
                                onClick={() => setWidgetSize(widgetId, "full")}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                  settings.size === "full"
                                    ? "bg-brand text-white"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                              >
                                Full
                              </button>
                            </div>

                            {/* Visibility Toggle */}
                            <button
                              onClick={() => toggleWidgetVisibility(widgetId)}
                              className={`p-2 rounded-lg transition-colors ${
                                settings.visible
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : "bg-slate-200 dark:bg-slate-600 text-slate-400"
                              }`}
                            >
                              {settings.visible ? (
                                <EyeIcon className="h-5 w-5" />
                              ) : (
                                <EyeOffIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
