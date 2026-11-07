import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@components/Screen";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { CategoryPicker } from "@components/CategoryPicker";
import { AccountPicker } from "@components/AccountPicker";
import { BalanceWarningBanner } from "@components/BalanceWarningBanner";

import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { useTransactions } from "@context/TransactionsContext";
import { useAccounts } from "@context/AccountsContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@constants/categories";
import { UNTRACKED_ACCOUNT_ID } from "@constants/accounts";
import { formatDateLabel } from "@utils/date";
import { parseAmount, formatCurrency } from "@utils/format";

import type { CategoryId } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AddTransaction">;

type FormMode = "income" | "expense" | "transfer";

export default function AddTransactionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors, resolvedScheme } = useTheme();
  const { t } = useLanguage();
  const isDark = resolvedScheme === "dark";
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();
  const { accountsWithBalance } = useAccounts();

  const editingId = route.params?.transactionId;
  const editing = useMemo(
    () =>
      editingId ? transactions.find((tx) => tx.id === editingId) : undefined,
    [editingId, transactions],
  );
  const isEditMode = !!editing;

  const [mode, setMode] = useState<FormMode>("expense");
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [fromAccountId, setFromAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode
        ? t("txForm.editTitle")
        : mode === "transfer"
          ? t("txForm.newTransfer")
          : mode === "income"
            ? t("txForm.newIncome")
            : t("txForm.newExpense"),
    });
  }, [navigation, isEditMode, mode, t]);

  useEffect(() => {
    if (!editing) {
      if (!accountId && accountsWithBalance.length > 0) {
        setAccountId(accountsWithBalance[0].id);
      }
      if (!fromAccountId && accountsWithBalance.length > 0) {
        setFromAccountId(accountsWithBalance[0].id);
      }
      if (!toAccountId && accountsWithBalance.length > 1) {
        setToAccountId(accountsWithBalance[1].id);
      }
      return;
    }
    const tx = editing;
    setMode(tx.type);
    setAmountInput(String(tx.amount));
    if (tx.category) setCategory(tx.category);
    if (tx.accountId) setAccountId(tx.accountId);
    if (tx.fromAccountId) setFromAccountId(tx.fromAccountId);
    if (tx.toAccountId) setToAccountId(tx.toAccountId);
    setDate(new Date(tx.date));
    setNote(tx.note ?? "");
  }, [editing, accountsWithBalance]);

  useEffect(() => {
    if (mode === "transfer") return;
    if (!category) return;
    const list = mode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!list.some((c) => c.id === category)) setCategory(null);
  }, [mode, category]);

  useEffect(() => {
    if (mode === "transfer") return;
    if (category) return;
    const list = mode === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (list.length > 0) setCategory(list[0].id);
  }, [mode, category]);

  const selectedAccount = useMemo(
    () => accountsWithBalance.find((a) => a.id === accountId),
    [accountId, accountsWithBalance],
  );
  const selectedFromAccount = useMemo(
    () => accountsWithBalance.find((a) => a.id === fromAccountId),
    [fromAccountId, accountsWithBalance],
  );

  const parsedAmount = parseAmount(amountInput);
  const amountValid = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  const balanceWarning = useMemo(() => {
    if (!amountValid) return null;
    if (mode === "expense" && selectedAccount) {
      if (selectedAccount.allowNegative) return null;
      if (selectedAccount.balance - parsedAmount < 0) {
        return t("errors.insufficient", {
          name: selectedAccount.name,
          amount: formatCurrency(selectedAccount.balance),
        });
      }
    }
    if (mode === "transfer" && selectedFromAccount) {
      if (selectedFromAccount.allowNegative) return null;
      if (selectedFromAccount.balance - parsedAmount < 0) {
        return t("errors.insufficient", {
          name: selectedFromAccount.name,
          amount: formatCurrency(selectedFromAccount.balance),
        });
      }
    }
    return null;
  }, [
    mode,
    parsedAmount,
    amountValid,
    selectedAccount,
    selectedFromAccount,
    t,
  ]);

  const onSave = async () => {
    setError(null);
    if (!amountValid) {
      setError(t("txForm.errAmount"));
      return;
    }
    if (mode !== "transfer" && !category) {
      setError(t("txForm.errCategory"));
      return;
    }
    if (mode !== "transfer" && !accountId) {
      setError(t("txForm.errAccount"));
      return;
    }
    if (mode === "transfer") {
      if (!fromAccountId || !toAccountId) {
        setError(t("txForm.errBoth"));
        return;
      }
      if (fromAccountId === toAccountId) {
        setError(t("txForm.errSame"));
        return;
      }
    }

    try {
      setSubmitting(true);
      const base = {
        amount: parsedAmount,
        date: date.toISOString(),
        note: note.trim() || undefined,
      };

      let payload;
      if (mode === "transfer") {
        payload = {
          ...base,
          type: "transfer" as const,
          fromAccountId: fromAccountId!,
          toAccountId: toAccountId!,
        };
      } else {
        payload = {
          ...base,
          type: mode as "income" | "expense",
          category: category!,
          accountId:
            accountId === UNTRACKED_ACCOUNT_ID ? undefined : accountId!,
        };
      }

      if (isEditMode && editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await addTransaction(payload);
      }
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("txForm.errSave");
      setError(msg);
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    if (!editingId) return;
    Alert.alert(t("txForm.deleteTitle"), t("txForm.deleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selectedDate) setDate(selectedDate);
  };

  const accent =
    mode === "income"
      ? colors.income
      : mode === "transfer"
        ? colors.primary
        : colors.expense;

  return (
    <Screen padBottom>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.toggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {(["expense", "income", "transfer"] as FormMode[]).map((opt) => {
              const active = mode === opt;
              const optColor =
                opt === "income"
                  ? colors.income
                  : opt === "transfer"
                    ? colors.primary
                    : colors.expense;
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.8}
                  onPress={() => setMode(opt)}
                  style={[
                    styles.toggleBtn,
                    active && {
                      backgroundColor: optColor,
                      shadowColor: optColor,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      opt === "income"
                        ? "arrow-down-circle"
                        : opt === "transfer"
                          ? "swap-horizontal"
                          : "arrow-up-circle"
                    }
                    size={16}
                    color={active ? "#FFFFFF" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.toggleLabel,
                      { color: active ? "#FFFFFF" : colors.textMuted },
                    ]}
                  >
                    {t(`types.${opt}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={[
              styles.amountCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              {t("txForm.amount")}
            </Text>
            <View style={styles.amountRow}>
              <Text style={[styles.currency, { color: accent }]}>$</Text>
              <Input
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amountInput}
                onChangeText={setAmountInput}
                containerStyle={{ flex: 1 }}
                style={{
                  fontSize: 32,
                  fontWeight: "800",
                  height: 56,
                  textAlign: "left",
                }}
              />
            </View>
          </View>

          {mode !== "transfer" ? (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                {t("txForm.account")}
              </Text>
              <AccountPicker
                accounts={accountsWithBalance}
                selectedId={accountId}
                onSelect={setAccountId}
                includeUntracked={mode === "expense"}
              />
            </View>
          ) : (
            <>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  {t("txForm.from")}
                </Text>
                <AccountPicker
                  accounts={accountsWithBalance}
                  selectedId={fromAccountId}
                  onSelect={setFromAccountId}
                  excludeId={toAccountId}
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>
                  {t("txForm.to")}
                </Text>
                <AccountPicker
                  accounts={accountsWithBalance}
                  selectedId={toAccountId}
                  onSelect={setToAccountId}
                  excludeId={fromAccountId}
                />
              </View>
            </>
          )}

          {balanceWarning ? (
            <BalanceWarningBanner message={balanceWarning} />
          ) : null}

          {mode !== "transfer" ? (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                {t("txForm.category")}
              </Text>
              <CategoryPicker
                type={mode}
                selected={category}
                onSelect={setCategory}
              />
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {t("txForm.date")}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPicker(true)}
              style={[
                styles.dateRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.dateIconBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDateLabel(date)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeDate}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {t("txForm.note")}
            </Text>
            <Input
              placeholder={t("txForm.notePlaceholder")}
              value={note}
              onChangeText={setNote}
              maxLength={80}
            />
          </View>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.14)"
                    : "rgba(239, 68, 68, 0.08)",
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              label={isEditMode ? t("txForm.saveChanges") : t("txForm.save")}
              onPress={onSave}
              loading={submitting}
              disabled={submitting || !!balanceWarning}
              icon={isEditMode ? "checkmark" : "add"}
            />

            {isEditMode ? (
              <Button
                label={t("txForm.delete")}
                variant="danger"
                icon="trash-outline"
                onPress={onDelete}
              />
            ) : null}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 16,
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  amountCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currency: {
    fontSize: 32,
    fontWeight: "800",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginLeft: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  dateIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
