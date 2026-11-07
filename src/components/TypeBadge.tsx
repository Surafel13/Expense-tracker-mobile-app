import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import type { TransactionType } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface TypeBadgeProps {
  type: TransactionType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const config: Record<
    TransactionType,
    { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    income: {
      label: t("types.income"),
      color: colors.income,
      icon: "arrow-down-circle",
    },
    expense: {
      label: t("types.expense"),
      color: colors.expense,
      icon: "arrow-up-circle",
    },
    transfer: {
      label: t("types.transfer"),
      color: colors.primary,
      icon: "swap-horizontal",
    },
  };

  const c = config[type];

  return (
    <View style={[styles.badge, { backgroundColor: `${c.color}22` }]}>
      <Ionicons name={c.icon} size={14} color={c.color} />
      <Text style={[styles.label, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: { fontSize: 12, fontWeight: "700" },
});
