import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  theme_preference?: 'light' | 'dark' | 'system';
  language_preference?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await apiGet<UserProfile | null>('/api/users/me');
      if (data) {
        setUser({
          ...data,
          user_metadata: {
            full_name: data.full_name,
            name: data.full_name,
            avatar_url: data.avatar_url,
            picture: data.avatar_url,
          },
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiPost<{ user: UserProfile; session: any }>('/api/auth/signin', {
        email,
        password,
      });
      if (res?.user) {
        setUser(res.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await apiPost('/api/auth/signup', {
        email,
        password,
        fullName,
      });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const returnUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/';
      const data = await apiGet<{ url: string }>(`/api/auth/google/url?returnUrl=${encodeURIComponent(returnUrl)}`);
      if (data?.url) {
        window.location.href = data.url;
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await apiPost('/api/auth/signout');
    } catch {
      // Non-blocking
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ph_auth_token');
      }
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser: fetchCurrentUser,
  };
}
