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
import { useTransactions } from "@context/TransactionsContext";
import { formatMonthLabel, isSameMonth } from "@utils/date";
import { getCategory } from "@constants/categories";
import type { Summary, Transaction } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";
import { useAccounts } from "@context/AccountsContext";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();

  const { colors, cycleMode, resolvedScheme } = useTheme();
  const { transactions, isReady, deleteTransaction } = useTransactions();
  const { accountsWithBalance } = useAccounts();

  const [selected, setSelected] = useState<Transaction | null>(null);

  const { summary, recent } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (!isSameMonth(t.date, now)) continue;
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
    }

    const s: Summary = {
      balance: accountsWithBalance.reduce((sum, a) => sum + a.balance, 0),
      income,
      expense,
    };

    return { summary: s, recent: transactions.slice(0, 5) };
  }, [transactions, accountsWithBalance]);

  const monthLabel = formatMonthLabel(new Date());

  const confirmDelete = (t: Transaction) => {
    const cat = t.category ? getCategory(t.category) : { label: "Transfer" };
    Alert.alert(
      "Delete transaction",
      `Remove "${t.note?.trim() || cat.label}" of ${formatCurrencyForAlert(t.amount)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(t.id);
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
            <Text style={[styles.title, { color: colors.text }]}>Overview</Text>
          </View>

          <TouchableOpacity
            onPress={() => cycleMode()}
            style={[
              styles.iconButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            hitSlop={8}
            accessibilityLabel="Toggle theme"
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
              title="Recent transactions"
              actionLabel={transactions.length > 0 ? "See all" : undefined}
              onActionPress={
                transactions.length > 0
                  ? () =>
                      navigation.navigate("Tabs", { screen: "Transactions" })
                  : undefined
              }
            />

            {!isReady ? (
              <Card>
                <Text style={{ color: colors.textMuted }}>Loading…</Text>
              </Card>
            ) : recent.length === 0 ? (
              <Card padded>
                <EmptyState
                  icon="wallet-outline"
                  title="No transactions yet"
                  subtitle="Tap the + button to add your first transaction."
                />
              </Card>
            ) : (
              <Card padded={false} style={{ paddingHorizontal: 16 }}>
                {recent.map((t, idx) => (
                  <View
                    key={t.id}
                    style={
                      idx === recent.length - 1 ? styles.lastRow : undefined
                    }
                  >
                    <TransactionItem
                      transaction={t}
                      onPress={() => setSelected(t)}
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
          accessibilityLabel="Add transaction"
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <TransactionDetailSheet
        visible={!!selected}
        transaction={selected}
        onClose={() => setSelected(null)}
        onEdit={(t) => {
          setSelected(null);
          navigation.navigate("AddTransaction", { transactionId: t.id });
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  title: { fontSize: 24, fontWeight: "800" },
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
  section: { gap: 4 },
  lastRow: { borderBottomWidth: 0 },
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
