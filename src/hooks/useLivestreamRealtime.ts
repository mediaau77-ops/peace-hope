import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPatch } from '../lib/api-client';
import { LivestreamRecord, LivestreamChatMessage, LivestreamOverlay } from '../types/livestream';

/**
 * Hook to retrieve the currently active live broadcast (or latest scheduled/ended)
 * Fetches strictly from the backend API: GET /api/livestreams/active or current
 */
export function useLivestream(mode: 'active' | 'current' | string = 'current') {
  const [stream, setStream] = useState<LivestreamRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(async () => {
    try {
      const endpoint = mode === 'active'
        ? '/api/livestreams/active'
        : mode === 'current'
        ? '/api/livestreams/current'
        : `/api/livestreams/${mode}`;

      const data = await apiGet<LivestreamRecord | null>(endpoint);
      setStream(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch livestream');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  // Connect to SSE realtime relay if a stream exists
  useEffect(() => {
    if (!stream?.id) return;

    const eventSource = new EventSource(`/api/realtime/livestream/${stream.id}`);

    eventSource.addEventListener('status', (e: MessageEvent) => {
      try {
        const updated = JSON.parse(e.data);
        if (updated.status === 'deleted') {
          setStream(null);
        } else {
          setStream(updated);
        }
      } catch (err) {
        console.debug('[SSE] Failed to parse status event:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [stream?.id]);

  const updateStatus = async (
    newStatus: LivestreamRecord['status'],
    options?: { playbackUrl?: string; ingestUrl?: string; streamKey?: string; title?: string; description?: string }
  ): Promise<boolean> => {
    try {
      if (newStatus === 'live' && stream?.id) {
        const updated = await apiPost<LivestreamRecord>(`/api/livestreams/${stream.id}/go-live`);
        setStream(updated);
        return true;
      } else if (newStatus === 'ended' && stream?.id) {
        const updated = await apiPost<LivestreamRecord>(`/api/livestreams/${stream.id}/end`);
        setStream(updated);
        return true;
      } else if (stream?.id) {
        const updated = await apiPatch<LivestreamRecord>(`/api/livestreams/${stream.id}`, {
          status: newStatus,
          ...options,
        });
        setStream(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[LIVESTREAM] updateStatus error:', err);
      return false;
    }
  };

  const createScheduledStream = async (params: {
    title: string;
    description?: string;
    scheduledStartAt: string;
    provider?: string;
  }): Promise<LivestreamRecord | null> => {
    try {
      const created = await apiPost<LivestreamRecord>('/api/livestreams', params);
      setStream(created);
      return created;
    } catch (err) {
      console.error('[LIVESTREAM] createScheduledStream error:', err);
      return null;
    }
  };

  return {
    stream,
    loading,
    error,
    refresh: fetchStream,
    updateStatus,
    createScheduledStream,
  };
}

/**
 * Realtime Presence Hook via SSE
 */
export function useLivestreamPresence(streamId?: string, initialCount = 0) {
  const [viewerCount, setViewerCount] = useState<number>(initialCount);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!streamId) {
      setViewerCount(0);
      setIsConnected(false);
      return;
    }

    const eventSource = new EventSource(`/api/realtime/livestream/${streamId}`);

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    eventSource.addEventListener('presence', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.viewerCount === 'number') {
          setViewerCount(data.viewerCount);
        }
      } catch (err) {
        console.debug('[SSE PRESENCE] Parse error:', err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [streamId]);

  return { viewerCount, isConnected };
}

/**
 * Realtime Fellowship Chat Hook via SSE + Backend API
 */
export function useLivestreamChat(streamId?: string) {
  const [messages, setMessages] = useState<LivestreamChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatEnabled, setChatEnabled] = useState<boolean>(true);
  const [slowMode, setSlowMode] = useState<boolean>(false);

  // Initial fetch
  const fetchChat = useCallback(async () => {
    if (!streamId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet<LivestreamChatMessage[]>(`/api/livestreams/${streamId}/chat`);
      setMessages(data || []);
    } catch (err) {
      console.debug('[CHAT] Initial fetch error:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  // Connect to SSE for new incoming chat messages
  useEffect(() => {
    if (!streamId) return;

    const eventSource = new EventSource(`/api/realtime/livestream/${streamId}`);

    eventSource.addEventListener('chat', (e: MessageEvent) => {
      try {
        const newMsg: LivestreamChatMessage = JSON.parse(e.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } catch (err) {
        console.debug('[SSE CHAT] Parse error:', err);
      }
    });

    eventSource.addEventListener('chat_update', (e: MessageEvent) => {
      try {
        const updatedMsg: LivestreamChatMessage = JSON.parse(e.data);
        setMessages((prev) =>
          updatedMsg.status === 'hidden'
            ? prev.filter((m) => m.id !== updatedMsg.id)
            : prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      } catch (err) {
        console.debug('[SSE CHAT_UPDATE] Parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [streamId]);

  const sendMessage = async (
    content: string,
    messageType: 'text' | 'verse' = 'text'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!streamId) return { success: false, error: 'No active livestream' };

    try {
      const created = await apiPost<LivestreamChatMessage>(`/api/livestreams/${streamId}/chat`, {
        content,
        messageType,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send message' };
    }
  };

  const deleteMessage = async (msgId: string): Promise<boolean> => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    return true;
  };

  const togglePinMessage = async (msgId: string, pinned: boolean): Promise<boolean> => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, pinned } : m)));
    return true;
  };

  return {
    messages,
    loading,
    chatEnabled,
    setChatEnabled,
    slowMode,
    setSlowMode,
    sendMessage,
    deleteMessage,
    togglePinMessage,
  };
}

/**
 * Realtime Reactions Hook via SSE + Backend API
 */
export function useLivestreamReactions(streamId?: string) {
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; left: number }[]>([]);

  useEffect(() => {
    if (!streamId) return;

    const eventSource = new EventSource(`/api/realtime/livestream/${streamId}`);

    eventSource.addEventListener('reaction', (e: MessageEvent) => {
      try {
        const item = JSON.parse(e.data);
        const emoji = item.emoji;
        if (!emoji) return;

        setReactionCounts((prev) => ({
          ...prev,
          [emoji]: (prev[emoji] || 0) + 1,
        }));

        const id = `${Date.now()}_${Math.random()}`;
        const left = Math.floor(15 + Math.random() * 70);
        setFloatingEmojis((prev) => [...prev.slice(-15), { id, emoji, left }]);

        setTimeout(() => {
          setFloatingEmojis((prev) => prev.filter((r) => r.id !== id));
        }, 2500);
      } catch (err) {
        console.debug('[SSE REACTION] Parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [streamId]);

  const sendReaction = async (emoji: string) => {
    if (!streamId) return;

    // Optimistic UI bump
    setReactionCounts((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    const id = `${Date.now()}_${Math.random()}`;
    const left = Math.floor(15 + Math.random() * 70);
    setFloatingEmojis((prev) => [...prev.slice(-15), { id, emoji, left }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((r) => r.id !== id));
    }, 2500);

    try {
      await apiPost(`/api/livestreams/${streamId}/reactions`, { emoji });
    } catch {
      // Non-blocking reaction error
    }
  };

  return { reactionCounts, floatingEmojis, sendReaction };
}

/**
 * Realtime Screen Overlays Hook via SSE + Backend API
 */
export function useLivestreamOverlays(streamId?: string) {
  const [activeOverlay, setActiveOverlay] = useState<LivestreamOverlay | null>(null);

  useEffect(() => {
    if (!streamId) {
      setActiveOverlay(null);
      return;
    }

    // Initial fetch
    apiGet<LivestreamOverlay | null>(`/api/livestreams/${streamId}/overlays`)
      .then((data) => setActiveOverlay(data))
      .catch(() => setActiveOverlay(null));

    const eventSource = new EventSource(`/api/realtime/livestream/${streamId}`);

    eventSource.addEventListener('overlay', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setActiveOverlay(data);
      } catch (err) {
        console.debug('[SSE OVERLAY] Parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [streamId]);

  const pushOverlay = async (
    type: 'bible_verse' | 'announcement' | 'lower_third',
    content: Record<string, any>,
    durationSeconds = 15
  ) => {
    if (!streamId) return;
    try {
      const created = await apiPost<LivestreamOverlay>(`/api/livestreams/${streamId}/overlays`, {
        type,
        content,
        durationSeconds,
      });
      setActiveOverlay(created);
    } catch (err) {
      console.error('[OVERLAY] pushOverlay error:', err);
    }
  };

  const clearOverlay = async () => {
    setActiveOverlay(null);
  };

  return { activeOverlay, pushOverlay, clearOverlay };
}
