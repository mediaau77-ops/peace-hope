import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Pin,
  Trash2,
  Smile,
  Shield,
  BookOpen,
  AlertCircle,
  Clock,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import { LivestreamChatMessage } from '../../types/livestream';
import { useAuth } from '../../hooks/useAuth';

interface StreamLiveChatProps {
  messages: LivestreamChatMessage[];
  onSendMessage: (content: string, type?: 'text' | 'verse') => Promise<{ success: boolean; error?: string }>;
  onDeleteMessage?: (msgId: string) => Promise<boolean>;
  onTogglePin?: (msgId: string, pinned: boolean) => Promise<boolean>;
  isAdmin?: boolean;
  chatEnabled?: boolean;
  slowMode?: boolean;
  className?: string;
}

export const StreamLiveChat: React.FC<StreamLiveChatProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onTogglePin,
  isAdmin = false,
  chatEnabled = true,
  slowMode = false,
  className = '',
}) => {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isScrolledUpRef = useRef(false);

  // Auto-scroll when new messages arrive if user is already near bottom
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (!isScrolledUpRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = distanceToBottom > 80;
    isScrolledUpRef.current = isUp;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setShowScrollBottom(false);
    isScrolledUpRef.current = false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (!user) {
      setErrorMessage('Please sign in with Google to participate in fellowship chat.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await onSendMessage(inputText.trim(), 'text');
    setIsSubmitting(false);

    if (res.success) {
      setInputText('');
      scrollToBottom();
    } else {
      setErrorMessage(res.error || 'Failed to send message.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const pinnedMessage = messages.find((m) => m.pinned);

  // Authenticated user display info
  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Member';
  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className={`flex flex-col h-[520px] lg:h-[620px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
            Fellowship Live Chat
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {slowMode && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3 h-3" />
              Slow mode (10s)
            </span>
          )}
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Pinned Announcement Message if any */}
      {pinnedMessage && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Pin className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5 fill-current" />
          <div className="flex-1 overflow-hidden">
            <span className="font-bold mr-1.5">{pinnedMessage.guest_name || 'Announcement'}:</span>
            <span>{pinnedMessage.content}</span>
          </div>
          {isAdmin && onTogglePin && (
            <button
              onClick={() => onTogglePin(pinnedMessage.id, false)}
              className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs sm:text-sm space-y-2">
            <Smile className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-700 dark:text-slate-300">Chat is quiet. Be the first to say amen.</p>
            <p className="text-[11px] text-slate-500">Sign in with Google to share greetings, blessings, and prayer with our church family.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="group flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed animate-fade-in hover:bg-slate-50 dark:hover:bg-slate-800/30 p-1.5 rounded-xl transition-colors"
            >
              {/* User Avatar */}
              {msg.media_url ? (
                <img
                  src={msg.media_url}
                  alt={msg.guest_name || 'User'}
                  className="w-7 h-7 rounded-full object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#11203D] to-[#C5A059] text-white flex items-center justify-center font-bold text-[10px] shrink-0 uppercase shadow-xs">
                  {(msg.guest_name || 'U')[0]}
                </div>
              )}

              {/* Message Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {msg.guest_name || 'Member'}
                  </span>
                  {msg.is_admin && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#C5A059]/15 text-[#C5A059]">
                      <Shield className="w-2.5 h-2.5" />
                      Pastor / Admin
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.message_type === 'verse' ? (
                  <div className="mt-1 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs italic flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                    <span>{msg.content}</span>
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300 break-words mt-0.5">
                    {msg.content}
                  </p>
                )}
              </div>

              {/* Moderation Controls (Admin Only) */}
              {isAdmin && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={() => onTogglePin(msg.id, !msg.pinned)}
                      title={msg.pinned ? 'Unpin' : 'Pin'}
                      className="p-1 text-slate-400 hover:text-[#C5A059] transition-colors cursor-pointer"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteMessage && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      title="Delete message"
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Messages Jump Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#11203D] text-white text-xs font-semibold shadow-lg hover:bg-[#1a315e] transition-all cursor-pointer animate-bounce"
        >
          <span>Latest messages</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Rate limit / Validation warning */}
      {errorMessage && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 border-t border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Chat Input or Google Sign-In Gate */}
      {!chatEnabled ? (
        <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          Live chat is currently read-only.
        </div>
      ) : !user ? (
        /* Defect 2 Enforcement: Signed-out visitors see strict Google Sign-In prompt */
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Sign in with Google to join the chat.
          </p>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={authLoading}
            className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs hover:shadow-sm transition-all cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      ) : (
        /* Authenticated Chat Composer */
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center gap-1.5 truncate">
              {userAvatarUrl ? (
                <img src={userAvatarUrl} alt={userDisplayName} className="w-4 h-4 rounded-full" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-[#C5A059] inline-block" />
              )}
              <span className="truncate">
                Posting as <strong className="text-slate-800 dark:text-white font-medium">{userDisplayName}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Share a blessing, prayer, or Amen..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C5A059] text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputText.trim()}
              className="p-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b4832e] text-white disabled:opacity-40 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
