import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@constants/index";
import type { Language } from "@constants/translations";

export async function getLanguage(): Promise<Language> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return raw === "am" || raw === "en" ? raw : "en";
  } catch (err) {
    console.warn("[storage] getLanguage failed:", err);
    return "en";
  }
}

export async function setLanguage(lang: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (err) {
    console.warn("[storage] setLanguage failed:", err);
    throw err;
  }
}

export type ThemeMode = "light" | "dark" | "system";

const DEFAULT_MODE: ThemeMode = "system";

/** Read the stored theme preference */
export async function getThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return DEFAULT_MODE;
  } catch (err) {
    console.warn("[storage] getThemeMode failed:", err);
    return DEFAULT_MODE;
  }
}

/** Persist a theme preference */
export async function setThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
  } catch (err) {
    console.warn("[storage] setThemeMode failed:", err);
    throw err;
  }
}
