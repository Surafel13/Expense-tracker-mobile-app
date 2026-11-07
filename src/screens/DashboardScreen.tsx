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
import { SummaryCard } from "@components/SummaryCard";
import { SectionHeader } from "@components/SectionHeader";
import { TransactionItem } from "@components/TransactionItem";
import { EmptyState } from "@components/EmptyState";
import { Card } from "@components/Card";
import { TransactionDetailSheet } from "@components/TransactionDetailSheet";

import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { useTransactions } from "@context/TransactionsContext";
import { useAccounts } from "@context/AccountsContext";
import { formatMonthLabel, isSameMonth } from "@utils/date";
import type { Summary, Transaction } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();

  const { colors, cycleMode, resolvedScheme } = useTheme();
  const { t } = useLanguage();
  const { transactions, isReady, deleteTransaction } = useTransactions();
  const { accountsWithBalance } = useAccounts();

  const [selected, setSelected] = useState<Transaction | null>(null);

  const { summary, recent } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (!isSameMonth(tx.date, now)) continue;
      if (tx.type === "income") income += tx.amount;
      else if (tx.type === "expense") expense += tx.amount;
    }

    const s: Summary = {
      balance: accountsWithBalance.reduce((sum, a) => sum + a.balance, 0),
      income,
      expense,
    };

    return { summary: s, recent: transactions.slice(0, 5) };
  }, [transactions, accountsWithBalance]);

  const monthLabel = formatMonthLabel(new Date());

  const confirmDelete = (tx: Transaction) => {
    const label = tx.category
      ? t(`categories.${tx.category}`)
      : t("types.transfer");
    Alert.alert(
      t("transactions.deleteTitle"),
      t("transactions.deleteMessage", {
        name: tx.note?.trim() || label,
        amount: formatCurrencyForAlert(tx.amount),
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
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>
              {monthLabel}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("dashboard.overview")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => cycleMode()}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            hitSlop={8}
            accessibilityLabel={t("dashboard.toggleTheme")}
          >
            <Ionicons
              name={
                resolvedScheme === "dark" ? "sunny-outline" : "moon-outline"
              }
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard summary={summary} />

          <View style={styles.section}>
            <SectionHeader
              title={t("dashboard.recent")}
              actionLabel={
                transactions.length > 0 ? t("dashboard.seeAll") : undefined
              }
              onActionPress={
                transactions.length > 0
                  ? () =>
                      navigation.navigate("Tabs", { screen: "Transactions" })
                  : undefined
              }
            />

            {!isReady ? (
              <Card>
                <Text style={{ color: colors.textMuted }}>
                  {t("common.loading")}
                </Text>
              </Card>
            ) : recent.length === 0 ? (
              <Card padded>
                <EmptyState
                  icon="wallet-outline"
                  title={t("dashboard.emptyTitle")}
                  subtitle={t("dashboard.emptySub")}
                />
              </Card>
            ) : (
              <Card padded={false} style={styles.recentCard}>
                {recent.map((tx, idx) => (
                  <View
                    key={tx.id}
                    style={[
                      styles.rowWrapper,
                      idx > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                      },
                    ]}
                  >
                    <TransactionItem
                      transaction={tx}
                      onPress={() => setSelected(tx)}
                    />
                  </View>
                ))}
              </Card>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate("AddTransaction", {})}
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityLabel={t("dashboard.addTransaction")}
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
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

function formatCurrencyForAlert(n: number): string {
  return `$${n.toFixed(2)}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 20,
  },
  section: { gap: 8 },
  recentCard: {
    overflow: "hidden",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  rowWrapper: {
    paddingVertical: 2,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
