import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { en } from "../locales/en";
import { tr } from "../locales/tr";

export type Language = "en" | "tr";

const translations = { en, tr };

// Fix: Update type definition for the translation function to support interpolation options.
type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined,
);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Fix: Update translation function to handle interpolation for dynamic values in strings.
  const t = useCallback(
    (key: string, options?: { [key: string]: string | number }): string => {
      const keys = key.split(".");

      const findTranslation = (lang: Language, keyParts: string[]) => {
        let result: any = translations[lang];
        for (const k of keyParts) {
          result = result?.[k];
          if (result === undefined) return undefined;
        }
        return result;
      };

      let result = findTranslation(language, keys);

      if (result === undefined) {
        console.warn(
          `Translation key not found: ${key} for language: ${language}. Falling back to 'en'.`,
        );
        result = findTranslation("en", keys);
        if (result === undefined) {
          console.error(`Fallback translation key not found: ${key}`);
          return key;
        }
      }

      if (options && typeof result === "string") {
        let str = result;
        Object.keys(options).forEach((optKey) => {
          str = str.replace(
            new RegExp(`\\{${optKey}\\}`, "g"),
            String(options[optKey]),
          );
        });
        return str;
      }

      return result as string;
    },
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export function useLocalization(): LocalizationContextType {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider",
    );
  }
  return context;
}
