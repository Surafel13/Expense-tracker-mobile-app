import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Language, TranslationKey } from "@constants/translations";
import { getLanguage, setLanguage as persistLanguage } from "@storage/settings";
import { setCurrentLanguage, translate } from "@utils/i18n";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await getLanguage();
      if (!cancelled) {
        setCurrentLanguage(saved);
        setLanguageState(saved);
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the module-level language in sync *during render* so date helpers
  // and validators used by children always see the right language.
  setCurrentLanguage(language);

  const setLanguage = useCallback(async (next: Language) => {
    setCurrentLanguage(next);
    setLanguageState(next);
    try {
      await persistLanguage(next);
    } catch (err) {
      console.warn("[i18n] failed to persist language:", err);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, isReady }),
    [language, setLanguage, t, isReady],
  );

  // Avoid a flash of English before the saved language loads
  if (!isReady) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
