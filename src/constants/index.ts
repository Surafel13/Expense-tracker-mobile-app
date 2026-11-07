export * from "./colors";
export * from "./categories";
export * from "./accounts";

export const APP_NAME = "Expense Tracker";

export const STORAGE_KEYS = {
  TRANSACTIONS: "@expense_tracker/transactions",
  ACCOUNTS: "@expense_tracker/accounts",
  THEME: "@expense_tracker/theme",
  LANGUAGE: "@expense_tracker/language",
  MIGRATION_V2: "@expense_tracker/migration_v2",
} as const;

export const CURRENCY = "USD";
