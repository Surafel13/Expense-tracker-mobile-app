import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "@components/Screen";
import { Card } from "@components/Card";
import { useTheme } from "@context/ThemeContext";
import { useLanguage } from "@context/LanguageContext";
import { LANGUAGES } from "@constants/translations";
import type { TranslationKey } from "@constants/translations";
import type { ThemeMode } from "@storage/settings";

const THEME_OPTIONS: {
  mode: ThemeMode;
  labelKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { mode: "light", labelKey: "settings.themeLight", icon: "sunny-outline" },
  { mode: "dark", labelKey: "settings.themeDark", icon: "moon-outline" },
  {
    mode: "system",
    labelKey: "settings.themeSystem",
    icon: "phone-portrait-outline",
  },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>
          {t("settings.title")}
        </Text>

        {/* ── Appearance ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t("settings.appearance")}
          </Text>
          <Card padded={false} style={styles.card}>
            {THEME_OPTIONS.map((opt, idx) => {
              const active = mode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  activeOpacity={0.8}
                  onPress={() => setMode(opt.mode)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.row,
                    idx > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: `${colors.primary}1A` },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.native, { color: colors.text }]}>
                      {t(opt.labelKey)}
                    </Text>
                  </View>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={active ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </Card>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {t("settings.appearanceHint")}
          </Text>
        </View>

        {/* ── Language ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t("settings.language")}
          </Text>
          <Card padded={false} style={styles.card}>
            {LANGUAGES.map((l, idx) => {
              const active = language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  activeOpacity={0.8}
                  onPress={() => setLanguage(l.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.row,
                    idx > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: `${colors.primary}1A` },
                    ]}
                  >
                    <Ionicons
                      name="language-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.native, { color: colors.text }]}>
                      {l.nativeName}
                    </Text>
                    <Text style={[styles.sub, { color: colors.textMuted }]}>
                      {l.label}
                    </Text>
                  </View>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={active ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </Card>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {t("settings.languageHint")}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 24,
  },
  heading: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  section: { gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginLeft: 2,
  },
  card: { overflow: "hidden", borderRadius: 16 },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  native: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
  hint: { fontSize: 12, marginLeft: 4, lineHeight: 18 },
});
