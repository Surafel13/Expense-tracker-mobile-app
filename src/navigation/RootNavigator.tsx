import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@context/ThemeContext";
import { TabNavigator } from "./TabNavigator";
import AddTransactionScreen from "@screens/AddTransactionScreen";
import AddAccountScreen from "@screens/AddAccountScreen";
import AccountDetailScreen from "@screens/AccountDetailScreen";
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
      <Stack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          title: "New Account",
        }}
      />
      <Stack.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: "Account" }}
      />
    </Stack.Navigator>
  );
};
