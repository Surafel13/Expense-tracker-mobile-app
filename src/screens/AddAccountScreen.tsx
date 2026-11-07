import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Screen } from "@components/Screen";
import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { useTheme } from "@context/ThemeContext";
import { useAccounts } from "@context/AccountsContext";
import { useTransactions } from "@context/TransactionsContext";
import { ACCOUNT_TYPE_LIST } from "@constants/accounts";
import { parseAmount } from "@utils/format";

import type { AccountType } from "@app-types/index";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AddAccount">;

export default function AddAccountScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors, resolvedScheme } = useTheme();
  const isDark = resolvedScheme === "dark";
  const { addAccount, updateAccount, deleteAccount, getAccount } =
    useAccounts();
  const { transactions } = useTransactions();

  const editingId = route.params?.accountId;
  const editing = editingId ? getAccount(editingId) : undefined;
  const isEditMode = !!editing;

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("cash");
  const [openingBalance, setOpeningBalance] = useState("");
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
      title: isEditMode ? "Edit Account" : "New Account",
    });
  }, [navigation, isEditMode]);

  const onSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Account name is required.");
      return;
    }
    const opening = parseAmount(openingBalance || "0");
    if (Number.isNaN(opening)) {
      setError("Opening balance must be a number.");
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
      setError("Could not save account.");
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
      "Delete account",
      linked > 0
        ? `This account has ${linked} transaction(s). They will remain in history but this account will be removed.`
        : "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Account Name
          </Text>
          <Input
            placeholder="e.g. Main Bank, Wallet"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Account Type
          </Text>
          <View style={styles.typesGrid}>
            {ACCOUNT_TYPE_LIST.map((meta) => {
              const active = type === meta.id;
              return (
                <TouchableOpacity
                  key={meta.id}
                  activeOpacity={0.8}
                  onPress={() => setType(meta.id)}
                  style={[
                    styles.typeItem,
                    {
                      backgroundColor: active
                        ? `${meta.color}18`
                        : colors.surface,
                      borderColor: active ? meta.color : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.typeIconBadge,
                      {
                        backgroundColor: active
                          ? `${meta.color}25`
                          : isDark
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.04)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={meta.icon as any}
                      size={18}
                      color={active ? meta.color : colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: active ? meta.color : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            Opening Balance
          </Text>
          <Input
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={openingBalance}
            onChangeText={setOpeningBalance}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAllowNegative((v) => !v)}
          style={[
            styles.toggleRow,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.toggleTextWrap}>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Allow negative balance
            </Text>
            <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
              Useful for credit cards or overdraft accounts
            </Text>
          </View>
          <Ionicons
            name={allowNegative ? "checkbox" : "square-outline"}
            size={24}
            color={allowNegative ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>

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
            label={isEditMode ? "Save changes" : "Create account"}
            icon={isEditMode ? "checkmark" : "add"}
            onPress={onSave}
            loading={submitting}
            disabled={submitting}
          />

          {isEditMode ? (
            <Button
              label="Delete account"
              variant="danger"
              icon="trash-outline"
              onPress={onDelete}
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    gap: 18,
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
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeItem: {
    width: "48.3%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  typeIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  toggleSub: {
    fontSize: 12,
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
    marginTop: 6,
  },
});
