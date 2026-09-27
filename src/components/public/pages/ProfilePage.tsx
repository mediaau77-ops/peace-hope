import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Heart, LogOut, CheckCircle2 } from 'lucide-react';
import { PageHero } from '../PageHero';
import { useAuth } from '../../../hooks/useAuth';
import { apiPatch } from '../../../lib/api-client';

interface ProfilePageProps {
  onSignOut: () => void;
  onNavigateAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSignOut, onNavigateAuth }) => {
  const { user, loading, signOut } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName((user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || '');
      setPhone((user.user_metadata as any)?.phone || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Member Sign-In Required
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Please log in to manage your profile and view your church activities.
        </p>
        <button
          type="button"
          onClick={onNavigateAuth}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiPatch('/api/users/me', {
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutClick = async () => {
    await signOut();
    onSignOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Member Profile & Sanctuary Portal"
        subtitle={`Welcome back, ${fullName || user.email}`}
        badge="My Sanctuary Account"
        breadcrumbs={[{ label: 'Profile' }]}
        action={
          <button
            type="button"
            onClick={handleSignOutClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-600 to-amber-400 text-slate-950 font-serif font-bold text-2xl flex items-center justify-center">
                {(fullName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  {fullName || 'Church Member'}
                </h3>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 w-fit">
              Role: {(user.user_metadata as any)?.role || 'Member'}
            </span>
          </div>

          {saved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Update Info Form */}
          <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
            <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Personal Information
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 78..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
