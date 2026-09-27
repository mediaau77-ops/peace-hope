import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  BookOpen,
  BookMarked,
  Library,
  HeartHandshake,
  Sparkles,
  CalendarDays,
  FolderOpen,
  Radio,
  Users,
  MessageSquare,
  SunMedium,
  Bell,
  Play,
  Activity,
  Database,
  ArrowUpRight,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export const OverviewModule: React.FC = () => {
  const {
    setActiveTab,
    streamState,
    startLive,
    sermons,
    prayerRequests,
    testimonies,
    events,
    teachings,
    mediaItems,
    users,
    chatMessages,
    devotionals,
    notifications,
    isSupabaseActive,
    supabaseSyncStatus,
    syncAllWithSupabase,
  } = useAdmin();

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncAllWithSupabase();
    setTimeout(() => setIsSyncing(false), 600);
  };

  // Primary dynamic metric cards matching image.png exactly
  const primaryCards = [
    {
      id: 'bible' as const,
      label: 'HOLY BIBLE',
      count: 3, // 3 translations (Bibiliya Yera, NIV, Segond) + active plans
      icon: BookOpen,
      subtext: '3 Translations Synced',
    },
    {
      id: 'teachings' as const,
      label: 'TEACHING CHANNEL',
      count: teachings.length,
      icon: BookMarked,
      subtext: 'Published Doctrinal Studies',
    },
    {
      id: 'sermons' as const,
      label: 'SERMONS',
      count: sermons.length,
      icon: Library,
      subtext: 'HD Video Archive',
    },
    {
      id: 'prayers' as const,
      label: 'PRAYER CENTER',
      count: prayerRequests.length,
      icon: HeartHandshake,
      subtext: `${prayerRequests.filter((p) => p.status === 'Pending').length} Pending Review`,
    },
    {
      id: 'testimonies' as const,
      label: 'TESTIMONIES',
      count: testimonies.length,
      icon: Sparkles,
      subtext: 'Verified Member Praises',
    },
    {
      id: 'events' as const,
      label: 'EVENTS',
      count: events.length,
      icon: CalendarDays,
      subtext: 'Scheduled Camp Meetings',
    },
    {
      id: 'media' as const,
      label: 'MEDIA LIBRARY',
      count: mediaItems.length,
      icon: FolderOpen,
      subtext: 'Assets in CDN Storage',
    },
    {
      id: 'live' as const,
      label: 'LIVE WORSHIP',
      count: streamState.isLive ? streamState.viewersCount : 0,
      icon: Radio,
      subtext: streamState.isLive ? 'Active Broadcaster' : 'Broadcaster Standby',
    },
    {
      id: 'users' as const,
      label: 'USERS & MEMBERS',
      count: users.length,
      icon: Users,
      subtext: 'Registered Church Members',
    },
    {
      id: 'chat' as const,
      label: 'COMMENTS',
      count: chatMessages.length,
      icon: MessageSquare,
      subtext: 'Fellowship Chat Activity',
    },
    {
      id: 'devotionals' as const,
      label: 'DEVOTIONALS',
      count: devotionals.length,
      icon: SunMedium,
      subtext: 'Morning Watch Meditations',
    },
    {
      id: 'notifications' as const,
      label: 'NOTIFICATIONS',
      count: notifications.length,
      icon: Bell,
      subtext: 'Dispatched Sabbath Alerts',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Block matching image.png exactly */}
      <div>
        <div className="text-[11px] font-bold tracking-[0.22em] text-[#b4832e] uppercase mb-1">
          OVERVIEW
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Ministry statistics at a glance.
        </p>
      </div>

      {/* Primary Dynamic Metric Cards Grid matching image.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className="bg-white border border-[#e8e4db] rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#dfcaa4] transition-all cursor-pointer flex flex-col justify-between min-h-[145px] group text-left"
            >
              {/* Top Golden Icon */}
              <div className="flex items-center justify-between">
                <Icon className="w-6 h-6 text-[#c69234] stroke-[1.75]" />
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Middle Dynamic Number Counter */}
              <div className="my-3">
                <div className="font-serif text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight">
                  {typeof card.count === 'number' ? card.count.toLocaleString() : card.count}
                </div>
              </div>

              {/* Bottom Uppercase Category Label matching image.png */}
              <div className="flex items-center justify-between">
                <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-slate-600 uppercase">
                  {card.label}
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supabase Dynamic Cloud Persistence Status Bar */}
      <div className="bg-white border border-[#e8e4db] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Supabase Cloud Database Storage
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSupabaseActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isSupabaseActive ? 'Online & Synced' : 'Local Persistence (Ready for Supabase)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live storage engine for sermons, prayer intercessions, member testimonies, and broadcast state.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data with Supabase'}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-3.5 py-1.5 rounded-lg bg-[#fef9ee] hover:bg-[#faeed3] text-[#b4832e] border border-[#f5e6c8] text-xs font-medium transition-colors"
          >
            Supabase Config
          </button>
        </div>
      </div>

      {/* Broadcast Telemetry & Quick Management Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Studio Control Card */}
        <div className="lg:col-span-2 bg-white border border-[#e8e4db] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    streamState.isLive ? 'bg-red-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Live Worship Broadcaster Hub
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    streamState.isLive
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {streamState.isLive ? 'TRANSMITTING LIVE' : 'STUDIO READY'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected to Kigali Central SDA Main Sanctuary HLS/WebRTC encoder
              </p>
            </div>

            <div>
              {!streamState.isLive ? (
                <button
                  onClick={() => {
                    startLive();
                    setActiveTab('live');
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Go Live Now</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('live')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  <span>Enter Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Broadcast Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#ece8df]">
              <span className="text-slate-400 font-semibold block uppercase text-[9px] tracking-wider mb-1">
                Active / Next Sermon Topic
              </span>
              <span className="font-semibold text-slate-900 text-sm block">
                {streamState.title}
              </span>
              <span className="text-[#b4832e] text-xs mt-1 block font-medium">
                {streamState.speaker} &bull; {streamState.scripture}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#ece8df] space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Telemetry Ingest:</span>
                <span className="text-slate-800 font-mono text-[11px]">
                  rtmp://live.peaceandhope.org/live
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bitrate &amp; Latency:</span>
                <span className="text-slate-800 font-mono text-[11px]">
                  {streamState.bitrateKbps} kbps &bull; {streamState.latencySec}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Encoding Profile:</span>
                <span className="text-emerald-700 font-semibold">1080p60 HLS Full HD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: System Health & Storage */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Platform Operational Monitor
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Online
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">API Gateway Response</span>
                <span className="text-emerald-600 font-mono font-medium">18ms Latency</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scripture Search Engine</span>
                <span className="text-slate-700 font-mono">31,102 Verses Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Live Video Transcoder</span>
                <span className="text-emerald-600 font-semibold">Active Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Supabase Cloud Sync</span>
                <span className="text-slate-700 font-semibold">{isSupabaseActive ? 'Active' : 'Standby'}</span>
              </div>
            </div>
          </div>

          {/* Cloud Storage Usage */}
          <div className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <HardDrive className="w-4 h-4 text-[#c69234]" />
                <span>Media Cloud Storage</span>
              </div>
              <span className="font-mono text-slate-500 text-xs">340 GB / 500 GB</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-[68%] h-full bg-[#c69234] rounded-full" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>68% Utilized</span>
              <span>HD Sermons &amp; Audio Hymnals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
