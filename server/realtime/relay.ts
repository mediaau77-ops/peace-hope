import { Response } from 'express';
import { getDbClient, SUPABASE_TABLES } from '../db/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface StreamRelayHub {
  streamId: string;
  clients: Set<Response>;
  channel: RealtimeChannel;
  viewerCount: number;
}

const activeHubs = new Map<string, StreamRelayHub>();

/**
 * Broadcast an SSE event to all connected clients for a specific streamId
 */
export function broadcastToStream(streamId: string, event: string, data: any) {
  const hub = activeHubs.get(streamId);
  if (!hub) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  hub.clients.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      hub.clients.delete(res);
    }
  });
}

/**
 * Register a client Response to the Server-Sent Events stream for streamId
 */
export function registerStreamSSE(streamId: string, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if proxied
  res.flushHeaders?.();

  let hub = activeHubs.get(streamId);

  if (!hub) {
    const supabase = getDbClient();
    const channelName = `server-relay-stream-${streamId}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    hub = {
      streamId,
      clients: new Set<Response>(),
      channel,
      viewerCount: 0,
    };
    activeHubs.set(streamId, hub);

    // Subscribe to database changes on Supabase Realtime
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LIVESTREAMS, filter: `id=eq.${streamId}` },
        (payload) => {
          broadcastToStream(streamId, 'status', payload.new || { status: 'ended' });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: SUPABASE_TABLES.LIVESTREAM_CHAT, filter: `livestream_id=eq.${streamId}` },
        (payload) => {
          broadcastToStream(streamId, 'chat', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: SUPABASE_TABLES.LIVESTREAM_CHAT, filter: `livestream_id=eq.${streamId}` },
        (payload) => {
          broadcastToStream(streamId, 'chat_update', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: SUPABASE_TABLES.LIVESTREAM_REACTIONS, filter: `livestream_id=eq.${streamId}` },
        (payload) => {
          broadcastToStream(streamId, 'reaction', payload.new);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LIVESTREAM_OVERLAYS, filter: `livestream_id=eq.${streamId}` },
        (payload) => {
          broadcastToStream(streamId, 'overlay', payload.new || null);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.debug('[SSE RELAY] Supabase channel error for stream:', streamId);
        }
      });
  }

  // Register client
  hub.clients.add(res);
  hub.viewerCount += 1;

  // Send connected greeting and current viewer count
  res.write(`event: connected\ndata: ${JSON.stringify({ streamId, connected: true })}\n\n`);
  broadcastToStream(streamId, 'presence', { viewerCount: hub.viewerCount });

  // Heartbeat keep-alive every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  res.on('close', () => {
    clearInterval(heartbeat);
    if (!hub) return;

    hub.clients.delete(res);
    hub.viewerCount = Math.max(0, hub.viewerCount - 1);
    broadcastToStream(streamId, 'presence', { viewerCount: hub.viewerCount });

    // Clean up channel when last client disconnects
    if (hub.clients.size === 0) {
      const supabase = getDbClient();
      supabase.removeChannel(hub.channel).catch(() => {});
      activeHubs.delete(streamId);
    }
  });
}
