// ─────────────────────────────────────────────────────────────
// Barrel export for constants
// ─────────────────────────────────────────────────────────────

export * from "./colors";
export * from "./categories";

/** App-wide constants */
export const APP_NAME = "Expense Tracker";

/** AsyncStorage keys — keep namespaced to avoid clashes */
export const STORAGE_KEYS = {
  TRANSACTIONS: "@expense_tracker/transactions",
  THEME: "@expense_tracker/theme",
} as const;

/** Default currency symbol */
export const CURRENCY = "USD";
