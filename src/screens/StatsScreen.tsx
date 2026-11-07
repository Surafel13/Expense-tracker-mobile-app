// ─────────────────────────────────────────────────────────────
// Stats — 6-month bar chart + top categories + monthly totals
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@components/Screen";
import { Card } from "@components/Card";
import { BarChart } from "@components/BarChart";
import { SectionHeader } from "@components/SectionHeader";
import { EmptyState } from "@components/EmptyState";

import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { useTransactions } from "@context/TransactionsContext";
import { getCategory } from "@constants/categories";
import { formatCurrency } from "@utils/format";
import {
  formatMonthLabel,
  isSameMonth,
  lastNMonthKeys,
  monthKeyToShortLabel,
  toMonthKey,
} from "@utils/date";

import type { CategoryId, MonthlyData } from "@app-types/index";

interface CategoryTotal {
  categoryId: CategoryId;
  total: number;
  count: number;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const { transactions } = useTransactions();
  const [chartRange] = useState(6);

  // ── 6-month chart data ────────────────────────────────────
  // `language` is a dependency so the short month labels refresh
  const chartData: MonthlyData[] = useMemo(() => {
    const keys = lastNMonthKeys(chartRange);

    const map = new Map<string, { income: number; expense: number }>();
    for (const key of keys) map.set(key, { income: 0, expense: 0 });

    for (const tx of transactions) {
      const key = toMonthKey(tx.date);
      const bucket = map.get(key);
      if (!bucket) continue;
      if (tx.type === "income") bucket.income += tx.amount;
      else bucket.expense += tx.amount;
    }

    return keys.map((key) => {
      const b = map.get(key)!;
      return {
        key,
        month: monthKeyToShortLabel(key),
        income: b.income,
        expense: b.expense,
      };
    });
  }, [transactions, chartRange, language]);

  // ── Current-month totals + top categories ─────────────────
  const { monthly, topCategories } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;
    const catMap = new Map<CategoryId, { total: number; count: number }>();

    for (const tx of transactions) {
      if (!isSameMonth(tx.date, now)) continue;
      if (tx.type === "income") income += tx.amount;
      else {
        expense += tx.amount;
        if (!tx.category) continue;
        const prev = catMap.get(tx.category) ?? { total: 0, count: 0 };
        catMap.set(tx.category, {
          total: prev.total + tx.amount,
          count: prev.count + 1,
        });
      }
    }

    const top: CategoryTotal[] = Array.from(catMap.entries())
      .map(([categoryId, v]) => ({
        categoryId,
        total: v.total,
        count: v.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      monthly: { income, expense, net: income - expense },
      topCategories: top,
    };
  }, [transactions]);

  const maxCategoryTotal =
    topCategories.length > 0 ? topCategories[0].total : 0;

  const hasAnyData = transactions.length > 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {t("stats.heading")}
          </Text>
        </View>

        {/* ── Monthly totals card ────────────────────────── */}
        <Card style={styles.cardContainer}>
          <Text style={[styles.monthLabel, { color: colors.textMuted }]}>
            {formatMonthLabel(new Date())}
          </Text>
          <View style={styles.totalsRow}>
            <View style={styles.totalCol}>
              <View style={styles.iconRow}>
                <Ionicons
                  name="arrow-down-circle"
                  size={16}
                  color={colors.income}
                />
                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
                  {t("stats.income")}
                </Text>
              </View>
              <Text style={[styles.totalValue, { color: colors.income }]}>
                {formatCurrency(monthly.income)}
              </Text>
            </View>

            <View style={styles.totalCol}>
              <View style={styles.iconRow}>
                <Ionicons
                  name="arrow-up-circle"
                  size={16}
                  color={colors.expense}
                />
                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>
                  {t("stats.expense")}
                </Text>
              </View>
              <Text style={[styles.totalValue, { color: colors.expense }]}>
                {formatCurrency(monthly.expense)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.netRow}>
            <Text style={[styles.netLabel, { color: colors.textMuted }]}>
              {t("stats.net")}
            </Text>
            <Text
              style={[
                styles.netValue,
                {
                  color: monthly.net >= 0 ? colors.income : colors.expense,
                },
              ]}
            >
              {monthly.net >= 0 ? "+" : ""}
              {formatCurrency(monthly.net)}
            </Text>
          </View>
        </Card>

        {/* ── 6-month bar chart ─────────────────────────── */}
        <Card style={styles.cardContainer}>
          <SectionHeader title={t("stats.last6")} />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.income }]}
              />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>
                {t("stats.income")}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.expense }]}
              />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>
                {t("stats.expense")}
              </Text>
            </View>
          </View>
          <BarChart data={chartData} />
        </Card>

        {/* ── Top categories ────────────────────────────── */}
        <Card style={styles.cardContainer}>
          <SectionHeader title={t("stats.topCategories")} />
          {!hasAnyData ? (
            <EmptyState
              icon="pie-chart-outline"
              title={t("stats.noDataTitle")}
              subtitle={t("stats.noDataSub")}
            />
          ) : topCategories.length === 0 ? (
            <EmptyState
              icon="pie-chart-outline"
              title={t("stats.noExpTitle")}
              subtitle={t("stats.noExpSub")}
            />
          ) : (
            <View style={styles.categoriesList}>
              {topCategories.map((c) => {
                const cat = getCategory(c.categoryId);
                const pct = maxCategoryTotal ? c.total / maxCategoryTotal : 0;
                return (
                  <View key={c.categoryId} style={styles.catItemWrapper}>
                    <View style={styles.catRow}>
                      <View
                        style={[
                          styles.catIcon,
                          { backgroundColor: `${cat.color}18` },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={16}
                          color={cat.color}
                        />
                      </View>
                      <Text
                        style={[styles.catName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {t(`categories.${c.categoryId}`)}
                      </Text>
                      <Text style={[styles.catAmount, { color: colors.text }]}>
                        {formatCurrency(c.total)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.barTrack,
                        { backgroundColor: colors.surface },
                      ]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: cat.color,
                            width: `${Math.max(pct * 100, 4)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.catSub, { color: colors.textMuted }]}>
                      {t(c.count === 1 ? "stats.txOne" : "stats.txMany", {
                        count: c.count,
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 18,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalsRow: { flexDirection: "row", gap: 16 },
  totalCol: { flex: 1 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  totalLabel: { fontSize: 12, fontWeight: "600" },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: -0.3,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  netLabel: { fontSize: 13, fontWeight: "600" },
  netValue: { fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  legendRow: { flexDirection: "row", gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: "600" },
  categoriesList: { gap: 16, marginTop: 8 },
  catItemWrapper: { gap: 6 },
  catRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  catName: { flex: 1, fontSize: 14, fontWeight: "600", letterSpacing: -0.2 },
  catAmount: { fontSize: 14, fontWeight: "700", letterSpacing: -0.2 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },
  catSub: { fontSize: 11, fontWeight: "500" },
});
