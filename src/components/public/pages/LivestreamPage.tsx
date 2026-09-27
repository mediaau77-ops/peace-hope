import React, { useState } from 'react';
import {
  useLivestream,
  useLivestreamChat,
  useLivestreamPresence,
  useLivestreamReactions,
  useLivestreamOverlays,
} from '../../../hooks/useLivestream';
import { StreamVideoPlayer } from '../StreamVideoPlayer';
import { StreamLiveChat } from '../StreamLiveChat';
import { ShareButtons } from '../ShareButtons';
import { PageHero } from '../PageHero';
import { EmptyState } from '../EmptyState';
import {
  Users,
  Radio,
  Bell,
  CheckCircle2,
  Calendar,
  Heart,
  BookOpen,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { apiPost } from '../../../lib/api-client';

export const LivestreamPage: React.FC = () => {
  // Query strictly the live or scheduled livestream where is_public = true
  const { stream, loading } = useLivestream('current');
  const streamId = stream?.id;

  const isLive = stream?.status === 'live' && stream?.is_public;
  const isScheduled = stream?.status === 'scheduled' && stream?.is_public;
  const isEnded = (stream?.status === 'ended' || stream?.status === 'archived') && stream?.is_public;

  const { viewerCount } = useLivestreamPresence(isLive ? streamId : undefined, stream?.viewer_count || 0);
  const {
    messages,
    sendMessage,
    deleteMessage,
    togglePinMessage,
    chatEnabled,
    slowMode,
  } = useLivestreamChat(streamId);
  const { reactionCounts, floatingEmojis, sendReaction } = useLivestreamReactions(isLive ? streamId : undefined);
  const { activeOverlay } = useLivestreamOverlays(isLive ? streamId : undefined);

  // Reminders & Prayer
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSubscribed, setReminderSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'prayer'>('chat');
  const [prayerText, setPrayerText] = useState('');
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  const handleSubscribeReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail.trim() || !streamId) return;

    try {
      await apiPost(`/api/livestreams/${streamId}/reminders`, {
        email: reminderEmail.trim(),
        sendAt: stream?.scheduled_start_at || new Date().toISOString(),
      });
      setReminderSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe to reminder:', err);
    }
  };

  const handleSendPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    try {
      await apiPost('/api/prayer', {
        title: 'Live Service Prayer Intercession',
        description: prayerText.trim(),
        isPrivate: true,
      });
      setPrayerSubmitted(true);
      setPrayerText('');
      setTimeout(() => setPrayerSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to submit prayer:', err);
    }
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(stream?.title || 'Live Worship Service');
    const details = encodeURIComponent(stream?.description || 'Peace & Hope Seventh-day Adventist Sanctuary');
    const startIso = (stream?.scheduled_start_at ? new Date(stream.scheduled_start_at) : new Date())
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startIso}/${startIso}`;
  };

  const renderOverlayNode = () => {
    if (!activeOverlay) return null;
    const { type, content } = activeOverlay;

    if (type === 'bible_verse') {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-100 p-4 sm:p-5 rounded-2xl shadow-2xl flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059]">
              Scripture Reading • {content.reference || 'Holy Bible'}
            </div>
            <p className="font-serif text-sm sm:text-base text-white mt-1 leading-snug">
              “{content.text}”
            </p>
          </div>
        </div>
      );
    }

    if (type === 'lower_third') {
      return (
        <div className="bg-[#11203D]/95 backdrop-blur-md border-l-4 border-[#C5A059] text-white px-5 py-3 rounded-r-2xl shadow-2xl">
          <div className="font-serif font-bold text-base sm:text-lg text-white">
            {content.speakerName || 'Pastor / Speaker'}
          </div>
          <div className="text-xs text-[#C5A059] font-medium">
            {content.speakerTitle || 'Peace & Hope SDA Ministry'}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-amber-900/90 backdrop-blur-md border border-amber-500/50 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
        <p className="text-xs sm:text-sm font-medium">{content.text}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D182E] pb-24 animate-pulse">
        <div className="h-64 bg-slate-200 dark:bg-slate-900" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
          <div className="aspect-video bg-slate-300 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Defect 1 & 3: If no row exists where status in ('live', 'scheduled', 'ended') and is_public = true,
  // do not render a player at all. Render strictly the clean empty state.
  const hasActiveBroadcast = isLive || isScheduled || isEnded;

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#0D182E] pb-24 transition-colors">
      <PageHero
        title={isLive ? 'Live Worship Sanctuary' : isScheduled ? 'Upcoming Live Broadcast' : 'Live Worship'}
        subtitle={
          isLive
            ? 'Streaming divine worship, sacred music, and the Word of God from the church sanctuary.'
            : isScheduled
            ? 'Prepare your heart to worship together. Set a reminder below so you never miss divine service.'
            : 'Welcome to our sanctuary broadcast center.'
        }
        badge={isLive ? 'Broadcasting Now' : isScheduled ? 'Scheduled Service' : undefined}
        breadcrumbs={[{ label: 'Live Worship' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {!hasActiveBroadcast ? (
          <div className="max-w-2xl mx-auto py-12">
            <EmptyState
              icon={Radio}
              title="No stream is currently live."
              message="No upcoming streams scheduled."
              actionText="Explore Sermons Archive"
              onAction={() => {
                window.location.hash = '#sermons';
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Video Player: Render ONLY when stream status = 'live' and is_public = true */}
              {isLive ? (
                <StreamVideoPlayer
                  playbackUrl={stream?.playback_url}
                  posterUrl={stream?.cover_image_url}
                  isLive={true}
                  floatingEmojis={floatingEmojis}
                  overlayContent={renderOverlayNode()}
                />
              ) : isScheduled ? (
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-white">
                  {stream?.cover_image_url && (
                    <img
                      src={stream.cover_image_url}
                      alt={stream.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs"
                    />
                  )}
                  <div className="relative z-10 max-w-lg space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Starts {stream?.scheduled_start_at ? new Date(stream.scheduled_start_at).toLocaleString() : 'Soon'}</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold">{stream?.title}</h2>
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">{stream?.description}</p>
                    
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-md"
                      >
                        <Calendar className="w-4 h-4 text-[#C5A059]" />
                        <span>Add to Google Calendar</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : isEnded ? (
                <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#C5A059] flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                    The stream has ended.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Thank you for worshipping with us. Watch previous sermons and divine services in our sermons archive.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = '#sermons';
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b4832e] text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
                    >
                      Explore Sermons Archive
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 2. Broadcast Title, Status & Live Viewers Count */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isLive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-bold animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {stream?.actual_start_at
                          ? `Started ${new Date(stream.actual_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Peace & Hope SDA Sanctuary'}
                      </span>
                    </div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      {stream?.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{viewerCount} worshipping</span>
                      </div>
                    )}
                    <ShareButtons url={typeof window !== 'undefined' ? window.location.href : ''} title={stream?.title || 'Live Worship'} />
                  </div>
                </div>

                {stream?.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {stream.description}
                  </p>
                )}

                {/* Real-time Emoji Reactions Bar (Only shown when reactions > 0 or isLive) */}
                {isLive && stream?.reactions_enabled && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Praise & Reactions:</span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {(['❤️', '🙏', '👍', '🔥', '🎉'] as const).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => sendReaction(emoji)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#C5A059]/15 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="text-base">{emoji}</span>
                            <span className="text-[11px] font-bold">{reactionCounts[emoji] || 0}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Scheduled Notification Box */}
              {isScheduled && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-[#C5A059] text-white shrink-0 shadow-md">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                        Never Miss a Sabbath Divine Service
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        We send a reminder 15 minutes before the broadcast begins.
                      </p>
                    </div>
                  </div>

                  {reminderSubscribed ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>You're subscribed! We will notify you before the service starts.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribeReminder} className="flex flex-col sm:flex-row gap-3 pt-2">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address..."
                        value={reminderEmail}
                        onChange={(e) => setReminderEmail(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b4832e] text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
                      >
                        Remind Me
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Live Chat & Intercessory Prayer Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-slate-900 text-[#C5A059] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Live Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prayer')}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'prayer'
                      ? 'bg-white dark:bg-slate-900 text-[#C5A059] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Prayer Request</span>
                </button>
              </div>

              {activeTab === 'chat' ? (
                <StreamLiveChat
                  messages={messages}
                  onSendMessage={sendMessage}
                  onDeleteMessage={deleteMessage}
                  onTogglePin={togglePinMessage}
                  chatEnabled={chatEnabled}
                  slowMode={slowMode}
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                      Pastoral Prayer Intercession
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Our pastoral team and elders are interceding throughout the worship hour. Your prayer request is received directly by pastoral staff.
                  </p>

                  {prayerSubmitted ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Your prayer petition has been received by the elders.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendPrayer} className="space-y-3">
                      <textarea
                        required
                        rows={4}
                        placeholder="Share your prayer petition or praise report..."
                        value={prayerText}
                        onChange={(e) => setPrayerText(e.target.value)}
                        className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A059]"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b4832e] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        Send Prayer Request
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
