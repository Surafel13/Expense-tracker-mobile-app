import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";
import { getCategory } from "@constants/categories";
import type { CategoryId } from "@app-types/index";
import { useLanguage } from "@context/LanguageContext";

interface CategoryChipProps {
  categoryId: CategoryId;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  categoryId,
  selected = false,
  onPress,
  compact = false,
}) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const category = getCategory(categoryId);

  const bg = selected ? category.color : colors.surface;
  const fg = selected ? "#FFFFFF" : colors.text;

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: bg,
          borderColor: selected ? category.color : colors.border,
          paddingVertical: compact ? 6 : 8,
          paddingHorizontal: compact ? 10 : 12,
        },
      ]}
    >
      <Ionicons
        name={category.icon as any}
        size={compact ? 14 : 16}
        color={fg}
      />
      <Text style={[styles.label, { color: fg, fontSize: compact ? 12 : 13 }]}>
        {t(`categories.${categoryId}`)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={4}>
        {content}
      </Pressable>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  label: { fontWeight: "600" },
});
