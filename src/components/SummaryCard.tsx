import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { formatCurrency } from "@utils/format";
import type { Summary } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface SummaryCardProps {
  summary: Summary;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const { colors, resolvedScheme } = useTheme();
  const { t } = useLanguage();

  const isDark = resolvedScheme === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primary,
          shadowColor: isDark ? "#000" : colors.primary,
        },
      ]}
    >
      <Text style={styles.label}>{t("summary.totalBalance")}</Text>
      <Text style={styles.balance}>{formatCurrency(summary.balance)}</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.iconRow}>
            <Ionicons name="arrow-down-circle" size={18} color="#34D399" />
            <Text style={styles.subLabel}>{t("summary.income")}</Text>
          </View>
          <Text style={styles.subValue}>{formatCurrency(summary.income)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.col}>
          <View style={styles.iconRow}>
            <Ionicons name="arrow-up-circle" size={18} color="#FCA5A5" />
            <Text style={styles.subLabel}>{t("summary.expenses")}</Text>
          </View>
          <Text style={styles.subValue}>{formatCurrency(summary.expense)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 18,
  },
  row: { flexDirection: "row", alignItems: "center" },
  col: { flex: 1 },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginHorizontal: 12,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  subLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  subValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
});
