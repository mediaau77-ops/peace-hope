import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PostgresChangesConfig {
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table: string;
  filter?: string;
}

interface UseRealtimeChannelOptions {
  table: string;
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  onPayload: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Generic safe Realtime hook following singleton discipline:
 * - Generates unique channel names per instance
 * - Chains .on() BEFORE .subscribe()
 * - Cleans up cleanly on unmount with supabase.removeChannel
 * - Catches any error and logs at debug level
 */
export function useRealtimeChannel({
  table,
  event = '*',
  filter,
  onPayload,
  enabled = true,
}: UseRealtimeChannelOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlerRef = useRef(onPayload);

  // Keep latest callback reference
  useEffect(() => {
    handlerRef.current = onPayload;
  }, [onPayload]);

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    let isMounted = true;
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
    const channelName = `realtime-${table}-${uniqueId}`;

    try {
      const channel = supabase.channel(channelName);
      const config: PostgresChangesConfig = {
        event,
        schema: 'public',
        table,
      };
      if (filter) {
        config.filter = filter;
      }

      channel
        .on('postgres_changes', config as any, (payload) => {
          if (!isMounted) return;
          try {
            handlerRef.current?.(payload);
          } catch (err) {
            console.debug(`Error in realtime handler for ${table}:`, err);
          }
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.debug(`Realtime channel status for ${table}:`, status);
          }
        });

      channelRef.current = channel;
    } catch (err) {
      console.debug(`Failed to setup realtime channel for ${table}:`, err);
    }

    return () => {
      isMounted = false;
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (err) {
          console.debug(`Error tearing down channel for ${table}:`, err);
        }
        channelRef.current = null;
      }
    };
  }, [table, event, filter, enabled]);
}
