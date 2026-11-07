import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@context/ThemeContext";

interface BalanceWarningBannerProps {
  message: string;
}

export const BalanceWarningBanner: React.FC<BalanceWarningBannerProps> = ({
  message,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: `${colors.danger}22` }]}>
      <Ionicons name="warning-outline" size={16} color={colors.danger} />
      <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  text: { flex: 1, fontSize: 13, fontWeight: "600" },
});
