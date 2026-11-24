import { create } from "zustand";
import { PlannerItem } from "../types";

type SetItemsArg = PlannerItem[] | ((prev: PlannerItem[]) => PlannerItem[]);

interface PlannerItemsState {
  items: PlannerItem[];
  loading: boolean;
  error: string | null;
  setItems: (itemsOrUpdater: SetItemsArg) => void;
  updateItem: (id: string, updates: Partial<PlannerItem>) => void;
  addItem: (item: PlannerItem) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlannerItemsStore = create<PlannerItemsState>((set, get) => ({
  items: [],
  loading: true,
  error: null,
  setItems: (itemsOrUpdater) => {
    if (typeof itemsOrUpdater === "function") {
      set({ items: itemsOrUpdater(get().items) });
    } else {
      set({ items: itemsOrUpdater });
    }
  },
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    })),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
