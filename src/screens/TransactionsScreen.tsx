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
import { TransactionDetailSheet } from "@components/TransactionDetailSheet";

import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { useTransactions } from "@context/TransactionsContext";
import { formatCurrency } from "@utils/format";
import { formatDateLabel, isSameDay, isSameMonth } from "@utils/date";
import { tr } from "@utils/i18n";
import type { TranslationKey } from "@constants/translations";

import type { CategoryId, Transaction } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RangeKey = "thisMonth" | "lastMonth" | "all";

const RANGE_KEYS: RangeKey[] = ["thisMonth", "lastMonth", "all"];

const RANGE_LABEL_KEYS: Record<RangeKey, TranslationKey> = {
  thisMonth: "transactions.thisMonth",
  lastMonth: "transactions.lastMonth",
  all: "transactions.allTime",
};

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
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return isSameMonth(d, prev);
}

function groupByDay(items: Transaction[]): Array<{
  key: string;
  title: string;
  data: Transaction[];
}> {
  const buckets = new Map<string, Transaction[]>();
  const order: string[] = [];

  for (const tx of items) {
    const dayKey = tx.date.slice(0, 10);
    if (!buckets.has(dayKey)) {
      buckets.set(dayKey, []);
      order.push(dayKey);
    }
    buckets.get(dayKey)!.push(tx);
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return order.map((key) => {
    const sample = buckets.get(key)![0];
    const title = isSameDay(sample.date, today)
      ? tr("transactions.today")
      : isSameDay(sample.date, yesterday)
        ? tr("transactions.yesterday")
        : formatDateLabel(sample.date);
    return { key, title, data: buckets.get(key)! };
  });
}

export default function TransactionsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, resolvedScheme } = useTheme();
  const { t, language } = useLanguage();
  const isDark = resolvedScheme === "dark";
  const { transactions, deleteTransaction } = useTransactions();

  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [range, setRange] = useState<RangeKey>("thisMonth");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (category !== "all" && tx.category !== category) return false;
      if (!inRange(tx.date, range)) return false;
      return true;
    });
  }, [transactions, category, range]);

  // `language` is a dependency so day titles ("Today", month names) refresh
  const grouped = useMemo(() => groupByDay(filtered), [filtered, language]);

  const confirmDelete = (tx: Transaction) => {
    const label = tx.category
      ? t(`categories.${tx.category}`)
      : t("types.transfer");
    Alert.alert(
      t("transactions.deleteTitle"),
      t("transactions.deleteMessage", {
        name: tx.note?.trim() || label,
        amount: formatCurrency(tx.amount),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(tx.id);
            setSelected(null);
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {t("transactions.heading")}
          </Text>
        </View>

        <View style={styles.rangeRow}>
          {RANGE_KEYS.map((key) => {
            const active = range === key;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setRange(key)}
                style={[
                  styles.rangeBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    shadowColor: active ? colors.primary : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: active ? 0.2 : 0,
                    shadowRadius: 4,
                    elevation: active ? 2 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeLabel,
                    { color: active ? colors.onPrimary : colors.textMuted },
                  ]}
                >
                  {t(RANGE_LABEL_KEYS[key])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTER_CATEGORIES.map((id) => (
              <View key={id} style={styles.chipWrap}>
                {id === "all" ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
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
                      color={
                        category === "all" ? colors.onPrimary : colors.text
                      }
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
                      {t("common.all")}
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
        </View>

        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {grouped.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Card>
                <EmptyState
                  icon="filter-outline"
                  title={t("transactions.nothingTitle")}
                  subtitle={t("transactions.nothingSub")}
                />
              </Card>
            </View>
          ) : (
            grouped.map((group) => (
              <View key={group.key} style={styles.group}>
                <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
                  {group.title}
                </Text>
                <Card padded={false} style={styles.groupCard}>
                  {group.data.map((tx, index) => (
                    <View
                      key={tx.id}
                      style={[
                        styles.row,
                        index > 0 && {
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.rowInner}>
                        <TransactionItem
                          transaction={tx}
                          onPress={() => setSelected(tx)}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDelete(tx)}
                        hitSlop={12}
                        style={[
                          styles.deleteBtn,
                          {
                            backgroundColor: isDark
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(239, 68, 68, 0.08)",
                          },
                        ]}
                        accessibilityLabel={t("transactions.deleteA11y")}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
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

      <TransactionDetailSheet
        visible={!!selected}
        transaction={selected}
        onClose={() => setSelected(null)}
        onEdit={(tx) => {
          setSelected(null);
          navigation.navigate("AddTransaction", { transactionId: tx.id });
        }}
        onDelete={confirmDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rangeRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 12,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rangeLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  filterContainer: {
    marginBottom: 4,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 8,
  },
  chipWrap: { marginRight: 4 },
  allChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  allChipLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 20,
  },
  emptyContainer: {
    marginTop: 24,
  },
  group: { gap: 8 },
  groupTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginLeft: 4,
  },
  groupCard: {
    overflow: "hidden",
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  rowInner: { flex: 1 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
