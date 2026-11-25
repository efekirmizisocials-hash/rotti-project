import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WidgetId =
  | "energy"
  | "focus"
  | "quickAdd"
  | "tasks"
  | "habits"
  | "finance"
  | "upcoming"
  | "urgent"
  | "miniCalendar"
  | "productivityScore"
  | "dailyReview";

export type WidgetSize = "compact" | "full";

interface WidgetSettings {
  visible: boolean;
  size: WidgetSize;
}

interface DashboardState {
  widgetSettings: Record<WidgetId, WidgetSettings>;
  widgetOrder: WidgetId[];

  // Actions
  toggleWidgetVisibility: (widgetId: WidgetId) => void;
  setWidgetSize: (widgetId: WidgetId, size: WidgetSize) => void;
  resetToDefaults: () => void;
  isWidgetVisible: (widgetId: WidgetId) => boolean;
  getWidgetSize: (widgetId: WidgetId) => WidgetSize;
  reorderWidgets: (newOrder: WidgetId[]) => void;
}

const defaultSettings: Record<WidgetId, WidgetSettings> = {
  energy: { visible: true, size: "full" },
  focus: { visible: true, size: "full" },
  quickAdd: { visible: true, size: "full" },
  tasks: { visible: true, size: "full" },
  habits: { visible: true, size: "full" },
  finance: { visible: true, size: "full" },
  upcoming: { visible: true, size: "full" },
  urgent: { visible: true, size: "full" },
  miniCalendar: { visible: true, size: "full" },
  productivityScore: { visible: true, size: "full" },
  dailyReview: { visible: true, size: "full" },
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgetSettings: defaultSettings,
      widgetOrder: [
        "tasks",
        "habits",
        "finance",
        "upcoming",
        "miniCalendar",
        "productivityScore",
      ] as WidgetId[],

      toggleWidgetVisibility: (widgetId) =>
        set((state) => ({
          widgetSettings: {
            ...state.widgetSettings,
            [widgetId]: {
              ...state.widgetSettings[widgetId],
              visible: !state.widgetSettings[widgetId].visible,
            },
          },
        })),

      setWidgetSize: (widgetId, size) =>
        set((state) => ({
          widgetSettings: {
            ...state.widgetSettings,
            [widgetId]: {
              ...state.widgetSettings[widgetId],
              size,
            },
          },
        })),

      resetToDefaults: () =>
        set({
          widgetSettings: defaultSettings,
        }),

      isWidgetVisible: (widgetId) =>
        get().widgetSettings[widgetId]?.visible ?? true,

      getWidgetSize: (widgetId) =>
        get().widgetSettings[widgetId]?.size ?? "full",

      reorderWidgets: (newOrder) => set({ widgetOrder: newOrder }),
    }),
    {
      name: "dashboard-settings",
    },
  ),
);
