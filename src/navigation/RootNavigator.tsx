// ─────────────────────────────────────────────────────────────
// Root stack: Tabs + AddTransaction (modal)
// ─────────────────────────────────────────────────────────────

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@context/ThemeContext";
import { TabNavigator } from "./TabNavigator";
import AddTransactionScreen from "@screens/AddTransactionScreen";
import type { RootStackParamList } from "@app-types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700" },
        // v7 replacement for the old `headerBackTitleVisible: false`:
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
        freezeOnBlur: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          title: "New Transaction",
        }}
      />
    </Stack.Navigator>
  );
};
