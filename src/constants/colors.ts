// ─────────────────────────────────────────────────────────────
// Color palettes for light & dark mode
// ─────────────────────────────────────────────────────────────

export interface ThemeColors {
  /** Main background */
  background: string;
  /** Card / surface background */
  card: string;
  /** Secondary surface (input, chips) */
  surface: string;
  /** Primary text */
  text: string;
  /** Muted / secondary text */
  textMuted: string;
  /** Border & dividers */
  border: string;
  /** Brand accent */
  primary: string;
  /** Primary text color on top of primary */
  onPrimary: string;
  /** Positive money (income) */
  income: string;
  /** Negative money (expense) */
  expense: string;
  /** Warning / deletion */
  danger: string;
  /** Tab bar background */
  tabBar: string;
  /** Tab bar inactive icon */
  tabInactive: string;
}

export const LIGHT_COLORS: ThemeColors = {
  background: "#F5F7FA",
  card: "#FFFFFF",
  surface: "#EEF1F6",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  primary: "#4F46E5",
  onPrimary: "#FFFFFF",
  income: "#10B981",
  expense: "#EF4444",
  danger: "#DC2626",
  tabBar: "#FFFFFF",
  tabInactive: "#94A3B8",
};

export const DARK_COLORS: ThemeColors = {
  background: "#0B1220",
  card: "#111A2C",
  surface: "#1A2438",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  border: "#1E293B",
  primary: "#6366F1",
  onPrimary: "#FFFFFF",
  income: "#34D399",
  expense: "#F87171",
  danger: "#F87171",
  tabBar: "#111A2C",
  tabInactive: "#64748B",
};
