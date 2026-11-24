/**
 * Mock stand-ins for the AI calls of the full app.
 *
 * The real product uses Google Gemini behind a server-side proxy. This
 * showcase never makes a network request and uses no API key: these
 * functions return small canned / rule-based answers so the UI flows
 * (smart add, task breakdown) can still be demonstrated.
 */

import type { PlannerItem, SubTask } from "../types";
import { Priority } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function dayAt(offset: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** Mock "smart add": a few keyword rules instead of a language model. */
export async function parseItemFromPrompt(
  prompt: string,
  _locale: "en" | "tr",
): Promise<(Partial<PlannerItem> & { projectName?: string }) | null> {
  await delay(350);
  const text = prompt.trim();
  if (!text) return null;
  const lower = text.toLowerCase();

  const parsed: Partial<PlannerItem> & { projectName?: string } = {
    title: text,
  };
  if (/\b(tomorrow|yarın)\b/.test(lower)) parsed.dueDate = dayAt(1, 9);
  else if (/\b(today|bugün)\b/.test(lower)) parsed.dueDate = dayAt(0, 17);
  if (/\b(urgent|asap|acil)\b/.test(lower)) parsed.priority = Priority.HIGH;
  return parsed;
}

/** Mock task breakdown: always returns the same three sub-tasks. */
export async function breakdownTask(
  _taskTitle: string,
  locale: "en" | "tr",
): Promise<Omit<SubTask, "id" | "completed">[]> {
  await delay(500);
  if (locale === "tr") {
    return [
      { title: "Adımları planla", estimatedTime: 10 },
      { title: "Ana işi yap", estimatedTime: 30 },
      { title: "Gözden geçir ve bitir", estimatedTime: 10 },
    ];
  }
  return [
    { title: "Plan the steps", estimatedTime: 10 },
    { title: "Do the main work", estimatedTime: 30 },
    { title: "Review and finish", estimatedTime: 10 },
  ];
}
