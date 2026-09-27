import React, { useState, useRef, useEffect } from 'react';
import {
  LivestreamRecord,
  LivestreamChatMessage,
  OverlayType,
  StreamProvider,
} from '../../types/livestream';
import {
  useLivestream,
  useLivestreamChat,
  useLivestreamPresence,
  useLivestreamReactions,
  useLivestreamOverlays,
} from '../../hooks/useLivestream';
import { getStreamProvider } from '../../lib/streamProviders';
import {
  Radio,
  Play,
  Square,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Monitor,
  Eye,
  Activity,
  Shield,
  Trash2,
  Pin,
  Clock,
  Copy,
  Check,
  Share2,
  BookOpen,
  Volume2,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Settings,
  Layers,
  Users,
} from 'lucide-react';

export const LiveWorshipControl: React.FC = () => {
  const { stream, refresh, updateStatus, createScheduledStream } = useLivestream('current');
  const streamId = stream?.id;

  const { viewerCount } = useLivestreamPresence(streamId, stream?.viewer_count || 0);
  const {
    messages,
    sendMessage,
    deleteMessage,
    togglePinMessage,
    chatEnabled,
    setChatEnabled,
    slowMode,
    setSlowMode,
  } = useLivestreamChat(streamId);
  const { reactionCounts } = useLivestreamReactions(streamId);
  const { activeOverlay, pushOverlay, clearOverlay } = useLivestreamOverlays(streamId);

  // Tab Navigation in Admin
  const [activeTab, setActiveTab] = useState<'control' | 'setup' | 'moderation' | 'overlay'>('control');

  // Schedule Broadcast Form State
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDesc, setSchedDesc] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedProvider, setSchedProvider] = useState<StreamProvider>('mux');
  const [isCreatingStream, setIsCreatingStream] = useState(false);
  const [streamCreatedSuccess, setStreamCreatedSuccess] = useState(false);

  // Browser Broadcaster States (WebRTC camera/mic/screen)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);

  // Modals & Action confirmations
  const [confirmGoLive, setConfirmGoLive] = useState<boolean>(false);
  const [confirmEndLive, setConfirmEndLive] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [revealKey, setRevealKey] = useState<boolean>(false);

  // Overlay forms
  const [verseRef, setVerseRef] = useState('John 3:16');
  const [verseText, setVerseText] = useState('For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.');
  const [speakerName, setSpeakerName] = useState('Pastor David Miller');
  const [speakerTitle, setSpeakerTitle] = useState('Senior Pastor, Peace & Hope SDA Church');
  const [announcementMsg, setAnnouncementMsg] = useState('Welcome to Divine Service. Potluck fellowship follows in the main hall.');

  // Camera preview attachment
  useEffect(() => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = mediaStream;
      if (mediaStream) {
        videoPreviewRef.current.play().catch(() => {});
      }
    }
  }, [mediaStream]);

  // Audio level meter simulation when mic is on
  useEffect(() => {
    if (!isMicActive) {
      setMicVolumeLevel(0);
      return;
    }
    const interval = setInterval(() => {
      setMicVolumeLevel(Math.floor(35 + Math.random() * 55));
    }, 150);
    return () => clearInterval(interval);
  }, [isMicActive]);

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mediaStream]);

  const toggleCamera = async () => {
    if (isCameraActive) {
      mediaStream?.getVideoTracks().forEach((t) => t.stop());
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicActive });
        setMediaStream(stream);
        setIsCameraActive(true);
      } catch (err) {
        console.warn('Unable to access camera:', err);
      }
    }
  };

  const toggleMic = async () => {
    if (isMicActive) {
      mediaStream?.getAudioTracks().forEach((t) => t.stop());
      setIsMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isCameraActive });
        setMediaStream(stream);
        setIsMicActive(true);
      } catch (err) {
        console.warn('Unable to access microphone:', err);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      toggleCamera();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setMediaStream(screenStream);
        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Unable to capture screen:', err);
      }
    }
  };

  const handleCopyStreamKey = () => {
    navigator.clipboard?.writeText(stream?.stream_key || 'live_ph_mux_primary_key');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGoLiveConfirm = async () => {
    setConfirmGoLive(false);
    const currentStreamId = stream?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'stream-' + Date.now());
    const providerType = stream?.stream_provider || 'mux';
    const provider = getStreamProvider(providerType);

    // Call provider to start stream and retrieve real playback_url
    await provider.startStream(currentStreamId);
    const realPlaybackUrl = await provider.getPlaybackUrl(currentStreamId);

    // Write real playback_url to the row
    await updateStatus('live', {
      playbackUrl: realPlaybackUrl,
    });
  };

  const handleEndLiveConfirm = async () => {
    setConfirmEndLive(false);
    if (stream?.id) {
      const provider = getStreamProvider(stream.stream_provider || 'mux');
      await provider.endStream(stream.id);
    }
    await updateStatus('ended');
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      setMediaStream(null);
      setIsCameraActive(false);
      setIsMicActive(false);
    }
  };

  const isLive = stream?.status === 'live';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-7xl pb-16">
      {/* Top Header & Broadcast Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#C5A059] uppercase mb-1">
            BROADCAST OPERATION CONTROL
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 dark:text-white font-normal tracking-tight">
            Live Worship Control Room
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Coordinate sanctuary live feeds, OBS RTMP ingest, browser camera broadcast, and realtime church moderation.
          </p>
        </div>

        {/* Action Controls & Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold ${
              isLive
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-rose-600' : 'bg-slate-400'}`} />
            <span>{isLive ? 'BROADCASTING LIVE' : 'OFFLINE / STANDBY'}</span>
          </div>

          {isLive ? (
            <button
              type="button"
              onClick={() => setConfirmEndLive(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End Broadcast</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmGoLive(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md cursor-pointer animate-bounce-subtle"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Go Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('control')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'control'
              ? 'bg-[#11203D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Control Room</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'setup'
              ? 'bg-[#11203D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Encoder & Ingest Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overlay')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'overlay'
              ? 'bg-[#11203D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Push to Screen Overlays</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-[#11203D] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Chat Moderation ({messages.length})</span>
        </button>
      </div>

      {/* Tab 1: Live Control Room */}
      {activeTab === 'control' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Broadcaster Monitor & In-Browser Camera */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-black rounded-3xl overflow-hidden aspect-video relative shadow-2xl border border-slate-900 group">
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {!mediaStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 bg-slate-950/90">
                  <Camera className="w-12 h-12 text-[#C5A059]" />
                  <h3 className="font-serif font-bold text-lg">Local Camera / Screen Standby</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Broadcasting via OBS or external hardware encoder? Your ingest RTMP feed is processed automatically. To broadcast directly from this computer, enable camera below.
                  </p>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-4 py-2 rounded-xl bg-[#C5A059] text-white font-semibold text-xs shadow-md hover:bg-[#b4832e] cursor-pointer"
                  >
                    Enable Browser Camera
                  </button>
                </div>
              )}

              {/* Status HUD Over Video */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold backdrop-blur-md border border-white/20">
                  LIVE STUDIO MONITOR
                </span>
                {isLive && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ON AIR
                  </span>
                )}
              </div>

              {/* Audio Meter on Monitor */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 transition-all duration-100"
                    style={{ width: `${micVolumeLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Broadcaster Device Controls */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                    isCameraActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  <span>{isCameraActive ? 'Camera Active' : 'Enable Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                    isMicActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{isMicActive ? 'Mic Active' : 'Enable Mic'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleScreenShare}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                    isScreenSharing
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
                </button>
              </div>

              {/* Viewers & Reaction count */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#C5A059]" />
                  <span>{viewerCount} Live Viewers</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span>🙏</span>
                  <span>{reactionCounts['🙏'] || 0} Prayers</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat Moderation Feed */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C5A059]" />
                <span>Live Chat Stream</span>
              </h3>
              <span className="text-[11px] text-slate-400">{messages.length} messages</span>
            </div>

            <div className="h-96 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-400">
                  No chat messages received yet.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-xs space-y-1 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{m.guest_name}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          type="button"
                          onClick={() => togglePinMessage(m.id, !m.pinned)}
                          className="text-slate-400 hover:text-[#C5A059]"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMessage(m.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{m.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Admin message input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('adminChat') as HTMLInputElement;
                if (!input.value.trim()) return;
                await sendMessage(input.value.trim(), 'text');
                input.value = '';
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                name="adminChat"
                placeholder="Post as Pastor / Admin..."
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#C5A059] text-white hover:bg-[#b4832e]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Broadcast Ingest & Schedule Setup */}
      {activeTab === 'setup' && (
        <div className="space-y-8">
          {/* Schedule / Create New Broadcast Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Create / Schedule Divine Worship Broadcast
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Schedule an upcoming service or prepare broadcast credentials in Supabase without seeded placeholder data.
              </p>
            </div>

            {streamCreatedSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Broadcast scheduled successfully! Status set to 'scheduled'.</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!schedTitle.trim()) return;
                setIsCreatingStream(true);
                const res = await createScheduledStream({
                  title: schedTitle.trim(),
                  description: schedDesc.trim(),
                  scheduledStartAt: schedTime || new Date(Date.now() + 3600000).toISOString(),
                  provider: schedProvider,
                });
                setIsCreatingStream(false);
                if (res) {
                  setStreamCreatedSuccess(true);
                  setTimeout(() => setStreamCreatedSuccess(false), 4000);
                  setSchedTitle('');
                  setSchedDesc('');
                  setSchedTime('');
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sabbath Divine Service: The Remnant Church"
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Service Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sabbath morning worship message, scripture reading, and divine service."
                    value={schedDesc}
                    onChange={(e) => setSchedDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Broadcast Provider
                  </label>
                  <select
                    value={schedProvider}
                    onChange={(e) => setSchedProvider(e.target.value as StreamProvider)}
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="mux">Mux Live (RTMP / HLS)</option>
                    <option value="livekit">LiveKit SFU (Ultra-Low Latency WebRTC)</option>
                    <option value="cloudflare">Cloudflare Stream Live</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isCreatingStream || !schedTitle.trim()}
                  className="px-6 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b4832e] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-40"
                >
                  {isCreatingStream ? 'Creating Stream...' : 'Create Scheduled Broadcast'}
                </button>
              </div>
            </form>
          </div>

          {/* OBS Studio & Hardware Encoder Instructions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              OBS Studio & Hardware Encoder Instructions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Configure Open Broadcaster Software (OBS), vMix, Wirecast, or Blackmagic ATEM to stream divine service directly into the Peace & Hope sanctuary network.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Server URL (RTMP Ingest)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={stream?.ingest_url || 'rtmps://global-live.mux.com:443/app'}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(stream?.ingest_url || 'rtmps://global-live.mux.com:443/app');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Secret Stream Key (Admin Only)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type={revealKey ? 'text' : 'password'}
                    value={stream?.stream_key || 'live_ph_mux_primary_key'}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealKey(!revealKey)}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    {revealKey ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyStreamKey}
                    className="px-3 py-2.5 rounded-xl bg-[#C5A059] text-white hover:bg-[#b4832e] text-xs font-semibold cursor-pointer"
                  >
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                Recommended OBS Settings:
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc list-inside space-y-1">
                <li>Video Bitrate: 4500 – 6000 Kbps (1080p60) or 2500 Kbps (720p60)</li>
                <li>Keyframe Interval: 2 seconds</li>
                <li>Encoder: x264 (VeryFast) or NVIDIA NVENC (H.264)</li>
                <li>Audio Bitrate: 160 or 192 Kbps (AAC)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Push to Screen Overlays */}
      {activeTab === 'overlay' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Push Scripture */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C5A059]" />
              <span>Push Scripture Verse to Viewers</span>
            </h3>
            <p className="text-xs text-slate-500">
              Broadcasters can display a selected Bible passage across all live viewer screens instantly.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reference</label>
                <input
                  type="text"
                  value={verseRef}
                  onChange={(e) => setVerseRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Verse Text</label>
                <textarea
                  rows={3}
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    pushOverlay('bible_verse', { reference: verseRef, text: verseText }, 20)
                  }
                  className="px-4 py-2 rounded-xl bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#b4832e] cursor-pointer"
                >
                  Push Scripture (20s)
                </button>
                <button
                  type="button"
                  onClick={clearOverlay}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Clear Screen
                </button>
              </div>
            </div>
          </div>

          {/* Lower Third Speaker Title */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C5A059]" />
              <span>Lower-Third Speaker Title</span>
            </h3>
            <p className="text-xs text-slate-500">
              Display speaker credential badge at the lower third of the video player.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Speaker Name</label>
                <input
                  type="text"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title / Affiliation</label>
                <input
                  type="text"
                  value={speakerTitle}
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    pushOverlay('lower_third', { speakerName, speakerTitle, text: '' }, 15)
                  }
                  className="px-4 py-2 rounded-xl bg-[#11203D] text-white text-xs font-semibold hover:bg-[#1a315e] cursor-pointer"
                >
                  Display Lower-Third (15s)
                </button>
                <button
                  type="button"
                  onClick={clearOverlay}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Chat Moderation Settings */}
      {activeTab === 'moderation' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
            Sanctuary Chat Moderation & Rate Controls
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Maintain reverence and prevent spam during solemn worship hours.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Enable Fellowship Chat</h4>
                <p className="text-[11px] text-slate-400">Allow viewers to send live messages and blessings</p>
              </div>
              <input
                type="checkbox"
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#C5A059] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white">Slow Mode (10s Throttle)</h4>
                <p className="text-[11px] text-slate-400">Limits each worshipper to 1 message every 10 seconds</p>
              </div>
              <input
                type="checkbox"
                checked={slowMode}
                onChange={(e) => setSlowMode(e.target.checked)}
                className="w-5 h-5 accent-[#C5A059] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Go Live */}
      {confirmGoLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
              Begin Live Divine Broadcast?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will notify worldwide worshippers, update the website status banner to LIVE, and open the interactive sanctuary video feed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmGoLive(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGoLiveConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-md cursor-pointer"
              >
                Yes, Start Broadcasting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: End Live */}
      {confirmEndLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Square className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
              Conclude Broadcast?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to conclude the live service? The recording will be stored in Supabase archive for sermon on-demand replay.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmEndLive(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndLiveConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-md cursor-pointer"
              >
                Conclude Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
