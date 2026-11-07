// ─────────────────────────────────────────────────────────────
// Rounded surface card
// ─────────────────────────────────────────────────────────────

import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padded = true,
}) => {
  const { colors } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: padded ? 16 : 0,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          { opacity: pressed ? 0.9 : 1 },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
