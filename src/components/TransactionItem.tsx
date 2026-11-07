// ─────────────────────────────────────────────────────────────
// Transaction list row
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { getCategory } from "@constants/categories";
import { formatCurrency } from "@utils/format";
import { formatDayLabel } from "@utils/date";
import type { Transaction } from "@app-types/index";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const { colors } = useTheme();
  const category = getCategory(transaction.category);
  const isIncome = transaction.type === "income";

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View
        style={[styles.iconWrap, { backgroundColor: `${category.color}22` }]}
      >
        <Ionicons
          name={category.icon as any}
          size={22}
          color={category.color}
        />
      </View>

      <View style={styles.mid}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {transaction.note?.trim() || category.label}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {category.label} · {formatDayLabel(transaction.date)}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          { color: isIncome ? colors.income : colors.expense },
        ]}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mid: { flex: 1, marginRight: 8 },
  title: { fontSize: 15, fontWeight: "600" },
  sub: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
});
