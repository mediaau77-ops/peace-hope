import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet, apiPatch } from '../lib/api-client';

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

interface ThemeContextType {
  theme: ThemeConfig | null;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  updateTheme: (updates: Partial<ThemeConfig>) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyThemeVariables(theme: ThemeConfig, mode: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Toggle .dark class
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const { colors, typography, radius } = theme;

  // Brand colors
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-foreground', colors.primaryForeground);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-foreground', colors.secondaryForeground);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-foreground', colors.accentForeground);

  // Dynamic light/dark semantic tokens
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

  // Utility colors
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);

  // Radius
  if (radius) {
    root.style.setProperty('--radius-sm', radius.sm);
    root.style.setProperty('--radius-md', radius.md);
    root.style.setProperty('--radius-lg', radius.lg);
    root.style.setProperty('--radius-xl', radius.xl);
  }

  // Typography
  if (typography) {
    root.style.setProperty('--font-heading', typography.headingFont);
    root.style.setProperty('--font-body', typography.bodyFont);
  }

  // Favicon update if provided
  if (theme.brand?.faviconUrl) {
    const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = theme.brand.faviconUrl;
    }
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setModeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ph_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const fetchTheme = useCallback(async () => {
    try {
      const data = await apiGet<ThemeConfig>('/api/theme');
      setTheme(data);
      applyThemeVariables(data, mode);
    } catch (err) {
      console.debug('[THEME] Using fallback styles:', err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    if (theme) {
      applyThemeVariables(theme, mode);
    }
    localStorage.setItem('ph_theme_mode', mode);
  }, [mode, theme]);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setMode = useCallback((newMode: 'light' | 'dark') => {
    setModeState(newMode);
  }, []);

  const updateTheme = useCallback(async (updates: Partial<ThemeConfig>) => {
    try {
      const updated = await apiPatch<ThemeConfig>('/api/theme', updates);
      setTheme(updated);
      applyThemeVariables(updated, mode);
    } catch (err) {
      console.error('[THEME] Failed to update theme:', err);
      throw err;
    }
  }, [mode]);

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, mode, toggleTheme, setMode, updateTheme, loading } },
    children
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
