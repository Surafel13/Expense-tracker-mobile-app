import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { ACCOUNT_TYPES, UNTRACKED_ACCOUNT_ID } from "@constants/accounts";
import type { AccountWithBalance } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface AccountPickerProps {
  accounts: AccountWithBalance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  includeUntracked?: boolean;
  excludeId?: string | null;
}

export const AccountPicker: React.FC<AccountPickerProps> = ({
  accounts,
  selectedId,
  onSelect,
  includeUntracked = false,
  excludeId = null,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const items = accounts.filter((a) => a.id !== excludeId);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((a) => {
        const meta = ACCOUNT_TYPES[a.type];
        const active = selectedId === a.id;
        return (
          <TouchableOpacity
            key={a.id}
            onPress={() => onSelect(a.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? `${meta.color}22` : colors.surface,
                borderColor: active ? meta.color : colors.border,
              },
            ]}
          >
            <Ionicons
              name={meta.icon as any}
              size={16}
              color={active ? meta.color : colors.textMuted}
            />
            <View>
              <Text
                style={[
                  styles.name,
                  { color: active ? meta.color : colors.text },
                ]}
                numberOfLines={1}
              >
                {a.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {includeUntracked ? (
        <TouchableOpacity
          onPress={() => onSelect(UNTRACKED_ACCOUNT_ID)}
          style={[
            styles.chip,
            {
              backgroundColor:
                selectedId === UNTRACKED_ACCOUNT_ID
                  ? `${colors.textMuted}22`
                  : colors.surface,
              borderColor:
                selectedId === UNTRACKED_ACCOUNT_ID
                  ? colors.textMuted
                  : colors.border,
            },
          ]}
        >
          <Ionicons
            name="help-circle-outline"
            size={16}
            color={
              selectedId === UNTRACKED_ACCOUNT_ID
                ? colors.textMuted
                : colors.textMuted
            }
          />
          <Text
            style={[
              styles.name,
              {
                color:
                  selectedId === UNTRACKED_ACCOUNT_ID
                    ? colors.text
                    : colors.textMuted,
              },
            ]}
          >
            {t("common.other")}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 100,
  },
  name: { fontSize: 13, fontWeight: "700" },
});
