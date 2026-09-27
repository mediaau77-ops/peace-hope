import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Hand,
  MessageSquare,
  Users,
  Send,
  Share2,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useRealtimeChannel } from '../../../hooks/useRealtimeChannel';
import { submitPublicChatMessage, fetchPublicChatMessages } from '../../../lib/publicQueries';
import { PublicChatMessage } from '../../../types/public';

interface MeetingRoomPageProps {
  roomId: string;
  onLeave: () => void;
}

export const MeetingRoomPage: React.FC<MeetingRoomPageProps> = ({ roomId, onLeave }) => {
  const [joined, setJoined] = useState(false);
  const [userName, setUserName] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [raisedHand, setRaisedHand] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // Load meeting chat
  React.useEffect(() => {
    if (joined) {
      fetchPublicChatMessages(roomId).then(setMessages);
    }
  }, [joined, roomId]);

  // Realtime chat in room
  useRealtimeChannel({
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`,
    onPayload: (payload) => {
      if (payload.new) {
        setMessages((prev) => [...prev, payload.new]);
      }
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: PublicChatMessage = {
      id: Math.random().toString(),
      room_id: roomId,
      user_name: userName || 'Fellow Believer',
      message: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    await submitPublicChatMessage({
      roomId,
      userName: userName || 'Fellow Believer',
      message: inputText.trim(),
    });
  };

  // Pre-join state
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold">Join Fellowship Circle</h2>
            <p className="text-xs text-slate-400">Room Code: {roomId}</p>
          </div>

          {/* Camera preview placeholder */}
          <div className="relative aspect-16/10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
            {cameraOn ? (
              <div className="space-y-2 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400 font-serif font-bold text-lg">
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="text-xs">Camera preview active</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Camera is turned off</span>
            )}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMicOn(!micOn)}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                  micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                  cameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <button
              type="button"
              disabled={!userName.trim()}
              onClick={() => setJoined(true)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Enter Room
            </button>

            <button
              type="button"
              onClick={onLeave}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel and Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // In-Meeting View
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-bold text-amber-400">Peace & Hope Meet</span>
          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            {roomId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-xl border border-slate-800 transition-colors cursor-pointer ${
              showChat ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Area: Grid & Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-center overflow-y-auto">
          {/* User's Tile */}
          <div className="relative aspect-16/10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-600 to-amber-400 text-slate-950 font-serif font-bold text-2xl flex items-center justify-center mx-auto">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium">{userName} (You)</span>
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px]">
              {micOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-500" />}
              <span>{micOn ? 'Speaking' : 'Muted'}</span>
            </div>

            {raisedHand && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" />
                <span>Hand Raised</span>
              </div>
            )}
          </div>

          {/* Participant 2 Placeholder Tile */}
          <div className="relative aspect-16/10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-amber-400 font-serif font-bold text-2xl flex items-center justify-center mx-auto">
                P
              </div>
              <span className="text-xs font-medium">Pastor / Host</span>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg text-[10px]">
              <Mic className="w-3 h-3 text-emerald-400" />
              <span>Host</span>
            </div>
          </div>
        </div>

        {/* In-Call Chat Drawer */}
        {showChat && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col">
            <div className="p-4 border-b border-slate-800 font-serif text-sm font-bold">
              Meeting Chat
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
              {messages.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400">{m.user_name}</span>
                  <p className="text-slate-200">{m.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                required
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer className="p-4 border-t border-slate-800 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMicOn(!micOn)}
          className={`p-3 rounded-full cursor-pointer transition-colors ${
            micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-3 rounded-full cursor-pointer transition-colors ${
            cameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => setRaisedHand(!raisedHand)}
          className={`p-3 rounded-full cursor-pointer transition-colors ${
            raisedHand ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
