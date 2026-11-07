import {
  TRANSLATIONS,
  type Language,
  type TranslationKey,
} from "@constants/translations";

type Params = Record<string, string | number>;

let currentLanguage: Language = "en";

export const getCurrentLanguage = (): Language => currentLanguage;
export const setCurrentLanguage = (lang: Language): void => {
  currentLanguage = lang;
};

export function translate(
  lang: Language,
  key: TranslationKey,
  params?: Params,
): string {
  let str: string = TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
  if (params) {
    for (const k of Object.keys(params)) {
      str = str.split(`{${k}}`).join(String(params[k]));
    }
  }
  return str;
}

/** Translate using the currently active language (for non-React code) */
export const tr = (key: TranslationKey, params?: Params): string =>
  translate(currentLanguage, key, params);
