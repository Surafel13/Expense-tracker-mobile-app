// ─────────────────────────────────────────────────────────────
// Category definitions with icons (Ionicons) and colors
// ─────────────────────────────────────────────────────────────

import type { Category, CategoryId } from "@app-types/index";

export const CATEGORIES: Record<CategoryId, Category> = {
  // ── Expense categories ───────────────────────────────────
  food: {
    id: "food",
    label: "Food",
    icon: "restaurant-outline",
    color: "#F59E0B",
    type: "expense",
  },
  transport: {
    id: "transport",
    label: "Transport",
    icon: "car-outline",
    color: "#3B82F6",
    type: "expense",
  },
  shopping: {
    id: "shopping",
    label: "Shopping",
    icon: "bag-handle-outline",
    color: "#EC4899",
    type: "expense",
  },
  education: {
    id: "education",
    label: "Education",
    icon: "school-outline",
    color: "#8B5CF6",
    type: "expense",
  },
  health: {
    id: "health",
    label: "Health",
    icon: "medkit-outline",
    color: "#EF4444",
    type: "expense",
  },
  entertainment: {
    id: "entertainment",
    label: "Entertainment",
    icon: "game-controller-outline",
    color: "#06B6D4",
    type: "expense",
  },
  bills: {
    id: "bills",
    label: "Bills",
    icon: "receipt-outline",
    color: "#F97316",
    type: "expense",
  },

  // ── Income categories ────────────────────────────────────
  salary: {
    id: "salary",
    label: "Salary",
    icon: "cash-outline",
    color: "#10B981",
    type: "income",
  },
  freelance: {
    id: "freelance",
    label: "Freelance",
    icon: "laptop-outline",
    color: "#22C55E",
    type: "income",
  },
  gift: {
    id: "gift",
    label: "Gift",
    icon: "gift-outline",
    color: "#14B8A6",
    type: "income",
  },

  // ── Shared ───────────────────────────────────────────────
  other: {
    id: "other",
    label: "Other",
    icon: "ellipsis-horizontal-circle-outline",
    color: "#64748B",
    type: "expense",
  },
};

/** Convenience arrays */
export const EXPENSE_CATEGORIES: Category[] = Object.values(CATEGORIES).filter(
  (c) => c.type === "expense",
);

export const INCOME_CATEGORIES: Category[] = Object.values(CATEGORIES).filter(
  (c) => c.type === "income",
);

/** Helper to safely look up a category (falls back to "Other") */
export const getCategory = (id: CategoryId): Category =>
  CATEGORIES[id] ?? CATEGORIES.other;
