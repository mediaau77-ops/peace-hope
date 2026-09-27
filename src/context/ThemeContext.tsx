import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPatch } from '../lib/api-client';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

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

export const NEUTRAL_DEFAULT_THEME = NEUTRAL_FALLBACK_THEME;

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  updateTheme: (updates: Partial<ThemeConfig>) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_preference';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeVariables(config: ThemeConfig, mode: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (mode === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  const { colors, typography, radius } = config;

  // Semantic variables mapped to Tailwind
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);

  if (mode === 'dark') {
    root.style.setProperty('--color-background', colors.backgroundDark);
    root.style.setProperty('--color-surface', colors.surfaceDark);
    root.style.setProperty('--color-foreground', colors.textDark);
    root.style.setProperty('--color-muted', colors.mutedDark);
    root.style.setProperty('--color-border', colors.borderDark);
  } else {
    root.style.setProperty('--color-background', colors.backgroundLight);
    root.style.setProperty('--color-surface', colors.surfaceLight);
    root.style.setProperty('--color-foreground', colors.textLight);
    root.style.setProperty('--color-muted', colors.mutedLight);
    root.style.setProperty('--color-border', colors.borderLight);
  }

  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);

  if (radius) {
    root.style.setProperty('--radius-sm', radius.sm);
    root.style.setProperty('--radius-md', radius.md);
    root.style.setProperty('--radius-lg', radius.lg);
    root.style.setProperty('--radius-xl', radius.xl);
  }

  if (typography) {
    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);
  }

  if (config.brand?.faviconUrl) {
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = config.brand.faviconUrl;
    }
  }
}

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}> = ({ children, defaultTheme = 'light' }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored as ThemeMode;
        }
      } catch {
        // ignore
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (themeMode === 'system') {
      return getSystemTheme();
    }
    return themeMode === 'dark' ? 'dark' : 'light';
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(NEUTRAL_DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  // Fetch backend-provided theme configuration from /api/theme
  const fetchBackendTheme = useCallback(async () => {
    try {
      const data = await apiGet<ThemeConfig>('/api/theme');
      if (data && data.colors) {
        setThemeConfig(data);
        const activeResolved = themeMode === 'system' ? getSystemTheme() : themeMode === 'dark' ? 'dark' : 'light';
        applyThemeVariables(data, activeResolved);
      }
    } catch (err) {
      console.debug('[THEME] Backend theme fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [themeMode]);

  useEffect(() => {
    fetchBackendTheme();
  }, [fetchBackendTheme]);

  useEffect(() => {
    let resolved: ResolvedTheme = 'light';
    if (themeMode === 'system') {
      resolved = getSystemTheme();
    } else {
      resolved = themeMode;
    }
    setResolvedTheme(resolved);
    applyThemeVariables(themeConfig, resolved);

    try {
      localStorage.setItem(STORAGE_KEY, themeMode);
    } catch {
      // ignore
    }

    // Non-blocking sync with backend user profile only if user has an active session
    if (typeof document !== 'undefined' && (document.cookie.includes('sb-') || localStorage.getItem('ph_auth_token'))) {
      apiPatch('/api/users/me', { theme_preference: themeMode }).catch(() => {});
    }
  }, [themeMode, themeConfig]);

  // System preference media query listener
  useEffect(() => {
    if (themeMode !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newResolved = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyThemeVariables(themeConfig, newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, themeConfig]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeModeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      const current = prev === 'system' ? getSystemTheme() : prev;
      return current === 'light' ? 'dark' : 'light';
    });
  };

  const updateTheme = async (updates: Partial<ThemeConfig>) => {
    const updated = await apiPatch<ThemeConfig>('/api/theme', updates);
    setThemeConfig(updated);
    applyThemeVariables(updated, resolvedTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themeMode,
        resolvedTheme,
        themeConfig,
        setTheme,
        toggleTheme,
        updateTheme,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      resolvedTheme: 'light',
      themeConfig: NEUTRAL_DEFAULT_THEME,
      setTheme: () => {},
      toggleTheme: () => {},
      updateTheme: async () => {},
      loading: false,
    };
  }
  return context;
};
