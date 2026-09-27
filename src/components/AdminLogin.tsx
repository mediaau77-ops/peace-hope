import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAdmin();
  const [email, setEmail] = useState('mediaau77@gmail.com');
  const [password, setPassword] = useState('PeaceAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setLoading(false);
      setError('Authentication error. Please retry.');
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('mediaau77@gmail.com');
    setPassword('PeaceAdmin2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf9f6] flex flex-col justify-center items-center p-4 relative">
      {/* Container */}
      <div className="w-full max-w-md bg-white border border-[#e8e4db] rounded-3xl shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#fef9ee] border border-[#f5e6c8] text-[#b4832e] mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase">
            SEVENTH-DAY ADVENTIST CHURCH
          </div>
          <h1 className="font-serif text-2xl text-slate-900 font-normal tracking-tight">
            Peace &amp; Hope CMS
          </h1>
          <p className="text-xs text-slate-500">
            Secure Administrator Authentication &amp; Platform Controls
          </p>
        </div>

        {/* Notice */}
        <div className="bg-[#faf9f6] border border-[#ece8df] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
          <Lock className="w-4 h-4 text-[#b4832e] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">Restricted Access.</span> Session integrity is actively monitored and verified via Supabase Cloud.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@peaceandhope.org"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-semibold">
                Master Password
              </label>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-xs text-[#b4832e] hover:text-[#9c6a1e] font-medium"
              >
                Auto-fill Demo Pass
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#e8e4db] rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Remember workstation</span>
            </label>
            <span>TLS 1.3 Encrypted</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs tracking-wide shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <span>Sign In to Super Admin Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#ece8df] flex flex-col items-center gap-2 text-center text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
              window.location.search = '';
              window.location.pathname = '/';
            }}
            className="text-amber-800 dark:text-amber-500 hover:underline font-semibold cursor-pointer"
          >
            ← Return to Peace &amp; Hope Public Website
          </button>
          <span>Super Admin: allyhamedi fat &bull; Peace &amp; Hope Christian Church</span>
        </div>
      </div>
    </div>
  );
};
