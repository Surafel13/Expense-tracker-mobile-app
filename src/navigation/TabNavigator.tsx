import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import DashboardScreen from "@screens/DashboardScreen";
import TransactionsScreen from "@screens/TransactionsScreen";
import AccountsScreen from "@screens/AccountsScreen";
import StatsScreen from "@screens/StatsScreen";
import type { TabParamList } from "@app-types/navigation";
import SettingsScreen from "@screens/SettingsScreen";
import { useLanguage } from "@context/LanguageContext";


const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();


  return (
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={({ route }) => ({
        headerShown: false,
        freezeOnBlur: true,
        lazy: true,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabel: t(`tabs.${route.name}`),
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          const map: Record<keyof TabParamList, string> = {
            Dashboard: focused ? "home" : "home-outline",
            Transactions: focused ? "list" : "list-outline",
            Accounts: focused ? "wallet" : "wallet-outline",
            Stats: focused ? "bar-chart" : "bar-chart-outline",
            Settings: focused ? "settings" : "settings-outline",
          };
          return (
            <Ionicons name={map[route.name] as any} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
