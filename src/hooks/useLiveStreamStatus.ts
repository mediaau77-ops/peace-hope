import { useState, useEffect } from 'react';
import { getSupabaseClient, SUPABASE_TABLES } from '../lib/supabase';
import { fetchPublicLivestream } from '../lib/publicQueries';
import { PublicLivestream } from '../types/public';

type LiveStreamListener = (live: PublicLivestream | null) => void;

// Module-level singleton state
let currentLiveStream: PublicLivestream | null = null;
let hasInitialFetched = false;
let isFetching = false;
let activeChannel: any = null;
const listeners = new Set<LiveStreamListener>();

async function refreshLivestream() {
  if (isFetching) return;
  isFetching = true;
  try {
    const live = await fetchPublicLivestream();
    currentLiveStream = live;
    listeners.forEach((listener) => {
      try {
        listener(live);
      } catch (err) {
        console.debug('Error in livestream listener:', err);
      }
    });
  } catch (err) {
    console.debug('Failed to fetch livestream status:', err);
  } finally {
    isFetching = false;
    hasInitialFetched = true;
  }
}

function setupLivestreamChannel() {
  const supabase = getSupabaseClient();
  if (!supabase || activeChannel) return;

  try {
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
    const channelName = `livestream-status-${uniqueId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LIVESTREAMS },
        () => {
          try {
            refreshLivestream();
          } catch (err) {
            console.debug('Error processing livestream realtime event:', err);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.debug('Livestream realtime status:', status);
        }
      });

    activeChannel = channel;
  } catch (err) {
    console.debug('Failed to initialize livestream realtime channel:', err);
  }
}

function teardownLivestreamChannel() {
  if (listeners.size === 0 && activeChannel) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        supabase.removeChannel(activeChannel);
      } catch (err) {
        console.debug('Error removing livestream channel:', err);
      }
    }
    activeChannel = null;
  }
}

export function useLiveStreamStatus(): {
  liveStream: PublicLivestream | null;
  isLive: boolean;
  refresh: () => Promise<void>;
} {
  const [liveStream, setLiveStream] = useState<PublicLivestream | null>(currentLiveStream);

  useEffect(() => {
    let isMounted = true;

    const listener: LiveStreamListener = (live) => {
      if (isMounted) {
        setLiveStream(live);
      }
    };

    listeners.add(listener);

    // Initial fetch if not done yet
    if (!hasInitialFetched) {
      refreshLivestream();
    } else {
      setLiveStream(currentLiveStream);
    }

    // Set up channel if this is the first listener
    if (!activeChannel) {
      setupLivestreamChannel();
    }

    return () => {
      isMounted = false;
      listeners.delete(listener);
      teardownLivestreamChannel();
    };
  }, []);

  return {
    liveStream,
    isLive: Boolean(liveStream && liveStream.status === 'live'),
    refresh: refreshLivestream,
  };
}
