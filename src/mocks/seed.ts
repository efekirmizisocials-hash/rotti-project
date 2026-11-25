/**
 * Demo seed data. All people, places and titles are fictional.
 * Dates are relative to "now" so the planner always looks populated.
 */

import {
  Category,
  EnergyLevel,
  ItemType,
  PlannerItem,
  Priority,
  Project,
  TagType,
} from "../types";

/** The single fake user of the showcase. */
export const DEMO_USER = { id: "demo-user", name: "Demo User" } as const;

/** ISO string for today (+ dayOffset) at the given local time. */
function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const std = (label: string) => ({ label, type: TagType.STANDARD });

/** Demo focus stats so the dashboard header is not all zeros. */
export function buildSeedUserStats() {
  return {
    totalFocusPoints: 240,
    dailyFocusStreak: 5,
    lastFocusSessionDate: at(-1, 18),
  };
}

export function buildSeedProjects(): Project[] {
  return [
    { id: "proj-website", name: "Website Launch", color: "#FF6B6B" },
    { id: "proj-home", name: "Home Refresh", color: "#4ECDC4" },
  ];
}

export function buildSeedItems(): PlannerItem[] {
  const created = at(-3, 9);
  return [
    // ---------- Tasks ----------
    {
      id: "seed-task-report",
      type: ItemType.TASK,
      title: "Draft the quarterly report",
      creationDate: created,
      category: Category.WORK,
      priority: Priority.HIGH,
      tags: [std("deep-work")],
      projectId: "proj-website",
      order: 0,
      energyLevel: EnergyLevel.HIGH,
      dueDate: at(0, 17),
      startDate: at(0, 14),
      completed: false,
      estimatedMinutes: 90,
      subTasks: [
        {
          id: "seed-sub-1",
          title: "Collect the numbers",
          completed: true,
          estimatedTime: 20,
        },
        {
          id: "seed-sub-2",
          title: "Write the summary",
          completed: false,
          estimatedTime: 40,
        },
        {
          id: "seed-sub-3",
          title: "Add charts",
          completed: false,
          estimatedTime: 30,
        },
      ],
    },
    {
      id: "seed-task-groceries",
      type: ItemType.TASK,
      title: "Buy groceries for the week",
      creationDate: created,
      category: Category.HOME,
      priority: Priority.MEDIUM,
      tags: [std("errands")],
      projectId: "proj-home",
      order: 1,
      energyLevel: EnergyLevel.LOW,
      dueDate: at(0, 18, 30),
      completed: false,
      estimatedMinutes: 45,
    },
    {
      id: "seed-task-review",
      type: ItemType.TASK,
      title: "Review the landing page copy",
      creationDate: created,
      category: Category.WORK,
      priority: Priority.MEDIUM,
      tags: [std("review")],
      projectId: "proj-website",
      order: 2,
      energyLevel: EnergyLevel.MEDIUM,
      startDate: at(-1, 16),
      dueDate: at(1, 11),
      completed: false,
      estimatedMinutes: 30,
    },
    {
      id: "seed-task-dentist",
      type: ItemType.TASK,
      title: "Book a dentist appointment",
      creationDate: created,
      category: Category.PERSONAL,
      priority: Priority.LOW,
      tags: [],
      projectId: null,
      order: 3,
      energyLevel: EnergyLevel.LOW,
      dueDate: at(-1, 12),
      completed: true,
      completedDate: at(-1, 9, 40),
      estimatedMinutes: 10,
    },

    // ---------- Habits ----------
    {
      id: "seed-habit-stretch",
      type: ItemType.HABIT,
      title: "Morning stretch",
      creationDate: created,
      category: Category.FITNESS,
      priority: Priority.MEDIUM,
      tags: [std("health")],
      projectId: null,
      order: 4,
      frequency: "daily",
      streak: 6,
      lastCompletedDate: at(-1, 7),
      completed: false,
      estimatedMinutes: 10,
    },
    {
      id: "seed-habit-language",
      type: ItemType.HABIT,
      title: "Practice a language for 15 minutes",
      creationDate: created,
      category: Category.LEARNING,
      priority: Priority.LOW,
      tags: [],
      projectId: null,
      order: 5,
      frequency: "daily",
      streak: 12,
      lastCompletedDate: at(-1, 20),
      completed: false,
      estimatedMinutes: 15,
    },

    // ---------- Events ----------
    {
      id: "seed-event-standup",
      type: ItemType.EVENT,
      title: "Team stand-up",
      creationDate: created,
      category: Category.WORK,
      priority: Priority.MEDIUM,
      tags: [],
      projectId: "proj-website",
      order: 6,
      startDate: at(0, 9, 30),
      endDate: at(0, 10),
    },
    {
      id: "seed-event-lunch",
      type: ItemType.EVENT,
      title: "Lunch with a friend",
      creationDate: created,
      category: Category.PERSONAL,
      priority: Priority.LOW,
      tags: [],
      projectId: null,
      order: 7,
      startDate: at(0, 12, 30),
      endDate: at(0, 13, 30),
      location: "Neighborhood café",
    },
    {
      id: "seed-event-yoga",
      type: ItemType.EVENT,
      title: "Yoga class",
      creationDate: created,
      category: Category.FITNESS,
      priority: Priority.MEDIUM,
      tags: [std("health")],
      projectId: null,
      order: 8,
      startDate: at(1, 18),
      endDate: at(1, 19),
    },
    {
      id: "seed-event-workshop",
      type: ItemType.EVENT,
      title: "Planning workshop",
      creationDate: created,
      category: Category.WORK,
      priority: Priority.HIGH,
      tags: [std("planning")],
      projectId: "proj-website",
      order: 9,
      startDate: at(3, 14),
      endDate: at(3, 16),
    },
  ];
}
