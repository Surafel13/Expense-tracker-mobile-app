// ─────────────────────────────────────────────────────────────
// App-wide theme provider (light / dark / system)
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { DARK_COLORS, LIGHT_COLORS, type ThemeColors } from "@constants/colors";
import { getThemeMode, setThemeMode, type ThemeMode } from "@storage/settings";

interface ThemeContextValue {
  /** Raw user preference: 'light' | 'dark' | 'system' */
  mode: ThemeMode;
  /** Resolved scheme actually applied to UI (system → light or dark) */
  resolvedScheme: "light" | "dark";
  /** Active color palette */
  colors: ThemeColors;
  /** Update preference (persisted to AsyncStorage) */
  setMode: (mode: ThemeMode) => Promise<void>;
  /** Cycle: light → dark → system → light */
  cycleMode: () => Promise<void>;
  /** True while the initial preference is loading */
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isReady, setIsReady] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getThemeMode();
      if (!cancelled) {
        setModeState(saved);
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedScheme: "light" | "dark" =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const colors = resolvedScheme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    try {
      await setThemeMode(next);
    } catch (err) {
      console.warn("[theme] failed to persist mode:", err);
    }
  }, []);

  const cycleMode = useCallback(async () => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    await setMode(next);
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedScheme, colors, setMode, cycleMode, isReady }),
    [mode, resolvedScheme, colors, setMode, cycleMode, isReady],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/** Hook to consume the theme anywhere in the app */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
