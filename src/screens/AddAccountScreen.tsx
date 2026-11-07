import React, { useEffect, useLayoutEffect, useState } from 'react';
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
import { Input } from '@components/Input';
import { Button } from '@components/Button';

import { useTheme } from '@context/ThemeContext';
import { useAccounts } from '@context/AccountsContext';
import { useTransactions } from '@context/TransactionsContext';
import { ACCOUNT_TYPE_LIST } from '@constants/accounts';
import { parseAmount } from '@utils/format';

import type { AccountType } from '@app-types/index';
import type { RootStackParamList } from '@app-types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddAccount'>;

export default function AddAccountScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const { addAccount, updateAccount, deleteAccount, getAccount } = useAccounts();
  const { transactions } = useTransactions();

  const editingId = route.params?.accountId;
  const editing = editingId ? getAccount(editingId) : undefined;
  const isEditMode = !!editing;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [openingBalance, setOpeningBalance] = useState('');
  const [allowNegative, setAllowNegative] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setType(editing.type);
    setOpeningBalance(String(editing.openingBalance));
    setAllowNegative(editing.allowNegative);
  }, [editing]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Account' : 'New Account',
    });
  }, [navigation, isEditMode]);

  const onSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Account name is required.');
      return;
    }
    const opening = parseAmount(openingBalance || '0');
    if (Number.isNaN(opening)) {
      setError('Opening balance must be a number.');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode && editingId) {
        await updateAccount(editingId, {
          name: name.trim(),
          type,
          openingBalance: opening,
          allowNegative,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          openingBalance: opening,
          allowNegative,
        });
      }
      navigation.goBack();
    } catch (e) {
      setError('Could not save account.');
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    if (!editingId) return;

    const linked = transactions.filter(
      (t) =>
        t.accountId === editingId ||
        t.fromAccountId === editingId ||
        t.toAccountId === editingId,
    ).length;

    Alert.alert(
      'Delete account',
      linked > 0
        ? `This account has ${linked} transaction(s). They will remain in history but this account will be removed.`
        : 'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount(editingId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <Screen padBottom>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          Account Name
        </Text>
        <Input
          placeholder="e.g. Main Bank, Wallet"
          value={name}
          onChangeText={setName}
          maxLength={40}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>
          Account Type
        </Text>
        <View style={styles.typesGrid}>
          {ACCOUNT_TYPE_LIST.map((meta) => {
            const active = type === meta.id;
            return (
              <TouchableOpacity
                key={meta.id}
                onPress={() => setType(meta.id)}
                style={[
                  styles.typeItem,
                  {
                    backgroundColor: active
                      ? `${meta.color}22`
                      : colors.surface,
                    borderColor: active ? meta.color : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={22}
                  color={active ? meta.color : colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: active ? meta.color : colors.text },
                  ]}
                >
                  {meta.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>
          Opening Balance
        </Text>
        <Input
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={openingBalance}
          onChangeText={setOpeningBalance}
        />

        <TouchableOpacity
          onPress={() => setAllowNegative((v) => !v)}
          style={[
            styles.toggleRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={allowNegative ? 'checkbox' : 'square-outline'}
            size={22}
            color={allowNegative ? colors.primary : colors.textMuted}
          />
          <Text style={[styles.toggleText, { color: colors.text }]}>
            Allow negative balance
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text>
        ) : null}

        <Button
          label={isEditMode ? 'Save changes' : 'Create account'}
          icon={isEditMode ? 'checkmark' : 'add'}
          onPress={onSave}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: 16 }}
        />

        {isEditMode ? (
          <Button
            label="Delete account"
            variant="danger"
            icon="trash-outline"
            onPress={onDelete}
            style={{ marginTop: 12 }}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  typeItem: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  typeLabel: { fontSize: 13, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  toggleText: { fontSize: 14, fontWeight: '600' },
});
