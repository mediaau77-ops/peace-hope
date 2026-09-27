import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Shield,
  LogOut,
  Database,
  RefreshCw,
  Sun,
  Moon,
  Search,
  Lock,
  Menu,
  X,
  Globe,
} from 'lucide-react';

interface AdminHeaderProps {
  onViewPublic?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onViewPublic }) => {
  const {
    currentUser,
    logout,
    streamState,
    setActiveTab,
    activeTab,
    isSupabaseActive,
    supabaseSyncStatus,
    syncAllWithSupabase,
    theme,
    toggleTheme,
    globalSearchQuery,
    setGlobalSearchQuery,
    toggleMobileNav,
  } = useAdmin();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Friendly title mapping for current module breadcrumb
  const moduleNames: Record<string, string> = {
    overview: 'Overview',
    homepage: 'Homepage',
    teachings: 'Teachings',
    sermons: 'Sermons',
    devotionals: 'Devotionals',
    prayers: 'Prayer Requests',
    testimonies: 'Testimonies',
    events: 'Events',
    announcements: 'Announcements',
    live: 'Livestreams',
    bible: 'Holy Bible',
    chat: 'Chat Management',
    meetings: 'Meet Call Management',
    users: 'Users & Roles',
    settings: 'Settings',
    audit: 'Audit Log',
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-[#ece8df] dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 select-none shadow-xs z-20 transition-colors">
      {/* Left: Mobile Drawer Trigger + Brand Identity */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu on Mobile/Tablet */}
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Golden Shield Icon */}
        <div className="text-amber-500">
          <Shield className="w-6 h-6 stroke-[1.75] fill-amber-500/10 text-amber-500" />
        </div>

        <div className="flex flex-col">
          <span className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[140px] sm:max-w-none">
            Peace &amp; Hope
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-bold tracking-[0.22em] text-[#b4832e] dark:text-amber-400 uppercase">
              ADMIN CMS
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="hidden sm:inline text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {moduleNames[activeTab] || 'Dashboard'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar (Desktop) */}
      <div className="hidden md:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search across all modules & content..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#b4832e] transition-all"
          />
        </div>
      </div>

      {/* Mobile Search Toggle (Mobile only) */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-16 bg-white dark:bg-slate-900 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-lg z-30 md:hidden animate-in fade-in slide-in-from-top-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search content..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 min-h-[44px] min-w-[44px] text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Right: Telemetry & User Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon Button */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* View Public Website */}
        <button
          onClick={onViewPublic || (() => { window.location.hash = ''; window.location.reload(); })}
          title="View Public Church Website"
          className="p-2 min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-400 font-medium text-xs transition-colors cursor-pointer"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden lg:inline">View Public Site</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* E2EE Shield Indicator (Desktop) */}
        <div
          title="Web Crypto E2EE Private Messaging Enabled"
          className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[10px] font-mono font-medium"
        >
          <Lock className="w-3 h-3 text-sky-600" />
          <span>E2EE Active</span>
        </div>

        {/* Supabase Cloud Storage Status Indicator */}
        <button
          onClick={() => syncAllWithSupabase()}
          title={`Supabase: ${supabaseSyncStatus}. Click to sync.`}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
            isSupabaseActive
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono text-[10px] hidden md:inline">
            {isSupabaseActive ? 'Supabase Synced' : 'Supabase Ready'}
          </span>
          <RefreshCw className="w-2.5 h-2.5 text-slate-400 hover:rotate-180 transition-transform" />
        </button>

        {/* Live Broadcast Indicator Pill */}
        {streamState.isLive && (
          <button
            onClick={() => setActiveTab('live')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="hidden sm:inline">LIVE</span> ({streamState.viewersCount})
          </button>
        )}

        {/* User Profile & Role */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[120px]">
            {currentUser?.name || 'Administrator'}
          </div>
          <span className="text-[9px] font-mono font-semibold text-[#b4832e] dark:text-amber-400">
            {currentUser?.role || 'Super Admin'}
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shadow-xs"
          title="Sign out of Admin Console"
        >
          <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-[1.75]" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

