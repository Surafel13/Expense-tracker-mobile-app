import React, { useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@components/Screen';
import { Card } from '@components/Card';
import { TransactionItem } from '@components/TransactionItem';
import { EmptyState } from '@components/EmptyState';
import { TransactionDetailSheet } from '@components/TransactionDetailSheet';

import { useTheme } from '@context/ThemeContext';
import { useAccounts } from '@context/AccountsContext';
import { useTransactions } from '@context/TransactionsContext';
import { ACCOUNT_TYPES } from '@constants/accounts';
import { getAccountTransactions } from '@utils/balance';
import { formatCurrency } from '@utils/format';
import { getCategory } from '@constants/categories';
import type { RootStackParamList } from '@app-types/navigation';
import type { Transaction } from '@app-types/index';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AccountDetail'>;

export default function AccountDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const { accountsWithBalance } = useAccounts();
  const { transactions, deleteTransaction } = useTransactions();

  const account = accountsWithBalance.find((a) => a.id === route.params.accountId);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: account?.name ?? 'Account',
      headerRight: () =>
        account ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddAccount', { accountId: account.id })
            }
            hitSlop={8}
            style={{ padding: 8 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, account, colors.text]);

  const items = useMemo(
    () =>
      account
        ? getAccountTransactions(account.id, transactions)
        : [],
    [account, transactions],
  );

  if (!account) {
    return (
      <Screen>
        <View style={styles.empty}>
          <EmptyState
            icon="alert-circle-outline"
            title="Account not found"
            subtitle="It may have been deleted."
          />
        </View>
      </Screen>
    );
  }

  const meta = ACCOUNT_TYPES[account.type];

  const confirmDelete = (t: Transaction) => {
    const cat = t.category ? getCategory(t.category) : { label: 'Transfer' };
    Alert.alert(
      'Delete transaction',
      `Remove "${t.note?.trim() || cat.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
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
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.heroRow}>
            <View style={[styles.icon, { backgroundColor: `${meta.color}22` }]}>
              <Ionicons name={meta.icon as any} size={26} color={meta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountName, { color: colors.text }]}>
                {account.name}
              </Text>
              <Text style={[styles.accountType, { color: colors.textMuted }]}>
                {meta.label}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.balance,
              { color: account.balance >= 0 ? colors.text : colors.danger },
            ]}
          >
            {formatCurrency(account.balance)}
          </Text>
          <Text style={[styles.opening, { color: colors.textMuted }]}>
            Opening balance: {formatCurrency(account.openingBalance)}
          </Text>
        </Card>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          Transaction History
        </Text>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              subtitle="Transactions for this account will appear here."
            />
          </Card>
        ) : (
          <Card padded={false} style={{ paddingHorizontal: 16 }}>
            {items.map((t, idx) => (
              <View
                key={t.id}
                style={idx === items.length - 1 ? undefined : undefined}
              >
                <TransactionItem
                  transaction={t}
                  onPress={() => setSelected(t)}
                />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <TransactionDetailSheet
        visible={!!selected}
        transaction={selected}
        onClose={() => setSelected(null)}
        onEdit={(t) => {
          setSelected(null);
          navigation.navigate('AddTransaction', { transactionId: t.id });
        }}
        onDelete={confirmDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: { fontSize: 17, fontWeight: '800' },
  accountType: { fontSize: 12, marginTop: 2 },
  balance: { fontSize: 30, fontWeight: '800', marginTop: 14 },
  opening: { fontSize: 12, marginTop: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
