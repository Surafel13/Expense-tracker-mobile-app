// ─────────────────────────────────────────────────────────────
// Dashboard — summary card, theme toggle, recent transactions
// ─────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@components/Screen';
import { SummaryCard } from '@components/SummaryCard';
import { SectionHeader } from '@components/SectionHeader';
import { TransactionItem } from '@components/TransactionItem';
import { EmptyState } from '@components/EmptyState';
import { Card } from '@components/Card';

import { useTheme } from '@context/ThemeContext';
import { useTransactions } from '@context/TransactionsContext';
import { formatMonthLabel, isSameMonth } from '@utils/date';
import type { Summary } from '@app-types/index';
import type { RootStackParamList } from '@app-types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, cycleMode, resolvedScheme } = useTheme();
  const { transactions, isReady } = useTransactions();

  // ── Month-to-date totals (memoized) ───────────────────────
  const { summary, recent } = useMemo(() => {
    const now = new Date();
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (!isSameMonth(t.date, now)) continue;
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }

    const s: Summary = {
      balance: income - expense,
      income,
      expense,
    };

    return { summary: s, recent: transactions.slice(0, 5) };
  }, [transactions]);

  const monthLabel = formatMonthLabel(new Date());

  return (
    <Screen>
      <View style={styles.container}>
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>
              {monthLabel}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Overview
            </Text>
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
              name={resolvedScheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* ── Scrollable content ─────────────────────────── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard summary={summary} />

          <View style={styles.section}>
            <SectionHeader
              title="Recent transactions"
              actionLabel={transactions.length > 0 ? 'See all' : undefined}
              onActionPress={
                transactions.length > 0
                  ? () => navigation.navigate('Tabs', { screen: 'Transactions' })
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
                    style={idx === recent.length - 1 ? styles.lastRow : undefined}
                  >
                    <TransactionItem
                      transaction={t}
                      onPress={() =>
                        navigation.navigate('AddTransaction', {
                          transactionId: t.id,
                        })
                      }
                    />
                  </View>
                ))}
              </Card>
            )}
          </View>
        </ScrollView>

        {/* ── Floating Add button ────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction', {})}
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityLabel="Add transaction"
        >
          <Ionicons name="add" size={28} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 24, fontWeight: '800' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // space for FAB
    gap: 20,
  },
  section: { gap: 4 },
  lastRow: { borderBottomWidth: 0 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
