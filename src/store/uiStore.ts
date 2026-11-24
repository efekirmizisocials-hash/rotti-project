import { create } from "zustand";

export type ViewType =
  | "dashboard"
  | "plan"
  | "food"
  | "goals"
  | "intelligence"
  | "ideation"
  | "wishlist"
  | "settings"
  | "lifestyle"
  | "connections"
  | "pathways"
  | "projectHub"
  | "people"
  | "finances"
  | "archive"
  | "health"
  | "profile";
export type FilterType = { type: "project" | "tag" | "all"; id: string | null };
export type SortType = "manual" | "dueDate" | "priority";

import { Project, PlannerItem, EnergyLevel } from "../types";

export type UserEnergyLevel = "low" | "medium" | "high" | "peak";

interface UIState {
  isMobileSidebarOpen: boolean;
  activeView: ViewType;
  isComposerOpen: boolean;
  activeFilter: FilterType;
  sortOrder: SortType;
  isProjectModalOpen: boolean;
  isSettingsOpen: boolean;

  // Modals & Overlays
  isDataManagementOpen: boolean;
  isNeuralDumpOpen: boolean;
  showOnboarding: boolean;
  isKeyboardHelpOpen: boolean;

  // Transient Logic State (UI related)
  projectToEdit: Project | null;
  focusedItemId: string | null;
  lastCompletedTask: { item: PlannerItem; points: number } | null;

  // Energy Management
  userEnergyLevel: UserEnergyLevel;
  weekStart: "monday" | "sunday";

  // Sidebar collapse
  isSidebarCollapsed: boolean;

  // Actions
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: ViewType) => void;
  setComposerOpen: (isOpen: boolean) => void;
  setActiveFilter: (filter: FilterType) => void;
  setProjectModalOpen: (isOpen: boolean) => void;
  setDataManagementOpen: (isOpen: boolean) => void;
  setNeuralDumpOpen: (isOpen: boolean) => void;
  setShowOnboarding: (isOpen: boolean) => void;
  setKeyboardHelpOpen: (isOpen: boolean) => void;
  setProjectToEdit: (project: Project | null) => void;
  setFocusedItemId: (id: string | null) => void;
  setLastCompletedTask: (
    task: { item: PlannerItem; points: number } | null,
  ) => void;
  setSortOrder: (order: SortType) => void;
  setUserEnergyLevel: (level: UserEnergyLevel) => void;
  setWeekStart: (start: "monday" | "sunday") => void;
  toggleSidebarCollapsed: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSidebarOpen: false,
  activeView:
    (localStorage.getItem("rotti_active_view") as ViewType) || "dashboard",
  isComposerOpen: false,
  activeFilter: { type: "all", id: null },
  sortOrder: "manual",
  isProjectModalOpen: false,
  isSettingsOpen: false,
  isDataManagementOpen: false,
  isNeuralDumpOpen: false,
  showOnboarding: false,
  isKeyboardHelpOpen: false,
  projectToEdit: null,
  focusedItemId: null,
  lastCompletedTask: null,
  userEnergyLevel: "medium",
  weekStart:
    (localStorage.getItem("rotti_week_start") as "monday" | "sunday") ||
    "monday",
  isSidebarCollapsed:
    localStorage.getItem("rotti_sidebar_collapsed") === "true",

  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
  setActiveView: (view) => {
    localStorage.setItem("rotti_active_view", view);
    set({ activeView: view });
  },
  setComposerOpen: (isOpen) => set({ isComposerOpen: isOpen }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setProjectModalOpen: (isOpen) => set({ isProjectModalOpen: isOpen }),
  setDataManagementOpen: (isOpen) => set({ isDataManagementOpen: isOpen }),
  setNeuralDumpOpen: (isOpen) => set({ isNeuralDumpOpen: isOpen }),
  setShowOnboarding: (isOpen) => set({ showOnboarding: isOpen }),
  setKeyboardHelpOpen: (isOpen) => set({ isKeyboardHelpOpen: isOpen }),
  setProjectToEdit: (project) => set({ projectToEdit: project }),
  setFocusedItemId: (id) => set({ focusedItemId: id }),
  setLastCompletedTask: (task) => set({ lastCompletedTask: task }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setUserEnergyLevel: (level) => set({ userEnergyLevel: level }),
  setWeekStart: (start) => set({ weekStart: start }),
  toggleSidebarCollapsed: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      localStorage.setItem("rotti_sidebar_collapsed", String(next));
      return { isSidebarCollapsed: next };
    }),
}));
