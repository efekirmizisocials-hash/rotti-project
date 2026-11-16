/**
 * brainDumpTransformer.ts
 *
 * Pure transformation layer between AI-extracted brain dump items and
 * the canonical PlannerItem shape stored in Supabase.
 *
 * Conventions:
 *  - All functions are pure (no side effects, no I/O)
 *  - Enum values are validated and defaulted — invalid AI output never
 *    reaches the database
 *  - People names are normalised to lowercase
 *  - The `awaiting:field` tag convention signals items pending user input
 */

import { Category, ItemType, Priority, Tag, TagType } from "../types";
import type { PlannerItem } from "../types";
import type { ExtractedItem } from "../types/ai";

// ==========================================
// VALIDATION HELPERS
// ==========================================

const VALID_ITEM_TYPES = new Set(Object.values(ItemType));
const VALID_CATEGORIES = new Set(Object.values(Category));
const VALID_PRIORITIES = new Set(Object.values(Priority));

/** Returns the value if it is a valid ItemType, otherwise falls back to Task. */
function validateItemType(raw: string): ItemType {
  if (VALID_ITEM_TYPES.has(raw as ItemType)) return raw as ItemType;
  return ItemType.TASK;
}

/** Returns the value if it is a valid Category, otherwise falls back to None. */
function validateCategory(raw: string): Category {
  if (VALID_CATEGORIES.has(raw as Category)) return raw as Category;
  return Category.NONE;
}

/** Returns the value if it is a valid Priority, otherwise falls back to Medium. */
function validatePriority(raw: string): Priority {
  if (VALID_PRIORITIES.has(raw as Priority)) return raw as Priority;
  return Priority.MEDIUM;
}

/**
 * Validates an ISO 8601 date string.
 * Returns the string if valid, null otherwise.
 */
function validateISODate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return raw;
}

/**
 * Clamps confidence to [0, 1].
 * Returns 1.0 for any non-numeric input (trust by default when Gemini omits it).
 */
function validateConfidence(raw: number | undefined | null): number {
  if (typeof raw !== "number" || isNaN(raw)) return 1.0;
  return Math.min(1, Math.max(0, raw));
}

/** Returns estimatedMinutes only when it is a positive integer. */
function validateEstimatedMinutes(
  raw: number | null | undefined,
): number | null {
  if (typeof raw !== "number" || isNaN(raw) || raw <= 0) return null;
  return Math.round(raw);
}

// ==========================================
// TAG HELPERS
// ==========================================

/**
 * Builds Tag objects from the raw string tags returned by Gemini.
 * Recognises the conventions:
 *   "@name"  → TagType.PERSON
 *   "#label" → TagType.CONTEXT
 *   everything else → TagType.STANDARD
 */
function buildTagsFromStrings(rawTags: string[]): Tag[] {
  return rawTags.map((label) => {
    if (label.startsWith("@")) return { label, type: TagType.PERSON };
    if (label.startsWith("#")) return { label, type: TagType.CONTEXT };
    return { label, type: TagType.STANDARD };
  });
}

/**
 * Converts an array of people names (raw casing) into "@person" person tags,
 * normalising to lowercase.
 */
function buildPeopleTags(people: string[]): Tag[] {
  return people
    .filter((name) => typeof name === "string" && name.trim().length > 0)
    .map((name) => ({
      label: `@${name.trim().toLowerCase()}`,
      type: TagType.PERSON,
    }));
}

/**
 * Generates "awaiting:field" context tags for each field name that
 * Gemini flagged as missing or ambiguous.
 * These signal the review UI that the item still needs user input.
 */
function buildAwaitingTags(missingFields: string[]): Tag[] {
  return missingFields.map((field) => ({
    label: `awaiting:${field}`,
    type: TagType.CONTEXT,
  }));
}

/**
 * Merges tag arrays, deduplicating on label (case-sensitive).
 * Order: standard tags → people tags → awaiting tags
 */
function mergeTags(...groups: Tag[][]): Tag[] {
  const seen = new Set<string>();
  const result: Tag[] = [];
  for (const group of groups) {
    for (const tag of group) {
      if (!seen.has(tag.label)) {
        seen.add(tag.label);
        result.push(tag);
      }
    }
  }
  return result;
}

// ==========================================
// MAIN TRANSFORMER
// ==========================================

/**
 * Transforms a single ExtractedItem (AI output) into a PlannerItem shape
 * ready for database insertion.
 *
 * Rules applied here (not delegated to Gemini):
 *  1. Enum validation with safe defaults
 *  2. ISO date validation
 *  3. People name normalisation to lowercase
 *  4. `awaiting:field` tag injection for items with needsUserInput
 *  5. Deduplication of tags
 *  6. order is set to 0 (sorted by the view layer)
 *  7. creationDate is set to now (the moment of insertion)
 */
export function transformExtractedItemToPlannerItem(
  item: ExtractedItem,
  userId: string,
): Omit<PlannerItem, "id"> {
  // --- Validate enums ---
  const itemType = validateItemType(item.type ?? "");
  const category = validateCategory(item.category ?? "");
  const priority = validatePriority(item.priority ?? "");

  // --- Validate dates ---
  const dueDate = validateISODate(item.dueDate);
  const startDate = validateISODate(item.startDate);
  const endDate = validateISODate(item.endDate);

  // --- Validate numeric fields ---
  const confidence = validateConfidence(item.confidence);
  const estimatedMinutes = validateEstimatedMinutes(item.estimatedMinutes);

  // --- Build tags ---
  const rawTags = Array.isArray(item.tags) ? item.tags : [];
  const people = Array.isArray(item.people) ? item.people : [];
  const missingFields = Array.isArray(item.missingFields)
    ? item.missingFields
    : [];

  const standardTags = buildTagsFromStrings(
    // Filter out person-formatted tags from raw list; those come from `people`
    rawTags.filter((t) => !t.startsWith("@")),
  );
  const peopleTags = buildPeopleTags(people);

  // Inject awaiting tags only when Gemini flagged the item as needing input
  const awaitingTags =
    item.needsUserInput === true ? buildAwaitingTags(missingFields) : [];

  const tags = mergeTags(standardTags, peopleTags, awaitingTags);

  // --- Build the PlannerItem (no id, no db-generated fields) ---
  const plannerItem: Omit<PlannerItem, "id"> = {
    // Core fields
    type: itemType,
    title: (item.title ?? "").trim() || "Untitled",
    creationDate: new Date().toISOString(),
    category,
    priority,
    tags,
    projectId: null,
    order: 0,

    // Task-specific
    ...(itemType === ItemType.TASK && {
      dueDate: dueDate ?? null,
      completed: false,
      estimatedMinutes,
    }),

    // Habit-specific
    ...(itemType === ItemType.HABIT && {
      frequency: "daily" as const,
      streak: 0,
      lastCompletedDate: null,
    }),

    // Event-specific
    ...(itemType === ItemType.EVENT && {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
      estimatedMinutes,
    }),

    // Note-specific
    ...(itemType === ItemType.NOTE && {
      content: item.content ?? undefined,
    }),

    // People and location (apply to all types)
    ...(people.length > 0 && {
      assignedPeople: people.map((name) => name.trim().toLowerCase()),
    }),
    ...(item.location != null && {
      location: item.location,
    }),

    // Low-confidence items get requiresFocus=false; UI can flag them separately
    // confidence < 0.5 means the item came through with an Ambiguity record
    requiresFocus: confidence >= 0.7 ? undefined : false,
  };

  return plannerItem;
}

// ==========================================
// BATCH TRANSFORMER
// ==========================================

/**
 * Convenience wrapper that transforms an array of ExtractedItems in one call.
 * Returns items in the same order as the input array.
 */
export function transformExtractedItemsToPlannerItems(
  items: ExtractedItem[],
  userId: string,
): Omit<PlannerItem, "id">[] {
  return items.map((item) => transformExtractedItemToPlannerItem(item, userId));
}
