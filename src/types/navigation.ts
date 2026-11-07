// ─────────────────────────────────────────────────────────────
// Navigation param list types
// ─────────────────────────────────────────────────────────────

import type { NavigatorScreenParams } from "@react-navigation/native";

/** Bottom-tab routes */
export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Stats: undefined;
};

/** Root stack routes */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  AddTransaction: {
    /** When provided, the form pre-fills and updates this transaction */
    transactionId?: string;
  };
};

// Augment React Navigation's global types so `useNavigation()` is typed everywhere
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
