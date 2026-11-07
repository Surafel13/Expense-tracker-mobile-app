import React, { useMemo } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { LanguageProvider } from "@context/LanguageContext";
import { ThemeProvider, useTheme } from "@context/ThemeContext";
import { TransactionsProvider } from "@context/TransactionsContext";
import { AccountsProvider } from "@context/AccountsContext";
import { RootNavigator } from "@navigation/RootNavigator";

function ThemedApp() {
  const { colors, resolvedScheme } = useTheme();

  const navTheme = useMemo(() => {
    const base = resolvedScheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.danger,
      },
    };
  }, [resolvedScheme, colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
        <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TransactionsProvider>
              <AccountsProvider>
                <ThemedApp />
              </AccountsProvider>
            </TransactionsProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
