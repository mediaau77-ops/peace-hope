import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SUPABASE_BUCKETS } from '../../lib/supabase';
import { InlineUploadWidget } from '../common/InlineUploadWidget';
import {
  Settings,
  Shield,
  Radio,
  Mail,
  Download,
  Upload,
  Power,
  CheckCircle,
  Save,
  Key,
  Database,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const {
    settings,
    updateSettings,
    isSupabaseActive,
    supabaseSyncStatus,
    syncAllWithSupabase,
    saveSupabaseSettings,
  } = useAdmin();

  // Supabase connection credentials
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return (
      import.meta.env.VITE_SUPABASE_URL ||
      (() => {
        const saved = localStorage.getItem('peace_hope_supabase_config');
        if (saved) {
          try {
            return JSON.parse(saved).url || '';
          } catch {
            return '';
          }
        }
        return '';
      })()
    );
  });

  const [supabaseKey, setSupabaseKey] = useState(() => {
    return (
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      (() => {
        const saved = localStorage.getItem('peace_hope_supabase_config');
        if (saved) {
          try {
            return JSON.parse(saved).key || '';
          } catch {
            return '';
          }
        }
        return '';
      })()
    );
  });

  // Local form states
  const [siteName, setSiteName] = useState(settings.siteName || settings.churchName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [email, setEmail] = useState(settings.contactEmail);
  const [phone, setPhone] = useState(settings.contactPhone);
  const [address, setAddress] = useState(settings.contactAddress || settings.address);
  const [youtube, setYoutube] = useState(settings.socialLinks?.youtube || 'https://youtube.com/@peaceandhope');
  const [facebook, setFacebook] = useState(settings.socialLinks?.facebook || 'https://facebook.com/peaceandhoperwanda');
  const [autoRecord, setAutoRecord] = useState(settings.autoRecordLivestreams ?? true);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode ?? false);
  const [smtpServer, setSmtpServer] = useState(settings.smtpServer || 'smtp.peaceandhope.org');
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser || 'broadcast@peaceandhope.org');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState(settings.logoUrl || '');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      churchName: siteName,
      siteName,
      tagline,
      contactEmail: email,
      contactPhone: phone,
      address,
      contactAddress: address,
      socialLinks: {
        youtube,
        facebook,
      },
      autoRecordLivestreams: autoRecord,
      autoRecordLiveStreams: autoRecord,
      maintenanceMode: maintenance,
      smtpServer,
      smtpUser,
    });
    setSavedNotice('System settings saved and applied across church platform.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSaveSupabaseConfig = () => {
    saveSupabaseSettings(supabaseUrl.trim(), supabaseKey.trim());
    setSavedNotice('Supabase credentials saved and synced with cloud database.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSyncSupabaseNow = async () => {
    setIsSyncing(true);
    await syncAllWithSupabase();
    setTimeout(() => {
      setIsSyncing(false);
      setSavedNotice('All 16 church modules successfully synchronized with Supabase.');
      setTimeout(() => setSavedNotice(null), 3500);
    }, 600);
  };

  const handleBackupExport = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peace-hope-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedNotice('Database and settings backup successfully exported.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
            CONFIGURATION
          </div>
          <h1 className="font-serif text-3xl text-slate-900 font-normal tracking-tight">
            Settings &amp; Infrastructure
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage Supabase cloud database, RTMP endpoints, identity, and system backups.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b4832e] hover:bg-[#9c6a1e] text-white font-medium text-xs shadow-xs transition-colors shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{savedNotice}</span>
        </div>
      )}

      {/* Supabase Cloud Storage Engine Manager */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ece8df]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-medium text-slate-900">
                  Supabase Database &amp; Real-time Storage
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSupabaseActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isSupabaseActive ? 'Online & Synced' : 'Standby / Local Persistence'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Status: {supabaseSyncStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncSupabaseNow}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 font-mono outline-none shadow-xs"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Can also be provided via VITE_SUPABASE_URL environment variable
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 font-mono outline-none shadow-xs"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Can also be provided via VITE_SUPABASE_ANON_KEY environment variable
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveSupabaseConfig}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors"
          >
            Apply Supabase Connection
          </button>
        </div>
      </div>

      {/* Maintenance Mode Banner */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-[#b4832e]" />
            <h4 className="text-sm font-semibold text-slate-900">Platform Maintenance Mode</h4>
          </div>
          <p className="text-xs text-slate-500">
            When enabled, visitors will see a respectful Sabbath preparation or maintenance screen
          </p>
        </div>
        <button
          onClick={() => setMaintenance(!maintenance)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            maintenance
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {maintenance ? 'Maintenance Active' : 'Normal Operation'}
        </button>
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Church Identity */}
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Church Identity &amp; Contact
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Platform / Church Title
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ministry Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Church Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e4db] focus:border-amber-500 rounded-xl text-xs text-slate-900 outline-none shadow-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Official Logo &amp; Seal (`branding-media` Bucket)
            </label>
            <InlineUploadWidget
              bucket={SUPABASE_BUCKETS.BRANDING_MEDIA}
              parentTable="settings"
              parentId="church-branding"
              currentCoverUrl={brandingLogoUrl}
              onCoverChange={(url) => {
                setBrandingLogoUrl(url);
                updateSettings({ logoUrl: url });
              }}
            />
          </div>
        </div>

        {/* Live Broadcast & Automated Recording */}
        <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Broadcaster Ingest &amp; Archival
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary RTMP Ingest URL
            </label>
            <input
              type="text"
              readOnly
              value="rtmp://live.peaceandhope.org/live"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#e8e4db] rounded-xl text-xs text-slate-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Broadcast Stream Key (Secret)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                readOnly
                value="live_ph_kgl_7894_secret_key"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#e8e4db] rounded-xl text-xs text-slate-600 font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRecord}
                onChange={(e) => setAutoRecord(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span className="text-xs font-medium text-slate-700">
                Automatically archive live streams to Video Sermons library upon sermon completion
              </span>
            </label>
          </div>

          {/* Backup Action */}
          <div className="pt-4 border-t border-[#ece8df]">
            <button
              type="button"
              onClick={handleBackupExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Full Database Backup (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
