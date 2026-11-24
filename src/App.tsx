/**
 * Showcase shell: just the Planner module.
 * No router, no auth, no backend. Data is mock data kept in localStorage.
 */

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import UnifiedPlanner from "./components/UnifiedPlanner";
import { AddItemPanel } from "./components/AddItemPanel";
import { useLocalization } from "./contexts/LocalizationContext";
import { useItemHandlers } from "./hooks/useItemHandlers";
import { resetPlannerItems } from "./hooks/usePlannerItems";
import { resetProjects, useProjects } from "./hooks/useProjects";
import { resetUserStats } from "./hooks/useUserStats";
import { clearAllCollections } from "./mocks/localDb";
import { useUIStore } from "./store/uiStore";

const App: React.FC = () => {
  const { language, setLanguage } = useLocalization();
  const { projects } = useProjects();
  const itemHandlers = useItemHandlers();
  const isComposerOpen = useUIStore((s) => s.isComposerOpen);
  const setComposerOpen = useUIStore((s) => s.setComposerOpen);
  const [dark, setDark] = useState(false);

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
    toast.success(
      language === "tr" ? "Demo verisi sıfırlandı" : "Demo data reset",
    );
  };

  const btn =
    "px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-brand font-heading">
            rotti
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400">
            Planner showcase
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-slate-400 mr-2">
            {language === "tr"
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
            {language === "tr" ? "Demoyu sıfırla" : "Reset demo"}
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <UnifiedPlanner />
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
