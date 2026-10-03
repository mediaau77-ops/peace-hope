import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Server-only Supabase Service Role client.
 * This client is strictly instantiated on the backend and NEVER bundled into the client.
 */
let cachedClient: SupabaseClient | null = null;
let hasWarnedMissingSupabase = false;

export function getDbClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    'https://placeholder.supabase.co';

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'placeholder-service-role-key';

  if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL && !hasWarnedMissingSupabase) {
    hasWarnedMissingSupabase = true;
    console.warn('[SERVER DB] Supabase environment is not configured. Falling back to a safe placeholder client so the app can boot without secrets.');
  }

  cachedClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export const SUPABASE_TABLES = {
  PROFILES: 'profiles',
  HOMEPAGE: 'homepage',
  HOMEPAGE_SECTIONS: 'homepage_sections',
  TEACHINGS: 'teachings',
  SERMONS: 'sermons',
  DEVOTIONALS: 'devotionals',
  PRAYER_REQUESTS: 'prayer_requests',
  TESTIMONIES: 'testimonies',
  EVENTS: 'events',
  MESSAGES: 'messages',
  MEDIA_LIBRARY: 'media_library',
  SETTINGS: 'settings',
  ANNOUNCEMENTS: 'announcements',
  LIVESTREAMS: 'livestreams',
  LIVESTREAM_CHAT: 'livestream_chat',
  LIVESTREAM_REACTIONS: 'livestream_reactions',
  LIVESTREAM_OVERLAYS: 'livestream_overlays',
  LIVESTREAM_VIEWERS: 'livestream_viewers',
  LIVESTREAM_REMINDERS: 'livestream_reminders',
  LIVESTREAM_RECORDINGS: 'livestream_recordings',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_ROOM_MEMBERS: 'chat_room_members',
  CHAT_MESSAGES: 'chat_messages',
  MESSAGE_REACTIONS: 'message_reactions',
  MEETINGS: 'meetings',
  MEETING_PARTICIPANTS: 'meeting_participants',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  AUDIT_LOG: 'audit_log',
} as const;
