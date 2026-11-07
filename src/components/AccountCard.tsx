import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { ACCOUNT_TYPES } from "@constants/accounts";
import { formatCurrency } from "@utils/format";
import type { AccountWithBalance } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface AccountCardProps {
  account: AccountWithBalance;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const meta = ACCOUNT_TYPES[account.type];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${meta.color}22` }]}>
        <Ionicons name={meta.icon as any} size={22} color={meta.color} />
      </View>
      <View style={styles.mid}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {account.name}
        </Text>
        <Text style={[styles.type, { color: colors.textMuted }]}>
          {t(`accountTypes.${account.type}`)}
        </Text>
      </View>
      <Text
        style={[
          styles.balance,
          { color: account.balance >= 0 ? colors.text : colors.danger },
        ]}
      >
        {formatCurrency(account.balance)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mid: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  type: { fontSize: 12, marginTop: 2 },
  balance: { fontSize: 16, fontWeight: "800" },
});
