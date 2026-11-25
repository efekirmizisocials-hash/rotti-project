/**
 * Demo shell: Dashboard, Planner and Finance modules.
 * No router, no auth, no backend. Data is mock data kept in localStorage.
 */

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DashboardView from "./components/DashboardView";
import FinancesView from "./components/FinancesView";
import UnifiedPlanner from "./components/UnifiedPlanner";
import { AddItemPanel } from "./components/AddItemPanel";
import { useLocalization } from "./contexts/LocalizationContext";
import { useItemHandlers } from "./hooks/useItemHandlers";
import { resetFinanceData } from "./hooks/useFinances";
import { resetPlannerItems } from "./hooks/usePlannerItems";
import { resetProjects, useProjects } from "./hooks/useProjects";
import { resetUserStats } from "./hooks/useUserStats";
import { clearAllCollections } from "./mocks/localDb";
import { useDashboardStore } from "./store/dashboardStore";
import { useUIStore, ViewType } from "./store/uiStore";

const NAV: { id: ViewType; label: string; labelTr: string }[] = [
  { id: "dashboard", label: "Dashboard", labelTr: "Panel" },
  { id: "plan", label: "Planner", labelTr: "Planlayıcı" },
  { id: "finances", label: "Finance", labelTr: "Finans" },
];

const App: React.FC = () => {
  const { language, setLanguage } = useLocalization();
  const { projects } = useProjects();
  const itemHandlers = useItemHandlers();
  const activeView = useUIStore((s) => s.activeView);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const isComposerOpen = useUIStore((s) => s.isComposerOpen);
  const setComposerOpen = useUIStore((s) => s.setComposerOpen);
  const [dark, setDark] = useState(false);
  // Bumped on reset so the active view remounts and re-reads storage.
  const [resetKey, setResetKey] = useState(0);

  const tr = language === "tr";
  const view: ViewType = NAV.some((n) => n.id === activeView)
    ? activeView
    : "dashboard";

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const resetDemo = () => {
    clearAllCollections();
    resetPlannerItems();
    resetProjects();
    resetUserStats();
    resetFinanceData();
    useDashboardStore.getState().resetToDefaults();
    setResetKey((k) => k + 1);
    toast.success(tr ? "Demo verisi sıfırlandı" : "Demo data reset");
  };

  const btn =
    "px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-bold text-brand font-heading">
              rotti
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-wider text-slate-400">
              Demo
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveView(n.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  view === n.id
                    ? "bg-brand/10 text-brand"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tr ? n.labelTr : n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline text-xs text-slate-400 mr-2">
            {tr
              ? "Demo modu: veriler tarayıcında, yapay zekâ sahte"
              : "Demo mode: data stays in your browser, AI is mocked"}
          </span>
          <button
            className={btn}
            onClick={() => setLanguage(language === "en" ? "tr" : "en")}
          >
            {language === "en" ? "TR" : "EN"}
          </button>
          <button className={btn} onClick={toggleDark}>
            {dark ? "☀" : "☾"}
          </button>
          <button className={btn} onClick={resetDemo}>
            {tr ? "Demoyu sıfırla" : "Reset demo"}
          </button>
        </div>
      </header>

      <main
        key={`${view}-${resetKey}`}
        className={
          view === "plan"
            ? "p-4 md:p-6"
            : view === "finances"
              ? "max-w-7xl mx-auto p-4 md:p-8"
              : ""
        }
      >
        {view === "dashboard" && <DashboardView />}
        {view === "plan" && <UnifiedPlanner />}
        {view === "finances" && <FinancesView />}
      </main>

      {isComposerOpen && (
        <AddItemPanel
          isOpen={isComposerOpen}
          onClose={() => setComposerOpen(false)}
          projects={projects}
          onAddItem={async (itemData) => {
            await itemHandlers.handleAddItem(itemData);
            setComposerOpen(false);
          }}
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
