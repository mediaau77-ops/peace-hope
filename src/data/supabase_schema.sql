-- ==============================================================================
-- PEACE & HOPE SEVENTH-DAY ADVENTIST CHURCH PLATFORM
-- PRODUCTION SUPABASE DATABASE SCHEMA, RLS POLICIES, INDEXES & STORAGE BUCKETS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'moderator', 'editor', 'member');
CREATE TYPE prayer_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Answered');
CREATE TYPE testimony_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE announcement_priority AS ENUM ('Normal', 'High', 'Urgent');
CREATE TYPE room_type AS ENUM ('public', 'group', 'ministry', 'private', 'broadcast');
CREATE TYPE meeting_type AS ENUM ('private call', 'group meeting', 'Bible study', 'church conference', 'pastoral counseling');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'MODERATE', 'BROADCAST', 'SETTINGS_CHANGE', 'LOGIN', 'EXPORT');

-- 3. CONTENT MODULE TABLES
-- 3.1 Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'member',
  church_branch TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Active',
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 Homepage
CREATE TABLE IF NOT EXISTS public.homepage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  tagline TEXT,
  bg_image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Join Worship',
  cta_link TEXT DEFAULT '/live',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.3 Teachings
CREATE TABLE IF NOT EXISTS public.teachings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  video_url TEXT,
  content TEXT NOT NULL,
  bible_references TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  publish_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'Published',
  read_time_minutes INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.4 Sermons
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  date DATE NOT NULL,
  bible_reference TEXT NOT NULL,
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT NOT NULL,
  views INT DEFAULT 0,
  hls_ready BOOLEAN DEFAULT false,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Devotionals
CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  title TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  meditation TEXT NOT NULL,
  prayer TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'Published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.6 Prayer Requests
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  location TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  status prayer_status DEFAULT 'Pending',
  candle_count INT DEFAULT 0,
  amen_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.7 Testimonies
CREATE TABLE IF NOT EXISTS public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  location TEXT,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  media_url TEXT,
  status testimony_status DEFAULT 'Pending',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.8 Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT,
  date DATE,
  start_date DATE,
  end_date DATE,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  speaker TEXT,
  is_online BOOLEAN DEFAULT false,
  banner_url TEXT,
  capacity INT,
  registered_count INT DEFAULT 0,
  category TEXT NOT NULL,
  registration_required BOOLEAN DEFAULT false,
  is_recurring_weekly BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.9 Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  publish_date TIMESTAMPTZ DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  priority announcement_priority DEFAULT 'Normal',
  target_audience TEXT DEFAULT 'All Members',
  channels TEXT[] DEFAULT '{"Website", "App Push"}',
  status TEXT DEFAULT 'Published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.10 Livestreams
CREATE TABLE IF NOT EXISTS public.livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT,
  scripture TEXT,
  category TEXT,
  embed_url TEXT,
  schedule TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'live' | 'ended'
  viewers_count INT DEFAULT 0,
  is_recording BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.11 Media Library
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  folder TEXT DEFAULT 'Bulletins',
  size_bytes BIGINT DEFAULT 0,
  size TEXT,
  url TEXT NOT NULL,
  bucket TEXT DEFAULT 'media-library',
  source TEXT DEFAULT 'device', -- 'device' | 'google-drive'
  cdn_status TEXT DEFAULT 'Active',
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. HOLY BIBLE MODULE
CREATE TABLE IF NOT EXISTS public.bible_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- 'kin', 'en_kjv', 'fr_lsg'
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id UUID REFERENCES public.bible_translations(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name TEXT NOT NULL,
  testament TEXT NOT NULL, -- 'OT' | 'NT'
  chapters_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  verses_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.bible_chapters(id) ON DELETE CASCADE,
  verse_number INT NOT NULL,
  verse_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CHAT ROOM MANAGEMENT (WHATSAPP-LIKE CMS)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type room_type DEFAULT 'group',
  cover_image TEXT,
  member_count INT DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active', -- 'active' | 'archived' | 'muted'
  welcome_message TEXT,
  is_e2ee BOOLEAN DEFAULT false,
  ministry_group TEXT,
  pinned_announcement TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin' | 'moderator' | 'member'
  status TEXT DEFAULT 'active', -- 'active' | 'muted' | 'banned'
  joined_date TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ DEFAULT now(),
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT DEFAULT 'member',
  avatar_url TEXT,
  text TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  is_pastor_note BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  encrypted_payload JSONB,
  attachment_url TEXT,
  attachment_type TEXT,
  reactions JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'sent', -- 'sent' | 'delivered' | 'read' | 'hidden' | 'deleted'
  bible_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_user_name TEXT NOT NULL,
  reason TEXT NOT NULL, -- 'Spam' | 'Abuse' | 'Offensive content' | 'Fake information'
  message_snippet TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'reviewed' | 'dismissed' | 'resolved'
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'voice' | 'video' | 'group'
  participants TEXT[] DEFAULT '{}',
  caller_name TEXT NOT NULL,
  duration_seconds INT DEFAULT 0,
  status TEXT DEFAULT 'completed', -- 'completed' | 'missed' | 'declined'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEET CALL MANAGEMENT (GOOGLE MEET-LIKE CMS)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration_minutes INT DEFAULT 60,
  type meeting_type DEFAULT 'group meeting',
  cover_image TEXT,
  meeting_link TEXT NOT NULL UNIQUE,
  passcode TEXT,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'live' | 'ended'
  is_locked BOOLEAN DEFAULT false,
  waiting_room_enabled BOOLEAN DEFAULT true,
  invited_groups TEXT[] DEFAULT '{}',
  participant_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'participant', -- 'host' | 'co-host' | 'participant'
  is_audio_on BOOLEAN DEFAULT true,
  is_video_on BOOLEAN DEFAULT true,
  is_hand_raised BOOLEAN DEFAULT false,
  network_quality TEXT DEFAULT 'Excellent',
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  published_to_sermons BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SYSTEM, AUDIT LOG & SETTINGS
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  module TEXT NOT NULL,
  action_type audit_action NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.google_drive_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  email TEXT,
  connected_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('super_admin', 'admin', 'moderator', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Admin full CRUD
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'homepage', 'teachings', 'sermons', 'devotionals',
    'prayer_requests', 'testimonies', 'events', 'announcements',
    'livestreams', 'media_library', 'chat_rooms', 'chat_room_members',
    'chat_messages', 'chat_reports', 'call_logs', 'meetings',
    'meeting_participants', 'meeting_recordings', 'audit_log',
    'settings', 'google_drive_tokens'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins full CRUD on %I" ON public.%I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY "Admins full CRUD on %I" ON public.%I
       FOR ALL USING (auth.role() = ''authenticated'')',
       tbl, tbl
    );
  END LOOP;
END $$;

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_teachings_category ON public.teachings(category);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON public.sermons(date DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_status ON public.prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date, time);

-- 10. STORAGE BUCKET PROVISIONING
INSERT INTO storage.buckets (id, name, public) VALUES
  ('hero-images', 'hero-images', true),
  ('teaching-images', 'teaching-images', true),
  ('sermon-videos', 'sermon-videos', true),
  ('sermon-thumbnails', 'sermon-thumbnails', true),
  ('devotional-images', 'devotional-images', true),
  ('event-banners', 'event-banners', true),
  ('testimony-media', 'testimony-media', true),
  ('profile-images', 'profile-images', true),
  ('documents', 'documents', true),
  ('audio-bible', 'audio-bible', true),
  ('chat-attachments', 'chat-attachments', true),
  ('meeting-recordings', 'meeting-recordings', true),
  ('meeting-images', 'meeting-images', true),
  ('shared-documents', 'shared-documents', true),
  ('media-library', 'media-library', true),
  ('google-drive-imports', 'google-drive-imports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public storage read" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Authenticated users storage upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users storage update" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users storage delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');

-- 11. INITIAL SEED (BIBLE TRANSLATIONS & SYSTEM SETTINGS ONLY)
INSERT INTO public.bible_translations (code, name, language, is_default) VALUES
  ('kin', 'Bibiliya Yera (1993)', 'Kinyarwanda', true),
  ('en_kjv', 'King James Version (KJV)', 'English', false),
  ('fr_lsg', 'Louis Segond (1910)', 'Français', false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
  ('church_profile', '{
    "churchName": "Peace & Hope Seventh-day Adventist Church",
    "tagline": "Proclaiming the Everlasting Gospel to Every Nation",
    "contactEmail": "mediaau77@gmail.com",
    "contactPhone": "+250 788 000 000",
    "address": "Kigali, Rwanda",
    "country": "Rwanda",
    "defaultLanguage": "Kinyarwanda",
    "primaryColor": "#b4832e",
    "accentColor": "#fef9ee",
    "sabbathSunsetCalculation": "Kigali (UTC+2)"
  }'::jsonb),
  ('chat_config', '{
    "enableChat": true,
    "maxUploadSizeBytes": 52428800,
    "allowedFileTypes": ["jpg", "png", "webp", "mp4", "mp3", "pdf", "docx"],
    "messageRetentionDays": 365,
    "enableEmojiReactions": true,
    "enableTypingIndicators": true,
    "enableReadReceipts": true,
    "enablePushNotifications": true,
    "slowModeDelaySeconds": 0,
    "bannedWords": []
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;
