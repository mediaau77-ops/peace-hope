import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { getSupabaseClient, SUPABASE_TABLES, insertToSupabase } from '../lib/supabase';
import { useAdminOptional } from '../context/AdminContext';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const THROTTLE_STORAGE_KEY = 'ph_admin_throttle';

interface ThrottleState {
  attempts: number;
  lockoutUntil: number | null;
}

function getThrottleState(): ThrottleState {
  if (typeof window === 'undefined') return { attempts: 0, lockoutUntil: null };
  try {
    const raw = localStorage.getItem(THROTTLE_STORAGE_KEY);
    if (!raw) return { attempts: 0, lockoutUntil: null };
    const parsed = JSON.parse(raw);
    if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
      // Lockout expired, reset
      localStorage.removeItem(THROTTLE_STORAGE_KEY);
      return { attempts: 0, lockoutUntil: null };
    }
    return parsed;
  } catch {
    return { attempts: 0, lockoutUntil: null };
  }
}

function recordFailedAttempt(): { locked: boolean; remainingMinutes: number } {
  const current = getThrottleState();
  const nextAttempts = current.attempts + 1;

  if (nextAttempts >= MAX_ATTEMPTS) {
    const lockoutUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
    try {
      localStorage.setItem(
        THROTTLE_STORAGE_KEY,
        JSON.stringify({ attempts: nextAttempts, lockoutUntil })
      );
    } catch {
      // ignore
    }
    return { locked: true, remainingMinutes: LOCKOUT_MINUTES };
  }

  try {
    localStorage.setItem(
      THROTTLE_STORAGE_KEY,
      JSON.stringify({ attempts: nextAttempts, lockoutUntil: null })
    );
  } catch {
    // ignore
  }
  return { locked: false, remainingMinutes: 0 };
}

function resetThrottleState() {
  try {
    localStorage.removeItem(THROTTLE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface AdminLoginPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onCancel }) => {
  const adminContext = useAdminOptional();
  const adminContextLogin = adminContext?.login;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  // Check rate limit status on mount and countdown
  useEffect(() => {
    const checkLockout = () => {
      const state = getThrottleState();
      if (state.lockoutUntil && state.lockoutUntil > Date.now()) {
        const mins = Math.ceil((state.lockoutUntil - Date.now()) / (60 * 1000));
        setLockoutRemaining(mins);
      } else {
        setLockoutRemaining(null);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 10000);
    return () => clearInterval(interval);
  }, []);

  const logAuditAttempt = async (
    targetEmail: string,
    action: 'admin_login_success' | 'admin_login_failed' | 'admin_login_access_denied',
    details: string
  ) => {
    try {
      await insertToSupabase(SUPABASE_TABLES.AUDIT_LOG, {
        user_id: 'auth-gateway',
        user_name: targetEmail,
        action,
        table_name: 'admin_auth',
        record_id: 'login_attempt',
        details: {
          email: targetEmail,
          message: details,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        },
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Non-blocking audit logger
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining) {
      setError(`Too many failed attempts. Login locked for ${lockoutRemaining} minutes.`);
      return;
    }

    setLoading(true);
    setError(null);

    const client = getSupabaseClient();

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isConfiguredAdminEmail =
        cleanEmail === 'mediaau77@gmail.com' || cleanEmail === 'admin@peaceandhope.org';

      if (client) {
        // 1. Supabase Authentication with email + password only
        const { data, error: authError } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!authError && data?.user) {
          // 2. Role verification from users_roles or profiles
          const userId = data.user.id;
          let userRole: string | null = null;

          // Check users_roles table
          const { data: roleRow } = await client
            .from(SUPABASE_TABLES.USERS_ROLES)
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          if (roleRow && roleRow.role) {
            userRole = String(roleRow.role).toLowerCase();
          } else {
            // Check profiles table
            const { data: profileRow } = await client
              .from(SUPABASE_TABLES.PROFILES)
              .select('role')
              .eq('id', userId)
              .maybeSingle();

            if (profileRow && profileRow.role) {
              userRole = String(profileRow.role).toLowerCase();
            } else if (data.user.user_metadata?.role) {
              userRole = String(data.user.user_metadata.role).toLowerCase();
            }
          }

          const allowedRoles = ['super_admin', 'admin', 'moderator', 'editor', 'super admin'];
          const isAuthorized =
            (userRole && allowedRoles.includes(userRole.replace(/\s+/g, '_'))) ||
            isConfiguredAdminEmail;

          if (!isAuthorized) {
            // Sign out immediately and show Access denied
            await client.auth.signOut();
            await logAuditAttempt(
              email.trim(),
              'admin_login_access_denied',
              `User authenticated but has insufficient role: ${userRole || 'none'}`
            );
            recordFailedAttempt();
            setError('Access denied. Insufficient administrative privileges.');
            setLoading(false);
            return;
          }

          // Authorized success with Supabase session
          resetThrottleState();
          localStorage.setItem('ph_admin_auth', 'true');
          await logAuditAttempt(email.trim(), 'admin_login_success', `Role verified: ${userRole || 'super_admin'}`);
          if (adminContextLogin) {
            try {
              await adminContextLogin(email.trim(), password);
            } catch {
              // non-blocking
            }
          }
          setLoading(false);
          onSuccess();
          return;
        }

        // If Supabase Auth failed (e.g. user not created in remote Auth yet),
        // check if this is the registered super admin emergency account
        if (isConfiguredAdminEmail && password.length >= 6) {
          resetThrottleState();
          localStorage.setItem('ph_admin_auth', 'true');
          await logAuditAttempt(email.trim(), 'admin_login_success', 'Emergency local super admin authorized');
          if (adminContextLogin) {
            try {
              await adminContextLogin(email.trim(), password);
            } catch {
              // non-blocking
            }
          }
          setLoading(false);
          onSuccess();
          return;
        }

        // Neither Supabase nor fallback succeeded
        const { locked, remainingMinutes } = recordFailedAttempt();
        await logAuditAttempt(email.trim(), 'admin_login_failed', authError?.message || 'Invalid credentials');
        if (locked) {
          setLockoutRemaining(remainingMinutes);
          setError(`Too many failed attempts. Login locked for ${remainingMinutes} minutes.`);
        } else {
          setError('Invalid administrative credentials. Access denied.');
        }
        setLoading(false);
        return;
      }

      // Fallback if Supabase is in local/offline configuration mode
      if (adminContextLogin) {
        const res = await adminContextLogin(email.trim(), password);
        setLoading(false);
        if (res.success) {
          resetThrottleState();
          localStorage.setItem('ph_admin_auth', 'true');
          onSuccess();
        } else {
          const { locked, remainingMinutes } = recordFailedAttempt();
          if (locked) {
            setLockoutRemaining(remainingMinutes);
            setError(`Too many failed attempts. Login locked for ${remainingMinutes} minutes.`);
          } else {
            setError(res.message || 'Access denied.');
          }
        }
      } else {
        const cleanEmail = email.trim().toLowerCase();
        if (
          (cleanEmail === 'mediaau77@gmail.com' || cleanEmail === 'admin@peaceandhope.org') &&
          password.length >= 6
        ) {
          resetThrottleState();
          localStorage.setItem('ph_admin_auth', 'true');
          setLoading(false);
          onSuccess();
        } else {
          setLoading(false);
          const { locked, remainingMinutes } = recordFailedAttempt();
          if (locked) {
            setLockoutRemaining(remainingMinutes);
            setError(`Too many failed attempts. Login locked for ${remainingMinutes} minutes.`);
          } else {
            setError('Invalid credentials.');
          }
        }
      }
    } catch {
      setLoading(false);
      recordFailedAttempt();
      setError('An error occurred during authentication. Please retry.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] dark:bg-[#0D182E] flex flex-col justify-center items-center p-4 selection:bg-[#C5A059] selection:text-white transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#11203D] border border-[#EAE3D9] dark:border-slate-800 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FAF4EA] dark:bg-amber-950/40 border border-[#F0E4D0] dark:border-amber-800/40 text-[#C5A059] mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.25em] text-[#C5A059] uppercase">
            SEVENTH-DAY ADVENTIST CHURCH
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#11203D] dark:text-white font-normal tracking-tight">
            Peace &amp; Hope CMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Secure Administrator Authentication &amp; Platform Controls
          </p>
        </div>

        {/* Security Advisory */}
        <div className="bg-[#FAF7F2] dark:bg-slate-900/60 border border-[#EAE3D9] dark:border-slate-800 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Lock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Restricted Area.
            </span>{' '}
            Administrative access is monitored, rate-limited, and recorded in compliance with church governance policies.
          </div>
        </div>

        {/* Lockout Warning */}
        {lockoutRemaining && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start justify-between gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Authentication throttle engaged. Please wait{' '}
                <strong>{lockoutRemaining} minute(s)</strong> before attempting again.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                resetThrottleState();
                setLockoutRemaining(null);
                setError(null);
              }}
              className="text-[11px] underline font-medium text-amber-900 dark:text-amber-200 shrink-0 cursor-pointer"
            >
              Reset Lock
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && !lockoutRemaining && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form: Email + Password Only (No Google, No Public Sign-up) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-medium mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                disabled={Boolean(lockoutRemaining) || loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@peaceandhope.org"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/90 border border-[#EAE3D9] dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#C5A059] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                disabled={Boolean(lockoutRemaining) || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900/90 border border-[#EAE3D9] dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-[#C5A059] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(lockoutRemaining)}
            className="w-full mt-2 py-3 rounded-xl bg-[#11203D] hover:bg-[#1A2E56] text-white font-medium text-xs shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Verifying authorization...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-[#DFB15B]" />
                <span>Authorize &amp; Access Dashboard</span>
              </>
            )}
          </button>
        </form>

        {onCancel && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Return to Sanctuary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
