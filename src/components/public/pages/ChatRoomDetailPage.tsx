import React, { useState, useEffect, useRef } from 'react';
import { Hash, ArrowLeft, Send, Users, ShieldCheck, User } from 'lucide-react';
import { PageHero } from '../PageHero';
import { useRealtimeChannel } from '../../../hooks/useRealtimeChannel';
import {
  fetchPublicChatMessages,
  submitPublicChatMessage,
} from '../../../lib/publicQueries';
import { PublicChatMessage } from '../../../types/public';

interface ChatRoomDetailPageProps {
  roomId: string;
  onBack: () => void;
}

export const ChatRoomDetailPage: React.FC<ChatRoomDetailPageProps> = ({ roomId, onBack }) => {
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [senderName, setSenderName] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPublicChatMessages(roomId).then((res) => {
      setMessages(res);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }, [roomId]);

  // Realtime messages for this room
  useRealtimeChannel({
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`,
    onPayload: (payload) => {
      if (payload.new) {
        setMessages((prev) => [...prev, payload.new]);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !senderName.trim() || sending) return;

    setSending(true);
    const success = await submitPublicChatMessage({
      roomId,
      userName: senderName.trim(),
      message: text.trim(),
    });

    setSending(false);
    if (success) {
      setText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={`# ${roomId}`}
        subtitle="Fellowship discussion and encouragement."
        badge="Chat Room"
        breadcrumbs={[{ label: 'Chat', href: '#chat' }, { label: roomId }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Circles</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col h-[650px] overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white capitalize">
                  {roomId.replace(/-/g, ' ')}
                </h3>
                <span className="text-[11px] text-slate-400">Public fellowship group</span>
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {messages.length === 0 ? (
              <div className="text-center py-20 space-y-2">
                <p className="text-slate-400 font-light">No messages in this circle yet.</p>
                <p className="text-xs text-slate-400">Be the first to share a warm greeting!</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                    {m.user_name ? m.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="space-y-1 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {m.user_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-light leading-relaxed">
                      {m.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name..."
                className="w-full sm:w-44 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share a message or scripture..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim() || !senderName.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
