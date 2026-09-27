import { getDbClient, SUPABASE_TABLES } from '../db/client';
import { AuthenticatedUser } from '../auth/requireUser';
import { broadcastToStream } from '../realtime/relay';

const lastChatSentByUser = new Map<string, number>();

export async function getActiveLivestream() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .select('*')
    .eq('status', 'live')
    .eq('is_public', true)
    .order('actual_start_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getScheduledOrLatestLivestream() {
  const supabase = getDbClient();
  // 1. Live
  const active = await getActiveLivestream();
  if (active) return active;

  // 2. Upcoming scheduled
  const { data: scheduled } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .select('*')
    .eq('status', 'scheduled')
    .eq('is_public', true)
    .order('scheduled_start_at', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (scheduled) return scheduled;

  // 3. Most recently ended
  const { data: ended } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .select('*')
    .eq('status', 'ended')
    .eq('is_public', true)
    .order('ended_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  return ended || null;
}

export async function listLivestreams(page = 1, limit = 20, status?: string) {
  const supabase = getDbClient();
  let query = supabase.from(SUPABASE_TABLES.LIVESTREAMS).select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count || 0, page, limit };
}

export async function getLivestreamById(id: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createLivestream(params: {
  title: string;
  description?: string;
  scheduledStartAt?: string;
  provider?: string;
  isPublic?: boolean;
  chatEnabled?: boolean;
  reactionsEnabled?: boolean;
}, hostUserId?: string) {
  const supabase = getDbClient();
  const provider = params.provider || 'mux';
  const streamKey = `live_ph_${provider}_${Math.random().toString(36).substring(2, 10)}`;
  const ingestUrl = provider === 'livekit'
    ? 'wss://peacehope-livekit.cloud.livekit.io'
    : 'rtmps://global-live.mux.com:443/app';

  const newRow = {
    title: params.title,
    description: params.description || '',
    scheduled_start_at: params.scheduledStartAt || null,
    status: 'scheduled',
    stream_provider: provider,
    stream_key: streamKey,
    ingest_url: ingestUrl,
    playback_url: null, // Only written when started
    host_user_id: hostUserId || null,
    is_public: params.isPublic ?? true,
    chat_enabled: params.chatEnabled ?? true,
    reactions_enabled: params.reactionsEnabled ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .insert(newRow)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLivestream(id: string, updates: Record<string, any>) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  broadcastToStream(id, 'status', data);
  return data;
}

export async function goLive(id: string) {
  const stream = await getLivestreamById(id);
  if (!stream) throw new Error('Stream not found');

  const provider = stream.stream_provider || 'mux';
  const playbackUrl = provider === 'livekit'
    ? `wss://peacehope-livekit.cloud.livekit.io/room/${id}`
    : `https://stream.mux.com/${id}.m3u8`;

  const updated = await updateLivestream(id, {
    status: 'live',
    actual_start_at: new Date().toISOString(),
    playback_url: playbackUrl,
  });

  broadcastToStream(id, 'status', updated);
  return updated;
}

export async function endStream(id: string) {
  const updated = await updateLivestream(id, {
    status: 'ended',
    ended_at: new Date().toISOString(),
  });

  broadcastToStream(id, 'status', updated);
  return updated;
}

export async function deleteLivestream(id: string) {
  const supabase = getDbClient();
  const { error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAMS)
    .delete()
    .eq('id', id);

  if (error) throw error;
  broadcastToStream(id, 'status', { id, status: 'deleted' });
  return true;
}

export async function getChatMessages(streamId: string, limit = 100) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_CHAT)
    .select('*')
    .eq('livestream_id', streamId)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function postChatMessage(
  streamId: string,
  user: AuthenticatedUser,
  content: string,
  messageType: 'text' | 'verse' | 'emoji' = 'text'
) {
  const now = Date.now();
  const lastSent = lastChatSentByUser.get(user.id) || 0;
  if (now - lastSent < 2000) {
    const waitSec = Math.ceil((2000 - (now - lastSent)) / 1000);
    const err: any = new Error(`Rate limited. Please wait ${waitSec}s.`);
    err.status = 429;
    err.code = 'RATE_LIMITED';
    throw err;
  }

  const supabase = getDbClient();

  // Ensure profiles row exists (id = auth user id, full_name, avatar_url, role = member)
  try {
    const { data: profile } = await supabase
      .from(SUPABASE_TABLES.PROFILES)
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from(SUPABASE_TABLES.PROFILES).insert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
        role: user.role || 'member',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.debug('[CHAT SERVICE] Profile check:', e);
  }

  const newMsg = {
    livestream_id: streamId,
    user_id: user.id, // Strictly authenticated user
    guest_name: user.fullName, // Google display name
    media_url: user.avatarUrl,
    message_type: messageType,
    content: content.trim(),
    pinned: false,
    status: 'visible',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_CHAT)
    .insert(newMsg)
    .select()
    .single();

  if (error) throw error;
  lastChatSentByUser.set(user.id, now);
  broadcastToStream(streamId, 'chat', data);
  return data;
}

export async function postReaction(streamId: string, user: AuthenticatedUser, emoji: string) {
  const supabase = getDbClient();
  const newReaction = {
    livestream_id: streamId,
    user_id: user.id,
    emoji,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_REACTIONS)
    .insert(newReaction)
    .select()
    .single();

  if (error) throw error;
  broadcastToStream(streamId, 'reaction', data);
  return data;
}

export async function getOverlays(streamId: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_OVERLAYS)
    .select('*')
    .eq('livestream_id', streamId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data || null;
}

export async function pushOverlay(
  streamId: string,
  type: 'bible_verse' | 'announcement' | 'lower_third',
  content: Record<string, any>,
  durationSeconds = 15,
  userId?: string
) {
  const supabase = getDbClient();
  // Clear previous active overlays
  await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_OVERLAYS)
    .update({ active: false })
    .eq('livestream_id', streamId);

  const newOverlay = {
    livestream_id: streamId,
    type,
    content,
    duration_seconds: durationSeconds,
    created_by: userId || null,
    active: true,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_OVERLAYS)
    .insert(newOverlay)
    .select()
    .single();

  if (error) throw error;
  broadcastToStream(streamId, 'overlay', data);
  return data;
}

export async function createLivestreamReminder(streamId: string, email: string, sendAt?: string) {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.LIVESTREAM_REMINDERS)
    .insert({
      livestream_id: streamId,
      email: email.trim(),
      send_at: sendAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
