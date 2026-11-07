// ─────────────────────────────────────────────────────────────
// Transactions — full list with category & date filters
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@components/Screen";
import { Card } from "@components/Card";
import { CategoryChip } from "@components/CategoryChip";
import { EmptyState } from "@components/EmptyState";
import { TransactionItem } from "@components/TransactionItem";

import { useTheme } from "@context/ThemeContext";
import { useTransactions } from "@context/TransactionsContext";
import { getCategory } from "@constants/categories";
import { formatDateLabel, isSameDay, isSameMonth } from "@utils/date";

import type { CategoryId, Transaction } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type RangeKey = "thisMonth" | "lastMonth" | "all";

const RANGE_LABELS: Record<RangeKey, string> = {
  thisMonth: "This Month",
  lastMonth: "Last Month",
  all: "All Time",
};

/** Categories currently present in the data (plus "All") */
const FILTER_CATEGORIES: Array<CategoryId | "all"> = [
  "all",
  "food",
  "transport",
  "shopping",
  "education",
  "health",
  "entertainment",
  "bills",
  "salary",
  "freelance",
  "gift",
  "other",
];

function inRange(date: string, range: RangeKey): boolean {
  if (range === "all") return true;
  const d = new Date(date);
  const now = new Date();
  if (range === "thisMonth") return isSameMonth(d, now);
  // lastMonth
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return isSameMonth(d, prev);
}

/** Group transactions by day (preserving sort order) */
function groupByDay(items: Transaction[]): Array<{
  key: string;
  title: string;
  data: Transaction[];
}> {
  const buckets = new Map<string, Transaction[]>();
  const order: string[] = [];

  for (const t of items) {
    const dayKey = t.date.slice(0, 10); // YYYY-MM-DD
    if (!buckets.has(dayKey)) {
      buckets.set(dayKey, []);
      order.push(dayKey);
    }
    buckets.get(dayKey)!.push(t);
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return order.map((key) => {
    const sample = buckets.get(key)![0];
    const title = isSameDay(sample.date, today)
      ? "Today"
      : isSameDay(sample.date, yesterday)
        ? "Yesterday"
        : formatDateLabel(sample.date);
    return { key, title, data: buckets.get(key)! };
  });
}

export default function TransactionsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useTransactions();

  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [range, setRange] = useState<RangeKey>("thisMonth");

  // ── Filter (memoized) ────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!inRange(t.date, range)) return false;
      return true;
    });
  }, [transactions, category, range]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  const confirmDelete = (t: Transaction) => {
    const cat = getCategory(t.category);
    Alert.alert(
      "Delete transaction",
      `Remove "${t.note?.trim() || cat.label}" of $${t.amount.toFixed(2)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(t.id),
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Transactions
        </Text>

        {/* ── Range filter ──────────────────────────────── */}
        <View style={styles.rangeRow}>
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => {
            const active = range === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setRange(key)}
                style={[
                  styles.rangeBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeLabel,
                    { color: active ? colors.onPrimary : colors.text },
                  ]}
                >
                  {RANGE_LABELS[key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Category filter row (horizontal scroll) ───── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CATEGORIES.map((id) => (
            <View key={id} style={styles.chipWrap}>
              {id === "all" ? (
                <TouchableOpacity
                  onPress={() => setCategory("all")}
                  style={[
                    styles.allChip,
                    {
                      backgroundColor:
                        category === "all" ? colors.primary : colors.surface,
                      borderColor:
                        category === "all" ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="apps-outline"
                    size={14}
                    color={category === "all" ? colors.onPrimary : colors.text}
                  />
                  <Text
                    style={[
                      styles.allChipLabel,
                      {
                        color:
                          category === "all" ? colors.onPrimary : colors.text,
                      },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
              ) : (
                <CategoryChip
                  categoryId={id}
                  selected={category === id}
                  onPress={() => setCategory(id)}
                  compact
                />
              )}
            </View>
          ))}
        </ScrollView>

        {/* ── List ──────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {grouped.length === 0 ? (
            <Card>
              <EmptyState
                icon="filter-outline"
                title="Nothing matches"
                subtitle="Try a different category or date range."
              />
            </Card>
          ) : (
            grouped.map((group) => (
              <View key={group.key} style={styles.group}>
                <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
                  {group.title}
                </Text>
                <Card padded={false} style={{ paddingHorizontal: 16 }}>
                  {group.data.map((t) => (
                    <View key={t.id} style={styles.row}>
                      <View style={styles.rowInner}>
                        <TransactionItem
                          transaction={t}
                          onPress={() =>
                            navigation.navigate("AddTransaction", {
                              transactionId: t.id,
                            })
                          }
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDelete(t)}
                        hitSlop={8}
                        style={styles.deleteBtn}
                        accessibilityLabel="Delete transaction"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </Card>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  rangeRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  rangeLabel: { fontSize: 13, fontWeight: "600" },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  chipWrap: { marginRight: 8 },
  allChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  allChipLabel: { fontSize: 12, fontWeight: "600" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  group: { gap: 8 },
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowInner: { flex: 1 },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
