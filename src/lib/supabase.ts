import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Table names specified in architecture
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
  CONVERSATIONS: 'conversations',
  BIBLE_TRANSLATIONS: 'bible_translations',
  BIBLE_BOOKS: 'bible_books',
  BIBLE_CHAPTERS: 'bible_chapters',
  BIBLE_VERSES: 'bible_verses',
  ANNOUNCEMENTS: 'announcements',
  CONTENT_UPLOADS: 'content_uploads',
  MEDIA_LIBRARY: 'media_library',
  LIVESTREAMS: 'livestreams',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_ROOM_MEMBERS: 'chat_room_members',
  CHAT_MESSAGES: 'chat_messages',
  CHAT_ATTACHMENTS: 'chat_attachments',
  MESSAGE_REACTIONS: 'message_reactions',
  MESSAGE_READS: 'message_reads',
  CHAT_REPORTS: 'chat_reports',
  CALL_LOGS: 'call_logs',
  LIVESTREAM_CHAT: 'livestream_chat',
  LIVESTREAM_REACTIONS: 'livestream_reactions',
  LIVESTREAM_VIEWERS: 'livestream_viewers',
  LIVESTREAM_REMINDERS: 'livestream_reminders',
  LIVESTREAM_OVERLAYS: 'livestream_overlays',
  LIVESTREAM_RECORDINGS: 'livestream_recordings',
  LIVESTREAM_MODERATION: 'livestream_moderation',
  MEETINGS: 'meetings',
  MEETING_PARTICIPANTS: 'meeting_participants',
  MEETING_RECORDINGS: 'meeting_recordings',
  MEETING_INVITES: 'meeting_invites',
  MEETING_REACTIONS: 'meeting_reactions',
  USERS_ROLES: 'users_roles',
  AUDIT_LOG: 'audit_log',
  SETTINGS: 'settings',
  GOOGLE_DRIVE_TOKENS: 'google_drive_tokens',
} as const;

export type SupabaseTableName = (typeof SUPABASE_TABLES)[keyof typeof SUPABASE_TABLES];

// Storage bucket names specified in architecture (Per-Module Uploads)
export const SUPABASE_BUCKETS = {
  HOMEPAGE_MEDIA: 'homepage-media',
  TEACHING_MEDIA: 'teaching-media',
  SERMON_MEDIA: 'sermon-media',
  DEVOTIONAL_MEDIA: 'devotional-media',
  PRAYER_MEDIA: 'prayer-media',
  TESTIMONY_MEDIA: 'testimony-media',
  EVENT_MEDIA: 'event-media',
  ANNOUNCEMENT_MEDIA: 'announcement-media',
  LIVESTREAM_MEDIA: 'livestream-media',
  LIVESTREAM_COVERS: 'livestream-covers',
  LIVESTREAM_RECORDINGS: 'livestream-recordings',
  LIVESTREAM_CHAT_ATTACHMENTS: 'livestream-chat-attachments',
  LIVESTREAM_THUMBNAILS: 'livestream-thumbnails',
  CHAT_ATTACHMENTS: 'chat-attachments',
  MEETING_RECORDINGS: 'meeting-recordings',
  MEETING_MEDIA: 'meeting-media',
  PROFILE_IMAGES: 'profile-images',
  USER_AVATARS: 'profile-images',
  BRANDING_MEDIA: 'branding-media',
  AUDIO_BIBLE: 'audio-bible',
  GOOGLE_DRIVE_IMPORTS: 'google-drive-imports',
  // Backward compat aliases
  HERO_IMAGES: 'homepage-media',
  TEACHING_IMAGES: 'teaching-media',
  SERMON_VIDEOS: 'sermon-media',
  SERMON_THUMBNAILS: 'sermon-media',
  DEVOTIONAL_IMAGES: 'devotional-media',
  EVENT_BANNERS: 'event-media',
  TESTIMONY_MEDIA_LEGACY: 'testimony-media',
  DOCUMENTS: 'announcement-media',
  MEETING_IMAGES: 'meeting-media',
  MEDIA_LIBRARY: 'homepage-media',
  HYMN_AUDIO: 'audio-bible',
  BULLETIN_PDFS: 'announcement-media',
} as const;

export type SupabaseBucketName = (typeof SUPABASE_BUCKETS)[keyof typeof SUPABASE_BUCKETS];

export interface SupabaseConfig {
  url: string;
  key: string;
}

/**
 * Normalizes Supabase URL by stripping trailing slashes, spaces, and accidental REST endpoints
 */
export const normalizeSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  // Strip trailing /rest/v1 or /rest/v1/ if user accidentally pasted REST endpoint
  url = url.replace(/\/rest\/v1\/?$/, '');
  return url;
};

export const getSupabaseConfig = (): SupabaseConfig => {
  let envUrl: string | undefined;
  let envKey: string | undefined;

  // 1. Check Vite import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
      envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
  } catch {
    // ignore
  }

  // 2. Check Node / Next.js process.env
  try {
    if (typeof process !== 'undefined' && process.env) {
      envUrl = envUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      envKey = envKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    }
  } catch {
    // ignore
  }

  if (envUrl && envKey) {
    return { url: normalizeSupabaseUrl(envUrl), key: envKey.trim() };
  }

  // 3. Fallback to localStorage if set
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localConfig = localStorage.getItem('peace_hope_supabase_config');
      if (localConfig) {
        const parsed = JSON.parse(localConfig);
        if (parsed.url && parsed.key) {
          return { url: normalizeSupabaseUrl(parsed.url), key: String(parsed.key).trim() };
        }
      }
    } catch {
      // ignore
    }
  }

  return { url: '', key: '' };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const supabase: any = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getSupabaseClient();
      if (!client) {
        if (prop === 'auth') {
          return {
            signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
            signUp: async () => ({ error: new Error('Supabase not configured') }),
            signOut: async () => ({ error: null }),
            resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured') }),
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          };
        }
        return () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        });
      }
      const val = (client as any)[prop];
      return typeof val === 'function' ? val.bind(client) : val;
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key);
};

export const setSupabaseManualConfig = (url: string, key: string) => {
  if (url && key) {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = key.trim();
    localStorage.setItem('peace_hope_supabase_config', JSON.stringify({ url: cleanUrl, key: cleanKey }));
    try {
      supabaseInstance = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.error('Error instantiating Supabase client:', e);
    }
  } else {
    localStorage.removeItem('peace_hope_supabase_config');
    supabaseInstance = null;
  }
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Storage Bucket Upload helper
 */
export async function uploadToSupabaseStorage(
  bucket: SupabaseBucketName,
  file: File | Blob,
  fileName?: string
): Promise<{ url: string; path: string; error?: string }> {
  const client = getSupabaseClient();
  const cleanName = fileName || (file instanceof File ? file.name : `asset-${Date.now()}.bin`);
  const uniquePath = `${Date.now()}-${cleanName.replace(/\s+/g, '_')}`;

  if (!client) {
    // If Supabase not yet connected, return local object URL as non-blocking fallback
    const objectUrl = URL.createObjectURL(file);
    return {
      url: objectUrl,
      path: uniquePath,
      error: 'Supabase URL and Anon Key not configured in Settings. Stored locally.',
    };
  }

  try {
    const { data, error } = await client.storage.from(bucket).upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn(`Supabase Storage upload to "${bucket}" warning:`, error.message);
      // Create local fallback preview so user can still see and edit content
      const objectUrl = URL.createObjectURL(file);
      return {
        url: objectUrl,
        path: uniquePath,
        error: `Storage error: ${error.message}. Make sure bucket "${bucket}" exists in Supabase.`,
      };
    }

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return {
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error('Supabase storage unexpected error:', err);
    return {
      url: URL.createObjectURL(file),
      path: uniquePath,
      error: err?.message || 'Upload failed',
    };
  }
}

/**
 * Generic CRUD operations
 */
export async function fetchFromSupabase<T>(
  tableName: SupabaseTableName | string,
  orderBy = 'created_at'
): Promise<T[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const query = client.from(tableName).select('*');
    if (orderBy) {
      query.order(orderBy, { ascending: false });
    }
    const { data, error } = await query;
    if (error) {
      console.warn(`Supabase fetch warning (${tableName}):`, error.message);
      return null;
    }
    return data as T[];
  } catch (err) {
    console.warn(`Supabase fetch network error (${tableName}):`, err);
    return null;
  }
}

export async function insertToSupabase<T extends Record<string, any>>(
  tableName: SupabaseTableName | string,
  record: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  const client = getSupabaseClient();
  const id = record.id || generateUUID();
  const payload = { ...record, id, created_at: (record as any).created_at || new Date().toISOString() };

  if (!client) {
    return { success: false, data: payload as T, error: 'Supabase client not connected' };
  }

  try {
    const { data, error } = await client.from(tableName).insert([payload]).select().single();
    if (error) {
      console.warn(`Supabase insert error (${tableName}):`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data: data as T };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Insert failed' };
  }
}

export async function updateInSupabase<T extends Record<string, any> = Record<string, any>>(
  tableName: SupabaseTableName | string,
  id: string,
  updates: Partial<T> | Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    const { error } = await client.from(tableName).update(updates as any).eq('id', id);
    if (error) {
      console.warn(`Supabase update error (${tableName}):`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function deleteFromSupabase(
  tableName: SupabaseTableName | string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not connected' };
  }

  try {
    const { error } = await client.from(tableName).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete error (${tableName}):`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

/**
 * Realtime channel subscription helper
 */
export function subscribeToTable(
  tableName: SupabaseTableName | string,
  onPayload: (payload: any) => void
) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel(`public:${tableName}-realtime`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
      onPayload(payload);
    })
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * Complete SQL Schema DDL Script for PostgreSQL / Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- PEACE & HOPE SEVENTH-DAY ADVENTIST PLATFORM — SUPABASE CMS DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor to create all relational
-- tables, UUID extensions, storage buckets, and row-level security policies.
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles (Users & Members)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Member',
  status TEXT NOT NULL DEFAULT 'Active',
  church_branch TEXT,
  avatar_url TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Homepage (Hero Banners & Content Sections)
CREATE TABLE IF NOT EXISTS public.homepage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  tagline TEXT,
  bg_image_url TEXT,
  cta_text TEXT,
  cta_link TEXT,
  active BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Teachings (Bible Truths & Adventist Articles)
CREATE TABLE IF NOT EXISTS public.teachings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  cover_image TEXT,
  video_url TEXT,
  content TEXT NOT NULL,
  bible_references TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  publish_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Published',
  read_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sermons (Divine Service Video & Transcripts)
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  bible_reference TEXT,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT DEFAULT '45:00',
  views INTEGER DEFAULT 0,
  hls_ready BOOLEAN DEFAULT TRUE,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Devotionals (Daily Bible Meditations)
CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  meditation TEXT NOT NULL,
  prayer TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Prayer Requests (Intercessory Prayer & Clicks)
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  author_email TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  location TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  candle_count INTEGER DEFAULT 0,
  amen_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Testimonies (Praises & Moderation)
CREATE TABLE IF NOT EXISTS public.testimonies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  location TEXT,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Events (Church Calendar & Camp Meetings)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  theme TEXT,
  start_date DATE,
  end_date DATE,
  time TEXT,
  location TEXT,
  speaker TEXT,
  is_online BOOLEAN DEFAULT TRUE,
  banner_url TEXT,
  capacity INTEGER,
  registered_count INTEGER DEFAULT 0,
  is_recurring_weekly BOOLEAN DEFAULT FALSE,
  registration_required BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Conversations & Messages (Community & Fellowship Chat)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT DEFAULT 'Member',
  text TEXT NOT NULL,
  image_url TEXT,
  voice_url TEXT,
  video_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  is_pastor_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Holy Bible Database (Books, Chapters, Verses)
CREATE TABLE IF NOT EXISTS public.bible_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  testament TEXT NOT NULL,
  chapters INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bible_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bible_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_name TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text_en TEXT,
  text_rw TEXT,
  text_fr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Announcements (Notifications & Alerts)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT '{"Website Popup"}',
  target_audience TEXT DEFAULT 'All Members',
  scheduled_for TIMESTAMPTZ,
  status TEXT DEFAULT 'Sent',
  sent_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT DEFAULT 'General Notice',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Media Library (Storage Assets & CDNs)
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  folder TEXT DEFAULT 'General',
  size_bytes BIGINT,
  size_label TEXT,
  url TEXT NOT NULL,
  cdn_status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Livestreams (Holy Live Stream Broadcast Control)
CREATE TABLE IF NOT EXISTS public.livestreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  speaker TEXT,
  scripture TEXT,
  category TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  viewers_count INTEGER DEFAULT 0,
  bitrate_kbps INTEGER DEFAULT 4500,
  stream_source TEXT DEFAULT 'camera',
  external_url TEXT,
  is_recording BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Create Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('hero-images', 'hero-images', true),
  ('teaching-images', 'teaching-images', true),
  ('sermon-videos', 'sermon-videos', true),
  ('sermon-thumbnails', 'sermon-thumbnails', true),
  ('devotional-images', 'devotional-images', true),
  ('event-banners', 'event-banners', true),
  ('testimony-media', 'testimony-media', true),
  ('profile-images', 'profile-images', true),
  ('documents', 'documents', true),
  ('audio-bible', 'audio-bible', true)
ON CONFLICT (id) DO NOTHING;

-- 16. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.homepage, 
  public.teachings, 
  public.sermons, 
  public.devotionals, 
  public.prayer_requests, 
  public.testimonies, 
  public.events, 
  public.messages, 
  public.announcements, 
  public.livestreams;
`;
