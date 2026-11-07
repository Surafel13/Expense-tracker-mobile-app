// ─────────────────────────────────────────────────────────────
// Small section title row with optional right action
// ─────────────────────────────────────────────────────────────

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@context/ThemeContext";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onActionPress,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={[styles.action, { color: colors.primary }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  title: { fontSize: 18, fontWeight: "700" },
  action: { fontSize: 14, fontWeight: "600" },
});
