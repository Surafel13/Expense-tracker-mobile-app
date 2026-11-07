// ─────────────────────────────────────────────────────────────
// Safe-area + themed screen wrapper
// ─────────────────────────────────────────────────────────────

import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@context/ThemeContext";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Apply bottom safe area padding (off for screens with a tab bar) */
  padBottom?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  padBottom = false,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: padBottom ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});
