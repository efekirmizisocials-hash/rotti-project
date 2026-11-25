/**
 * Fictional finance demo data (amounts, merchants and subscription names
 * are all made up). Dates are relative to today so charts always have
 * recent history.
 */

import {
  Budget,
  FinanceAccount,
  FinanceCategory as C,
  Subscription,
  Transaction,
  TransactionType,
} from "../types";

export const DEMO_USER_ID = "demo-user";

const CURRENCY = "USD";

/** ISO date for `monthsAgo` months back, on `day` (clamped so it is never in the future). */
function dateIn(monthsAgo: number, day: number): string {
  const now = new Date();
  const d = new Date(
    now.getFullYear(),
    now.getMonth() - monthsAgo,
    1,
    12,
    0,
    0,
  );
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let target = Math.min(day, lastDay);
  if (monthsAgo === 0) target = Math.min(target, now.getDate());
  d.setDate(target);
  return d.toISOString();
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function buildSeedAccounts(): FinanceAccount[] {
  const created = daysFromNow(-120);
  return [
    {
      id: "seed-acc-checking",
      userId: DEMO_USER_ID,
      name: "Everyday Checking",
      type: "bank",
      balance: 4820.5,
      currency: CURRENCY,
      color: "#3b82f6",
      isDefault: true,
      createdAt: created,
    },
    {
      id: "seed-acc-savings",
      userId: DEMO_USER_ID,
      name: "Rainy Day Savings",
      type: "savings",
      balance: 12400,
      currency: CURRENCY,
      color: "#22c55e",
      createdAt: created,
    },
    {
      id: "seed-acc-cash",
      userId: DEMO_USER_ID,
      name: "Cash Wallet",
      type: "cash",
      balance: 180,
      currency: CURRENCY,
      color: "#f59e0b",
      createdAt: created,
    },
  ];
}

type Row = [
  monthsAgo: number,
  day: number,
  type: TransactionType,
  category: C,
  amount: number,
  description: string,
];

// Older months (4-11): a little varied everyday spending so the trend chart has shape.
const OLDER: Row[] = Array.from({ length: 8 }, (_, i) => i + 4).flatMap(
  (m): Row[] => [
    [m, 8, "expense", C.FOOD, 180 + ((m * 37) % 70), "Groceries"],
    [m, 17, "expense", C.SHOPPING, 40 + ((m * 53) % 90), "Household items"],
    ...(m % 3 === 0
      ? ([[m, 21, "income", C.FREELANCE, 150 + ((m * 29) % 200), "Freelance gig"]] as Row[])
      : []),
  ],
);

// One row per transaction: [monthsAgo, day, type, category, amount, description]
const ROWS: Row[] = [
  ...OLDER,
  // ---- Recurring monthly (this month and the three before) ----
  ...Array.from({ length: 12 }, (_, m) => m).flatMap((m): Row[] => [
    [m, 1, "income", C.SALARY, 3200, "Monthly salary"],
    [m, 3, "expense", C.RENT, 1100, "Apartment rent"],
    [m, 5, "expense", C.UTILITIES, 74.2, "Electricity and water"],
    [m, 7, "expense", C.PHONE_BILL, 29.99, "Mobile plan"],
    [m, 9, "expense", C.SUBSCRIPTIONS, 12.99, "Video Streaming"],
    [m, 9, "expense", C.SUBSCRIPTIONS, 29, "Gym Membership"],
  ]),
  // ---- Everyday spending: this month ----
  [0, 2, "expense", C.FOOD, 64.8, "Weekly groceries"],
  [0, 6, "expense", C.FOOD, 18.5, "Lunch at the corner café"],
  [0, 8, "expense", C.TRANSPORT, 42, "Monthly transit pass"],
  [0, 11, "expense", C.FOOD, 71.35, "Weekly groceries"],
  [0, 13, "expense", C.ENTERTAINMENT, 24, "Cinema night"],
  [0, 15, "expense", C.SHOPPING, 89.9, "Running shoes"],
  [0, 17, "income", C.FREELANCE, 450, "Freelance design project"],
  [0, 19, "expense", C.FOOD, 58.2, "Weekly groceries"],
  [0, 21, "expense", C.HEALTH, 35, "Pharmacy"],
  // ---- Everyday spending: previous months ----
  [1, 4, "expense", C.FOOD, 212.4, "Groceries"],
  [1, 10, "expense", C.TRANSPORT, 42, "Monthly transit pass"],
  [1, 14, "expense", C.ENTERTAINMENT, 56, "Concert tickets"],
  [1, 18, "income", C.FREELANCE, 300, "Freelance side project"],
  [1, 22, "expense", C.SHOPPING, 134.5, "Home supplies"],
  [2, 5, "expense", C.FOOD, 198.7, "Groceries"],
  [2, 12, "expense", C.EDUCATION, 79, "Online course"],
  [2, 16, "expense", C.TRANSPORT, 42, "Monthly transit pass"],
  [2, 24, "expense", C.TRAVEL, 260, "Weekend train trip"],
  [3, 6, "expense", C.FOOD, 224.1, "Groceries"],
  [3, 15, "income", C.INVESTMENTS, 85, "Dividend payout"],
  [3, 20, "expense", C.SHOPPING, 61.2, "Books"],
];

export function buildSeedTransactions(): Transaction[] {
  return ROWS.map(
    ([monthsAgo, day, type, category, amount, description], i) => ({
      id: `seed-tx-${i}`,
      userId: DEMO_USER_ID,
      type,
      amount,
      currency: CURRENCY,
      category,
      description,
      date: dateIn(monthsAgo, day),
      accountId: "seed-acc-checking",
      isRecurring: description === "Monthly salary" || undefined,
      recurringFrequency:
        description === "Monthly salary" ? ("monthly" as const) : undefined,
      createdAt: dateIn(monthsAgo, day),
    }),
  ).sort((a, b) => b.date.localeCompare(a.date));
}

export function buildSeedBudgets(): Budget[] {
  const now = new Date().toISOString();
  const mk = (category: C, amount: number): Budget => ({
    id: `seed-budget-${category}`,
    userId: DEMO_USER_ID,
    category,
    amount,
    period: "monthly",
    createdAt: now,
    updatedAt: now,
  });
  return [
    mk(C.FOOD, 350),
    mk(C.ENTERTAINMENT, 100),
    mk(C.TRANSPORT, 60),
    mk(C.SHOPPING, 150),
  ];
}

export function buildSeedSubscriptions(): Subscription[] {
  const created = daysFromNow(-90);
  const mk = (
    id: string,
    name: string,
    amount: number,
    billingCycle: Subscription["billingCycle"],
    nextInDays: number,
    category: string,
    icon: string,
  ): Subscription => ({
    id: `seed-sub-${id}`,
    userId: DEMO_USER_ID,
    name,
    amount,
    currency: CURRENCY,
    billingCycle,
    nextBillingDate: daysFromNow(nextInDays),
    category,
    status: "active",
    icon,
    createdAt: created,
    updatedAt: created,
  });
  return [
    mk("streamly", "Video Streaming", 12.99, "monthly", 5, "entertainment", "🎬"),
    mk("fitpass", "Gym Membership", 29, "monthly", 9, "health", "🏋️"),
    mk("cloudbox", "Cloud Storage", 2.99, "monthly", 14, "utilities", "☁️"),
    mk("newsdaily", "Daily News", 99, "yearly", 60, "education", "📰"),
  ];
}
