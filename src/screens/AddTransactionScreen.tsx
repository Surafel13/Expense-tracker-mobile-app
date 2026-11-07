// ─────────────────────────────────────────────────────────────
// Add / Edit Transaction form
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from "react";
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

import { useTheme } from "@context/ThemeContext";
import { useTransactions } from "@context/TransactionsContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@constants/categories";
import { formatDateLabel, toYMD } from "@utils/date";
import { parseAmount } from "@utils/format";

import type { CategoryId, TransactionType } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AddTransaction">;

export default function AddTransactionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();

  const editingId = route.params?.transactionId;
  const editing = useMemo(
    () =>
      editingId ? transactions.find((t) => t.id === editingId) : undefined,
    [editingId, transactions],
  );
  const isEditMode = !!editing;

  // ── Form state ───────────────────────────────────────────
  const [type, setType] = useState<TransactionType>("expense");
  const [amountInput, setAmountInput] = useState("");
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill when editing
  useEffect(() => {
    if (!editing) return;
    setType(editing.type);
    setAmountInput(String(editing.amount));
    setCategory(editing.category);
    setDate(new Date(editing.date));
    setNote(editing.note ?? "");
    navigation.setOptions({
      title: "Edit Transaction",
    });
  }, [editing, navigation]);

  // Whenever type changes and current category is invalid, reset
  useEffect(() => {
    if (!category) return;
    const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!list.some((c) => c.id === category)) {
      setCategory(null);
    }
  }, [type, category]);

  // Default category when empty (first item in the current type)
  useEffect(() => {
    if (category) return;
    const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (list.length > 0) setCategory(list[0].id);
  }, [type, category]);

  const onTypeChange = (next: TransactionType) => {
    if (next === type) return;
    setType(next);
    // Category gets auto-reset by the effect above if needed
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    // Android fires twice (dismiss + set) — only handle "set"
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && selected) setDate(selected);
  };

  const onSave = async () => {
    setError(null);
    const amount = parseAmount(amountInput);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      setError("Please enter a positive amount.");
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }

    const payload = {
      type,
      amount,
      category,
      date: date.toISOString(),
      note: note.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (isEditMode && editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await addTransaction(payload);
      }
      navigation.goBack();
    } catch (e) {
      console.warn("[addTransaction] save failed:", e);
      setError("Could not save. Please try again.");
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    if (!editingId) return;
    Alert.alert("Delete transaction", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  const accent = type === "income" ? colors.income : colors.expense;

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
          {/* ── Type toggle ─────────────────────────────── */}
          <View
            style={[
              styles.toggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {(["expense", "income"] as TransactionType[]).map((opt) => {
              const active = type === opt;
              const optColor =
                opt === "income" ? colors.income : colors.expense;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => onTypeChange(opt)}
                  style={[
                    styles.toggleBtn,
                    active && {
                      backgroundColor: optColor,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      opt === "income" ? "arrow-down-circle" : "arrow-up-circle"
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
                    {opt === "income" ? "Income" : "Expense"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Amount ──────────────────────────────────── */}
          <View style={styles.amountBlock}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
              Amount
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
                  fontSize: 28,
                  fontWeight: "800",
                  height: 64,
                  textAlign: "left",
                }}
              />
            </View>
          </View>

          {/* ── Category ────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Category
          </Text>
          <CategoryPicker
            type={type}
            selected={category}
            onSelect={setCategory}
          />

          {/* ── Date ────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[
              styles.dateRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.text} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDateLabel(date)}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeDate}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}

          {/* ── Note ────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            Note (optional)
          </Text>
          <Input
            placeholder="e.g. Coffee with friends"
            value={note}
            onChangeText={setNote}
            maxLength={80}
          />

          {error ? (
            <Text style={{ color: colors.danger, marginBottom: 8 }}>
              {error}
            </Text>
          ) : null}

          {/* ── Actions ─────────────────────────────────── */}
          <Button
            label={isEditMode ? "Save changes" : "Add transaction"}
            onPress={onSave}
            loading={submitting}
            disabled={submitting}
            icon={isEditMode ? "checkmark" : "add"}
            style={{ marginTop: 8 }}
          />

          {isEditMode ? (
            <Button
              label="Delete transaction"
              variant="danger"
              icon="trash-outline"
              onPress={onDelete}
              style={{ marginTop: 12 }}
            />
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleLabel: { fontSize: 14, fontWeight: "700" },
  amountBlock: { marginBottom: 24 },
  amountLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  amountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currency: { fontSize: 28, fontWeight: "800" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  dateText: { fontSize: 15, fontWeight: "600" },
});
