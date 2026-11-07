import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@context/ThemeContext";
import { useAccounts } from "@context/AccountsContext";
import { getCategory } from "@constants/categories";
import { formatCurrency } from "@utils/format";
import { formatDateLabel } from "@utils/date";
import { TypeBadge } from "@components/TypeBadge";
import { Button } from "@components/Button";

import type { Transaction } from "@app-types/index";

interface TransactionDetailSheetProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const TransactionDetailSheet: React.FC<TransactionDetailSheetProps> = ({
  visible,
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { accountsWithBalance } = useAccounts();

  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(400);
      backdropOpacity.setValue(0);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 400,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, mounted, translateY, backdropOpacity]);

  const category = useMemo(() => {
    if (!transaction) return null;
    if (transaction.category) return getCategory(transaction.category);
    return {
      icon: "swap-horizontal",
      color: colors.primary,
      label: "Transfer",
      id: "other" as const,
      type: "expense" as const,
    };
  }, [transaction, colors.primary]);

  const accountName = useMemo(() => {
    if (!transaction) return "";
    if (transaction.type === "transfer") {
      const from = accountsWithBalance.find(
        (a) => a.id === transaction.fromAccountId,
      );
      const to = accountsWithBalance.find(
        (a) => a.id === transaction.toAccountId,
      );
      return `${from?.name ?? "—"} → ${to?.name ?? "—"}`;
    }
    if (!transaction.accountId) return "Other";
    const acc = accountsWithBalance.find((a) => a.id === transaction.accountId);
    return acc?.name ?? "Other";
  }, [transaction, accountsWithBalance]);

  const shouldRender = (visible || mounted) && !!transaction && !!category;

  if (!shouldRender) return null;

  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";
  const amountColor = isIncome
    ? colors.income
    : isTransfer
      ? colors.primary
      : colors.expense;
  const amountPrefix = isIncome ? "+" : isTransfer ? "" : "-";
  const title = transaction.note?.trim() || category.label;

  return (
    <Modal
      transparent
      visible={visible || mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.card,
            paddingBottom: Math.max(insets.bottom, 20) + 8,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <View style={styles.headerRow}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: `${category.color}22` },
            ]}
          >
            <Ionicons
              name={category.icon as any}
              size={26}
              color={category.color}
            />
          </View>

          <View style={styles.headerMid}>
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>
              {category.label}
            </Text>
          </View>

          <TypeBadge type={transaction.type} />
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.detailsGrid}>
          <DetailRow
            icon="calendar-outline"
            label="Date"
            value={formatDateLabel(transaction.date)}
            colors={colors}
          />
          <DetailRow
            icon="time-outline"
            label="Time"
            value={formatTime(transaction.createdAt)}
            colors={colors}
          />
          <DetailRow
            icon="wallet-outline"
            label="Type"
            value={
              transaction.type === "income"
                ? "Income"
                : transaction.type === "transfer"
                  ? "Transfer"
                  : "Expense"
            }
            colors={colors}
          />
          <DetailRow
            icon="card-outline"
            label={isTransfer ? "Between" : "Account"}
            value={accountName}
            colors={colors}
          />
        </View>

        {transaction.note?.trim() ? (
          <View style={styles.descriptionBlock}>
            <Text style={[styles.blockLabel, { color: colors.textMuted }]}>
              Description
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {transaction.note.trim()}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <Button
              label="Edit"
              icon="create-outline"
              variant="secondary"
              onPress={() => onEdit(transaction)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Delete"
              icon="trash-outline"
              variant="danger"
              onPress={() => onDelete(transaction)}
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: { text: string; textMuted: string };
}

const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  colors,
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
    </View>
    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
      {label}
    </Text>
    <Text
      style={[styles.detailValue, { color: colors.text }]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerMid: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  categoryLabel: { fontSize: 13, marginTop: 2 },
  amount: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
  },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  detailsGrid: { gap: 10, marginBottom: 14 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailIcon: { width: 22 },
  detailLabel: { fontSize: 13, fontWeight: "600", width: 74 },
  detailValue: { flex: 1, fontSize: 13, fontWeight: "600" },
  descriptionBlock: { marginBottom: 16 },
  blockLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  description: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 12 },
});
