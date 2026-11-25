export enum ItemType {
  TASK = "Task",
  HABIT = "Habit",
  EVENT = "Event",
  GOAL = "Goal",
  ROUTINE = "Routine",
  NOTE = "Note",
}

export enum EnergyLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  PEAK = "Peak",
}

export enum EffortSize {
  SMALL = "Small",
  MEDIUM = "Medium",
  LARGE = "Large",
}

export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum Category {
  WORK = "Work",
  PERSONAL = "Personal",
  FITNESS = "Fitness",
  LEARNING = "Learning",
  HOME = "Home",
  NONE = "None",
}

export enum TagType {
  STANDARD = "standard",
  PERSON = "person",
  CONTEXT = "context",
  ENERGY = "energy",
}

export interface Tag {
  label: string;
  type: TagType;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime: number | null; // Estimated time in minutes
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export type Feeling = "in_zone" | "confused" | "stuck";

export interface EmotionalLogEntry {
  timestamp: string; // ISO string
  feeling: Feeling;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly";
  interval: number;
  daysOfWeek?: number[]; // For weekly recurrence, 0 = Sunday, 6 = Saturday
}

// ============================================
// WORKOUT & FITNESS TYPES
// ============================================

export interface WorkoutSet {
  id?: string;
  reps: number;
  weight_kg?: number;
  duration_seconds?: number;
  completed: boolean;
}

export interface WorkoutExerciseData {
  exercise_name: string;
  muscle_group: string;
  equipment?: string;
  sets: WorkoutSet[];
  duration_seconds?: number;
  distance_km?: number;
  notes?: string;
}

export interface WorkoutData {
  workout_type: "strength" | "cardio" | "flexibility" | "sports" | "mixed";
  exercises: WorkoutExerciseData[];
  duration_minutes?: number;
  calories_burned?: number;
  rating?: number; // 1-5 stars
  completed: boolean;
  notes?: string;
}

export interface PlannerItem {
  id: string;
  type: ItemType;
  title: string;
  creationDate: string; // Storing as ISO string
  category: Category;
  priority: Priority;
  tags: Tag[];
  projectId: string | null;
  order: number;
  focusPoints?: number; // Points awarded for completing focus sessions on this task
  requiresFocus?: boolean; // Whether this task requires a focus session (auto-suggested by category, can override)
  emotionalLog?: EmotionalLogEntry[];
  energyLevel?: EnergyLevel; // Required energy level for this item
  effortSize?: EffortSize; // Estimated effort size (S/M/L)

  // Task-specific fields
  dueDate?: string | null;
  completed?: boolean;
  completedDate?: string; // ISO string when task was completed
  subTasks?: SubTask[];
  reminderOffset?: number | null;
  reminderSent?: boolean;
  dependencies?: string[];
  estimatedMinutes?: number | null;
  recurrenceRule?: RecurrenceRule | null;

  // Habit-specific fields
  frequency?: "daily" | "weekly" | null;
  streak?: number;
  lastCompletedDate?: string | null;

  // Event-specific fields
  startDate?: string;
  endDate?: string;

  // Note/Goal-specific fields
  content?: string; // For notes - rich text content
  description?: string; // For goals - detailed description
  targetDate?: string; // For goals - target completion date

  // People assignment
  assignedPeople?: string[]; // Names of people assigned to this item
  location?: string; // Location of the item

  // Workout-specific fields (for EVENT type workouts)
  workout_data?: WorkoutData;
}

export interface ItemHandlers {
  handleToggleComplete: (itemId: string) => void;
  handleLogHabit: (itemId: string) => void;
  handleDeleteItem: (itemId: string) => void;
  handleAddSubTasks: (
    itemId: string,
    subTasks: Omit<SubTask, "id" | "completed">[],
  ) => void;
  handleToggleSubTaskComplete: (itemId: string, subTaskId: string) => void;
  handleSetSubTaskTime: (
    itemId: string,
    subTaskId: string,
    time: number | null,
  ) => void;
  handleUpdateItem: (itemId: string, updates: Partial<PlannerItem>) => void;
  handleAddItemTag: (itemId: string, tagString: string) => void;
  handleRemoveItemTag: (itemId: string, tagLabel: string) => void;
  handleAddDependency: (itemId: string, dependencyId: string) => void;
  handleRemoveDependency: (itemId: string, dependencyId: string) => void;
  handleSetItemProject: (itemId: string, projectId: string | null) => void;
  handleAddSingleSubTask: (itemId: string, subTaskTitle: string) => void;
  handleStartFocus: (itemId: string) => void;
  handleAddEmotionalLog: (itemId: string, feeling: Feeling) => void;
  handleUpdateItemDate?: (itemId: string, newDate: string | null) => void;
  handleAddItem: (
    itemData: Omit<PlannerItem, "id" | "order"> & {
      projectName?: string | null;
    },
  ) => void;
}

// ==================== FINANCES ====================

export enum FinanceCategory {
  // Expenses
  HOUSING = "housing",
  FOOD = "food",
  TRANSPORT = "transport",
  ENTERTAINMENT = "entertainment",
  UTILITIES = "utilities",
  SHOPPING = "shopping",
  HEALTH = "health",
  EDUCATION = "education",
  TRAVEL = "travel",
  SUBSCRIPTIONS = "subscriptions",
  RENT = "rent",
  PHONE_BILL = "phone_bill",
  OTHER_EXPENSE = "other_expense",
  // Income
  SALARY = "salary",
  FREELANCE = "freelance",
  INVESTMENTS = "investments",
  GIFTS = "gifts",
  OTHER_INCOME = "other_income",
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  category: FinanceCategory;
  description: string;
  date: string;
  accountId?: string;
  isRecurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type AccountType = "cash" | "bank" | "credit" | "savings" | "investment";

export interface FinanceAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: FinanceCategory;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly" | "weekly";
  nextBillingDate: string;
  category?: string;
  status: "active" | "cancelled";
  icon?: string;
  description?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}