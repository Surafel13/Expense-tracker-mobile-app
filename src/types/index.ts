// ─────────────────────────────────────────────────────────────
// Core domain types for the Expense Tracker app
// ─────────────────────────────────────────────────────────────

/** A transaction can either be income (money in) or expense (money out) */
export type TransactionType = "income" | "expense";

/** Category identifier — must match a key in `CATEGORIES` constant */
export type CategoryId =
  | "food"
  | "transport"
  | "shopping"
  | "education"
  | "health"
  | "entertainment"
  | "bills"
  | "salary"
  | "freelance"
  | "gift"
  | "other";

/** A single transaction record */
export interface Transaction {
  /** Unique identifier (generated with `generateId()`) */
  id: string;
  /** Income or expense */
  type: TransactionType;
  /** Positive amount (sign is derived from `type`) */
  amount: number;
  /** Category key */
  category: CategoryId;
  /** Optional short note */
  note?: string;
  /** ISO date string (e.g. "2025-01-15T10:30:00.000Z") */
  date: string;
  /** ISO timestamp of creation — used for stable sorting */
  createdAt: string;
}

/** UI-friendly category descriptor */
export interface Category {
  id: CategoryId;
  label: string;
  /** Ionicons name from `@expo/vector-icons` */
  icon: string;
  /** Hex color for the category badge */
  color: string;
  /** Which transaction type this category belongs to */
  type: TransactionType;
}

/** Aggregated totals used on the Dashboard */
export interface Summary {
  balance: number;
  income: number;
  expense: number;
}

/** Data point for the monthly bar chart */
export interface MonthlyData {
  /** Short month label, e.g. "Jan" */
  month: string;
  /** Full year-month key, e.g. "2025-01" */
  key: string;
  income: number;
  expense: number;
}

/** Payload for creating / updating a transaction (id & createdAt handled internally) */
export type TransactionInput = Omit<Transaction, "id" | "createdAt">;
