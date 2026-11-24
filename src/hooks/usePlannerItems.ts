/**
 * usePlannerItems (showcase build)
 *
 * Same public API as the full app's hook, but backed by localStorage
 * instead of a remote database. No realtime, no auth: data belongs to a
 * single fake demo user and lives only in this browser.
 */

import { useCallback } from "react";
import { PlannerItem } from "../types";
import { usePlannerItemsStore } from "../store/plannerItemsStore";
import { newId, readCollection, writeCollection } from "../mocks/localDb";
import { buildSeedItems } from "../mocks/seed";

const STORAGE_KEY = "items";

interface UsePlannerItemsReturn {
  items: PlannerItem[];
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<PlannerItem, "id">) => Promise<PlannerItem>;
  addItems: (items: Omit<PlannerItem, "id">[]) => Promise<PlannerItem[]>;
  updateItem: (
    id: string,
    updates: Partial<PlannerItem>,
  ) => Promise<PlannerItem>;
  deleteItem: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

function load(): PlannerItem[] {
  const stored = readCollection<PlannerItem[]>(STORAGE_KEY);
  if (stored) return stored;
  const seeded = buildSeedItems();
  writeCollection(STORAGE_KEY, seeded);
  return seeded;
}

// Hydrate once at module load, then persist every change.
usePlannerItemsStore.setState({ items: load(), loading: false, error: null });
usePlannerItemsStore.subscribe((state, prev) => {
  if (state.items !== prev.items) writeCollection(STORAGE_KEY, state.items);
});

/** Restores the original seed data (used by the "Reset demo" button). */
export function resetPlannerItems(): void {
  usePlannerItemsStore.setState({ items: buildSeedItems() });
}

export function usePlannerItems(): UsePlannerItemsReturn {
  const items = usePlannerItemsStore((s) => s.items);
  const loading = usePlannerItemsStore((s) => s.loading);
  const error = usePlannerItemsStore((s) => s.error);
  const setItems = usePlannerItemsStore((s) => s.setItems);

  const addItem = useCallback(
    async (item: Omit<PlannerItem, "id">): Promise<PlannerItem> => {
      const created: PlannerItem = {
        ...item,
        id: newId(),
        order: item.order ?? usePlannerItemsStore.getState().items.length,
      };
      setItems((prev) => [...prev, created]);
      return created;
    },
    [setItems],
  );

  const addItems = useCallback(
    async (batch: Omit<PlannerItem, "id">[]): Promise<PlannerItem[]> => {
      const created = batch.map((item) => ({ ...item, id: newId() }));
      setItems((prev) => [...prev, ...created]);
      return created;
    },
    [setItems],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<PlannerItem>): Promise<PlannerItem> => {
      let updated: PlannerItem | undefined;
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          updated = { ...item, ...updates };
          return updated;
        }),
      );
      if (!updated) throw new Error(`Item not found: ${id}`);
      return updated;
    },
    [setItems],
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const refetch = useCallback(async () => {
    setItems(load());
  }, [setItems]);

  return {
    items,
    loading,
    error,
    addItem,
    addItems,
    updateItem,
    deleteItem,
    refetch,
  };
}

export default usePlannerItems;
