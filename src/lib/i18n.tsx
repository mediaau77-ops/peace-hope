import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enMessages from '../messages/en.json';
import frMessages from '../messages/fr.json';
import rwMessages from '../messages/rw.json';
import { getSupabaseClient, SUPABASE_TABLES } from './supabase';

export type Locale = 'en' | 'rw' | 'fr' | string;

export type TranslationKey = keyof typeof enMessages;

const translationsMap: Record<string, Record<string, string>> = {
  en: enMessages,
  fr: frMessages,
  rw: rwMessages,
};

// RTL language codes if extended in future (e.g., ar, he, ur)
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur']);

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: string | Date | number) => string;
  formatNumber: (num: number) => string;
  isRtl: boolean;
  direction: 'ltr' | 'rtl';
  supportedLanguages: { code: string; name: string; nativeName: string }[];
}

const DEFAULT_SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'ph_public_locale';

export const I18nProvider: React.FC<{
  children: React.ReactNode;
  defaultLocale?: Locale;
  supportedLocales?: string[];
}> = ({ children, defaultLocale = 'en' }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'en' || saved === 'rw' || saved === 'fr')) {
          return saved;
        }
      } catch {
        // ignore
      }
    }
    return defaultLocale;
  });

  const syncLanguageWithProfile = useCallback(async (newLocale: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .update({ language_preference: newLocale })
          .eq('id', user.id);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLocale);
      } catch {
        // ignore
      }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = RTL_LOCALES.has(newLocale) ? 'rtl' : 'ltr';
    }
    syncLanguageWithProfile(newLocale);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
    }
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const currentDict = translationsMap[locale] || translationsMap.en;
      let text = currentDict[key] || translationsMap.en[key] || key;
      if (params) {
        Object.entries(params).forEach(([pKey, pVal]) => {
          text = text.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
        });
      }
      return text;
    },
    [locale]
  );

  const formatDate = useCallback(
    (dateVal: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
        if (isNaN(d.getTime())) return '';
        const intlLocale = locale === 'rw' ? 'rw-RW' : locale === 'fr' ? 'fr-FR' : 'en-US';
        const defaultOpts: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        };
        return new Intl.DateTimeFormat(intlLocale, options || defaultOpts).format(d);
      } catch {
        return String(dateVal);
      }
    },
    [locale]
  );

  const formatTime = useCallback(
    (dateVal: string | Date | number): string => {
      try {
        const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
        if (isNaN(d.getTime())) return '';
        const intlLocale = locale === 'rw' ? 'rw-RW' : locale === 'fr' ? 'fr-FR' : 'en-US';
        return new Intl.DateTimeFormat(intlLocale, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(d);
      } catch {
        return '';
      }
    },
    [locale]
  );

  const formatNumber = useCallback(
    (num: number): string => {
      try {
        const intlLocale = locale === 'rw' ? 'rw-RW' : locale === 'fr' ? 'fr-FR' : 'en-US';
        return new Intl.NumberFormat(intlLocale).format(num);
      } catch {
        return String(num);
      }
    },
    [locale]
  );

  const isRtl = RTL_LOCALES.has(locale);
  const direction = isRtl ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatTime,
        formatNumber,
        isRtl,
        direction,
        supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: TranslationKey) => translationsMap.en[key] || key,
      formatDate: (d) => String(d),
      formatTime: () => '',
      formatNumber: (n) => String(n),
      isRtl: false,
      direction: 'ltr',
      supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
    };
  }
  return ctx;
};

/**
 * Universal helper for reading translatable fields from Supabase JSONB column `translations`.
 * Strategy: { "en": { "title": "..." }, "fr": { ... }, "rw": { ... } }
 * If the active locale translation is missing, gracefully falls back to English.
 */
export function getTranslatedField<T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  locale: Locale = 'en',
  fallbackToEn: boolean = true
): string {
  if (!item) return '';

  // 1. Check item.translations[locale][field]
  if (item.translations && typeof item.translations === 'object') {
    const localeObj = item.translations[locale];
    if (localeObj && typeof localeObj === 'object' && localeObj[field]) {
      return String(localeObj[field]);
    }

    // 2. Fallback to item.translations['en'][field]
    if (fallbackToEn && locale !== 'en') {
      const enObj = item.translations['en'];
      if (enObj && typeof enObj === 'object' && enObj[field]) {
        return String(enObj[field]);
      }
    }
  }

  // 3. Fallback to direct field on item
  if (item[field] !== undefined && item[field] !== null) {
    return String(item[field]);
  }

  return '';
}
