import { useState, useEffect } from 'react';
import { apiGet } from '../lib/api-client';
import { PublicSettings } from '../types/public';

/**
 * Neutral fallback settings: Plain, unbranded, neutral colors, no mock content.
 */
export const NEUTRAL_PUBLIC_SETTINGS: PublicSettings = {
  churchName: '',
  siteName: '',
  logoUrl: undefined,
  tagline: '',
  missionStatement: '',
  primaryColor: '#000000',
  accentColor: '#4b5563',
  contactEmail: '',
  contactPhone: '',
  address: '',
  country: '',
  verse_reference: '',
};

export const DEFAULT_PUBLIC_SETTINGS = NEUTRAL_PUBLIC_SETTINGS;

// Singleton cache for settings across all components
let cachedSettings: PublicSettings | null = null;
let isFetchingSettings = false;
const settingsListeners = new Set<(settings: PublicSettings | null) => void>();

export function usePublicSettings(): {
  settings: PublicSettings | null;
  loading: boolean;
  error: Error | null;
} {
  const [settings, setSettings] = useState<PublicSettings | null>(cachedSettings);
  const [loading, setLoading] = useState<boolean>(!cachedSettings);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const listener = (newSettings: PublicSettings | null) => {
      if (isMounted) {
        setSettings(newSettings);
        setLoading(false);
      }
    };
    settingsListeners.add(listener);

    if (cachedSettings !== null) {
      setSettings(cachedSettings);
      setLoading(false);
      return () => {
        settingsListeners.delete(listener);
      };
    }

    if (!isFetchingSettings) {
      isFetchingSettings = true;
      apiGet<PublicSettings | null>('/api/settings/public')
        .then((data) => {
          cachedSettings = data || null;
          settingsListeners.forEach((l) => l(cachedSettings));
        })
        .catch((err) => {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error(String(err)));
          }
          cachedSettings = null;
          settingsListeners.forEach((l) => l(null));
        })
        .finally(() => {
          isFetchingSettings = false;
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
      settingsListeners.delete(listener);
    };
  }, []);

  return { settings, loading, error };
}
