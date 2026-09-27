import { getDbClient, SUPABASE_TABLES } from '../db/client';

export interface ThemeConfig {
  brand: {
    name: string;
    logoLightUrl: string;
    logoDarkUrl: string;
    faviconUrl: string;
  };
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    backgroundLight: string;
    backgroundDark: string;
    surfaceLight: string;
    surfaceDark: string;
    textLight: string;
    textDark: string;
    mutedLight: string;
    mutedDark: string;
    borderLight: string;
    borderDark: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Neutral Fallback Theme: Plain black/white/gray, system fonts, no branding.
 * Used strictly when no theme row exists in the database.
 */
export const NEUTRAL_FALLBACK_THEME: ThemeConfig = {
  brand: {
    name: '',
    logoLightUrl: '',
    logoDarkUrl: '',
    faviconUrl: '',
  },
  colors: {
    primary: '#000000',
    primaryForeground: '#FFFFFF',
    secondary: '#4B5563',
    secondaryForeground: '#FFFFFF',
    accent: '#4B5563',
    accentForeground: '#FFFFFF',
    backgroundLight: '#FFFFFF',
    backgroundDark: '#0A0A0A',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#121212',
    textLight: '#111827',
    textDark: '#F9FAFB',
    mutedLight: '#6B7280',
    mutedDark: '#9CA3AF',
    borderLight: '#E5E7EB',
    borderDark: '#262626',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  typography: {
    headingFont: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    bodyFont: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    baseSize: '16px',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

let cachedTheme: { config: ThemeConfig | null; expiresAt: number } | null = null;
let hasWarnedTheme = false;

export async function getThemeConfig(): Promise<ThemeConfig | null> {
  const now = Date.now();
  if (cachedTheme && cachedTheme.expiresAt > now) {
    return cachedTheme.config;
  }

  const supabase = getDbClient();
  try {
    // 1. Try key-value table: key = 'theme'
    const { data: kvData, error: kvError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('value')
      .eq('key', 'theme')
      .maybeSingle();

    if (!kvError && kvData?.value && typeof kvData.value === 'object') {
      const config = kvData.value as ThemeConfig;
      cachedTheme = { config, expiresAt: now + 60000 };
      return config;
    }

    // 2. Try single-row table: column 'theme'
    const { data: rowData, error: rowError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('theme, church_name, churchName, logo_url, favicon_url')
      .limit(1)
      .maybeSingle();

    if (!rowError && rowData?.theme && typeof rowData.theme === 'object') {
      const config = rowData.theme as ThemeConfig;
      cachedTheme = { config, expiresAt: now + 60000 };
      return config;
    }

    // No theme row exists in the database
    if (!hasWarnedTheme) {
      hasWarnedTheme = true;
      console.warn('[THEME WARNING] No theme configuration row found in Supabase. Returning null gracefully.');
    }

    cachedTheme = { config: null, expiresAt: now + 60000 };
    return null;
  } catch (err: any) {
    if (!hasWarnedTheme) {
      hasWarnedTheme = true;
      console.warn('[THEME WARNING] Could not query theme settings from Supabase; returning null gracefully:', err?.message || err);
    }
    cachedTheme = { config: null, expiresAt: now + 60000 };
    return null;
  }
}

export async function updateThemeConfig(updates: Partial<ThemeConfig>): Promise<ThemeConfig> {
  const current = (await getThemeConfig()) || NEUTRAL_FALLBACK_THEME;
  const nextConfig: ThemeConfig = {
    brand: { ...current.brand, ...(updates.brand || {}) },
    colors: { ...current.colors, ...(updates.colors || {}) },
    typography: { ...current.typography, ...(updates.typography || {}) },
    radius: { ...current.radius, ...(updates.radius || {}) },
    shadows: { ...current.shadows, ...(updates.shadows || {}) },
  };

  const supabase = getDbClient();
  try {
    // 1. Try upsert with key = 'theme'
    const { error: kvError } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .upsert(
        {
          key: 'theme',
          value: nextConfig,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (kvError) {
      // 2. Fallback single-row style
      const { data: existing } = await supabase
        .from(SUPABASE_TABLES.SETTINGS)
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from(SUPABASE_TABLES.SETTINGS)
          .update({ theme: nextConfig, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from(SUPABASE_TABLES.SETTINGS).insert({
          theme: nextConfig,
          created_at: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.error('[THEME ERROR] Failed to save theme to Supabase:', err);
    throw err;
  }

  cachedTheme = { config: nextConfig, expiresAt: Date.now() + 60000 };
  return nextConfig;
}
