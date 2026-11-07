// ─────────────────────────────────────────────────────────────
// Root component: providers + navigation + status bar
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemeProvider, useTheme } from "@context/ThemeContext";
import { TransactionsProvider } from "@context/TransactionsContext";
import { RootNavigator } from "@navigation/RootNavigator";

/** Inner component — needs to be inside ThemeProvider to use useTheme */
function ThemedApp() {
  const { colors, resolvedScheme } = useTheme();

  const navTheme = {
    ...(resolvedScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolvedScheme === "dark" ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TransactionsProvider>
            <ThemedApp />
          </TransactionsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
