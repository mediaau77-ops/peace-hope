import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PageHero } from '../PageHero';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../lib/i18n';

interface AuthPagesProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess?: () => void;
  onNavigateMode?: (mode: 'login' | 'register' | 'forgot') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigateMode,
}) => {
  const { t } = useI18n();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /**
   * Primary: Continue with Google OAuth via backend
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  /**
   * Secondary: Email + Password submission via backend
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) throw error;
        onSuccess?.();
      } else if (mode === 'register') {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) throw error;
        setSuccessMsg('Account created successfully! You may now sign in.');
        setMode('login');
      } else if (mode === 'forgot') {
        setSuccessMsg('Password reset instructions will be sent if an account matches this email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Sign In to Your Member Sanctuary',
    register: 'Create a Member Account',
    forgot: 'Reset Your Password',
  };

  const subtitles = {
    login: 'Access prayer wall updates, saved Bible bookmarks, and fellowship circles.',
    register: 'Join our digital community to engage with teachings, ministries, and events.',
    forgot: 'Enter your registered email and we will send you a password recovery link.',
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D182E] pb-24 transition-colors">
      <PageHero
        title={titles[mode]}
        subtitle={subtitles[mode]}
        badge="Community Portal"
        breadcrumbs={[{ label: 'Member Account' }]}
      />

      <div className="max-w-md mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white dark:bg-[#11203D] rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#EAE3D9] dark:border-slate-800 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 hover:underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* PRIMARY ACTION: Continue with Google (Login & Register) */}
          {/* ------------------------------------------------------------- */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-3.5 px-4 rounded-2xl border border-[#EAE3D9] dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-[#FAF7F2] dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Google multi-color G SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : t('google_continue')}</span>
              </button>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#EAE3D9] dark:border-slate-800" />
                <span className="absolute bg-white dark:bg-[#11203D] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  {t('or_divider')}
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* SECONDARY ACTION: Email + Password Form */}
          {/* ------------------------------------------------------------- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sister Grace & Brother John"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="believer@sanctuary.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#C5A059] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-[#C5A059] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 rounded-xl bg-[#11203D] hover:bg-[#1A2E56] text-white font-medium text-xs shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In with Email'
                  : mode === 'register'
                  ? 'Create Member Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Navigation Mode Switcher */}
          <div className="pt-4 border-t border-[#EAE3D9] dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    onNavigateMode?.('register');
                  }}
                  className="text-[#C5A059] font-semibold hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    onNavigateMode?.('login');
                  }}
                  className="text-[#C5A059] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
