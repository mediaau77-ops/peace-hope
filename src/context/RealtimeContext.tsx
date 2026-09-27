import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getOutboxMessages, removeFromOutbox } from '../lib/offlineStorage';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export type PresenceStatus =
  | 'online'
  | 'away'
  | 'busy'
  | 'offline'
  | 'in_meeting'
  | 'on_call'
  | 'recording_voice'
  | 'typing'
  | 'reading';

export interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  status: PresenceStatus;
  currentRoomId?: string;
  lastSeen: string;
}

interface RealtimeContextType {
  connectionStatus: ConnectionStatus;
  userPresence: PresenceStatus;
  setUserPresence: (status: PresenceStatus) => Promise<void>;
  activePresences: Record<string, UserPresence>;
  typingUsers: Record<string, string[]>; // roomId -> array of user names
  setTyping: (roomId: string, isTyping: boolean) => void;
  pendingSyncCount: number;
  syncOfflineQueue: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'connected'
  );
  const [userPresence, setUserPresenceState] = useState<PresenceStatus>('online');
  const [activePresences, setActivePresences] = useState<Record<string, UserPresence>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Sync outbox from IndexedDB
  const syncOfflineQueue = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const items = await getOutboxMessages();
      setPendingSyncCount(items.length);

      for (const item of items) {
        try {
          const { error } = await supabase.from('chat_messages').insert([item.payload]);
          if (!error) {
            await removeFromOutbox(item.id);
          }
        } catch {
          // keep in queue for next retry
        }
      }

      const remaining = await getOutboxMessages();
      setPendingSyncCount(remaining.length);
    } catch (err) {
      console.debug('Failed to flush outbox:', err);
    }
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('reconnecting');
      setTimeout(() => {
        setConnectionStatus('connected');
        syncOfflineQueue();
      }, 1000);
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineQueue]);

  // Supabase Presence Channel & Heartbeat
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
    const channelName = `presence-global-${uniqueId}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: uniqueId },
        broadcast: { self: false },
      },
    });

    presenceChannelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const map: Record<string, UserPresence> = {};
        Object.entries(state).forEach(([key, presences]: [string, any]) => {
          if (presences && presences[0]) {
            const p = presences[0];
            map[p.userId || key] = {
              userId: p.userId || key,
              userName: p.userName || 'Member',
              avatarUrl: p.avatarUrl,
              status: p.status || 'online',
              currentRoomId: p.currentRoomId,
              lastSeen: new Date().toISOString(),
            };
          }
        });
        setActivePresences(map);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || !payload.roomId || !payload.userName) return;
        const { roomId, userName, isTyping } = payload;

        setTypingUsers((prev) => {
          const current = prev[roomId] || [];
          if (isTyping) {
            if (!current.includes(userName)) {
              return { ...prev, [roomId]: [...current, userName] };
            }
          } else {
            return { ...prev, [roomId]: current.filter((u) => u !== userName) };
          }
          return prev;
        });

        // Auto-clear typing indicator after 4 seconds
        if (isTyping) {
          const timerKey = `${roomId}-${userName}`;
          if (typingTimers.current[timerKey]) {
            clearTimeout(typingTimers.current[timerKey]);
          }
          typingTimers.current[timerKey] = setTimeout(() => {
            setTypingUsers((prev) => ({
              ...prev,
              [roomId]: (prev[roomId] || []).filter((u) => u !== userName),
            }));
          }, 4000);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          channel.track({
            status: userPresence,
            lastSeen: new Date().toISOString(),
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('reconnecting');
        }
      });

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current).catch(() => {});
        presenceChannelRef.current = null;
      }
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [userPresence]);

  const setUserPresence = async (status: PresenceStatus) => {
    setUserPresenceState(status);
    if (presenceChannelRef.current) {
      try {
        await presenceChannelRef.current.track({
          status,
          lastSeen: new Date().toISOString(),
        });
      } catch (e) {
        console.debug('Failed to track presence state:', e);
      }
    }
  };

  const setTyping = (roomId: string, isTyping: boolean) => {
    if (presenceChannelRef.current) {
      presenceChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          roomId,
          userName: 'You',
          isTyping,
        },
      });
    }
  };

  return (
    <RealtimeContext.Provider
      value={{
        connectionStatus,
        userPresence,
        setUserPresence,
        activePresences,
        typingUsers,
        setTyping,
        pendingSyncCount,
        syncOfflineQueue,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

/**
 * Header Connection Status Pill (Silent when connected, clear indicator when offline/reconnecting)
 */
export const ConnectionStatusIndicator: React.FC = () => {
  const { connectionStatus, pendingSyncCount, syncOfflineQueue } = useRealtime();

  if (connectionStatus === 'connected' && pendingSyncCount === 0) {
    return null; // Silent when fully online and synced
  }

  return (
    <div className="flex items-center gap-2">
      {connectionStatus === 'offline' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <WifiOff className="w-3 h-3" />
          <span>Offline (Cached)</span>
        </span>
      )}

      {connectionStatus === 'reconnecting' && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Reconnecting...</span>
        </span>
      )}

      {pendingSyncCount > 0 && (
        <button
          type="button"
          onClick={syncOfflineQueue}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
          title="Click to sync cached messages"
        >
          <span>{pendingSyncCount} unsynced</span>
        </button>
      )}
    </div>
  );
};
