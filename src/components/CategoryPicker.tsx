import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTheme } from "@context/ThemeContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@constants/categories";
import type { CategoryId, TransactionType } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface CategoryPickerProps {
  type: TransactionType;
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  type,
  selected,
  onSelect,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <View style={styles.grid}>
      {list.map((c) => {
        const isSelected = selected === c.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={({ pressed }) => [
              styles.item,
              {
                backgroundColor: isSelected ? `${c.color}22` : colors.surface,
                borderColor: isSelected ? c.color : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Ionicons
              name={c.icon as any}
              size={22}
              color={isSelected ? c.color : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: isSelected ? c.color : colors.text },
              ]}
              numberOfLines={1}
            >
              {t(`categories.${c.id}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  item: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  label: { fontSize: 12, fontWeight: "600", marginTop: 6 },
});
