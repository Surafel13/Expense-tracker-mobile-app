import React from "react";
import {
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
import { AccountCard } from "@components/AccountCard";
import { EmptyState } from "@components/EmptyState";
import { Card } from "@components/Card";

import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { useAccounts } from "@context/AccountsContext";
import { formatCurrency } from "@utils/format";
import type { RootStackParamList } from "@app-types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AccountsScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { accountsWithBalance, isReady } = useAccounts();

  const total = accountsWithBalance.reduce((s, a) => s + a.balance, 0);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t("accounts.total")}
            </Text>
            <Text style={[styles.total, { color: colors.text }]}>
              {formatCurrency(total)}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddAccount", {})}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {!isReady ? (
            <Card>
              <Text style={{ color: colors.textMuted }}>
                {t("common.loading")}
              </Text>
            </Card>
          ) : accountsWithBalance.length === 0 ? (
            <Card>
              <EmptyState
                icon="wallet-outline"
                title={t("accounts.emptyTitle")}
                subtitle={t("accounts.emptySub")}
              />
            </Card>
          ) : (
            accountsWithBalance.map((a) => (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("AccountDetail", { accountId: a.id })
                }
              >
                <AccountCard account={a} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Screen>
  );
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
  subtitle: { fontSize: 12, fontWeight: "600" },
  total: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
});
