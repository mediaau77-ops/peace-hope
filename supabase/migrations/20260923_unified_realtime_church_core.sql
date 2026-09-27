-- =========================================================================
-- PEACE & HOPE SEVENTH-DAY ADVENTIST PLATFORM
-- UNIFIED REAL-TIME COMMUNICATION CORE & DATABASE MIGRATION
-- WhatsApp-Style Messaging + Google Meet-Style Meetings + SDA Church Tools
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member',
  church_branch TEXT DEFAULT 'Peace & Hope Central',
  avatar_url TEXT,
  phone TEXT,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'fr', 'rw', 'sw')),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 2. LIVESTREAMS (Fixes PGRST205 missing table error)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.livestreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Sabbath Divine Worship',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'live', 'ended')),
  stream_provider TEXT NOT NULL DEFAULT 'mux',
  stream_key TEXT,
  ingest_url TEXT,
  playback_url TEXT,
  hls_url TEXT,
  stream_url TEXT,
  streamServerUrl TEXT,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  chat_enabled BOOLEAN DEFAULT TRUE,
  reactions_enabled BOOLEAN DEFAULT TRUE,
  recording_enabled BOOLEAN DEFAULT TRUE,
  language_default TEXT DEFAULT 'en',
  viewer_count INTEGER DEFAULT 0,
  actual_start_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 3. CHAT ROOMS & CHANNELS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('public', 'group', 'private', 'broadcast', 'department')),
  is_private BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  auto_provisioned_key TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 4. CHAT ROOM MEMBERS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  muted_until TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- -------------------------------------------------------------------------
-- 5. CHAT MESSAGES (Supports 12+ Message Types)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT 'Church Member',
  user_avatar TEXT,
  message_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (message_type IN (
    'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE_NOTE',
    'DOCUMENT', 'LOCATION', 'CONTACT', 'BIBLE_VERSE',
    'POLL', 'SYSTEM', 'MEETING_INVITE', 'LIVE_WORSHIP_INVITE'
  )),
  content TEXT NOT NULL,
  message TEXT, -- alias for content
  media_url TEXT,
  media_meta JSONB DEFAULT '{}'::jsonb,
  reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  mentions TEXT[] DEFAULT '{}'::text[],
  hashtags TEXT[] DEFAULT '{}'::text[],
  bible_reference TEXT,
  poll_data JSONB DEFAULT '{}'::jsonb,
  pinned BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- -------------------------------------------------------------------------
-- 6. MESSAGE REACTIONS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- -------------------------------------------------------------------------
-- 7. WHATSAPP-STYLE 24-HOUR STATUS / STORIES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'verse', 'event')),
  content TEXT NOT NULL,
  media_url TEXT,
  verse_reference TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 8. MEETINGS & VIDEO CONFERENCES (Google Meet-style)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL DEFAULT 'Meeting Host',
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'group' CHECK (type IN (
    'private', 'group', 'bible_study', 'conference',
    'pastoral', 'classroom', 'broadcast'
  )),
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  date TEXT,
  time TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  is_public BOOLEAN DEFAULT TRUE,
  waiting_room BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  recording_enabled BOOLEAN DEFAULT TRUE,
  recording_url TEXT,
  sermon_id UUID,
  join_url TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 9. MEETING PARTICIPANTS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'attendee' CHECK (role IN ('host', 'cohost', 'speaker', 'attendee')),
  audio_muted BOOLEAN DEFAULT FALSE,
  video_muted BOOLEAN DEFAULT FALSE,
  hand_raised BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- -------------------------------------------------------------------------
-- 10. PRESENCE SYSTEM
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN (
    'online', 'away', 'busy', 'offline', 'in_meeting',
    'on_call', 'recording_voice', 'typing', 'reading'
  )),
  current_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 11. NOTIFICATION ENGINE & PREFERENCES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'message', 'mention', 'incoming_call', 'meeting_invite', 'meeting_starting',
    'church_announcement', 'prayer_request', 'event_reminder', 'sermon_published', 'devotional_published'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  prayer_notifications BOOLEAN DEFAULT TRUE,
  meeting_notifications BOOLEAN DEFAULT TRUE,
  livestream_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 12. WEBRTC SIGNALING (For Voice/Video Calls)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webrtc_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_id TEXT,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'candidate', 'leave', 'join')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------------------
-- 13. AUTO-PROVISION SDA DEFAULT FELLOWSHIP ROOMS
-- -------------------------------------------------------------------------
INSERT INTO public.chat_rooms (slug, name, description, type, is_private, auto_provisioned_key)
VALUES
  ('main-church', 'Main Church Sanctuary', 'All-church fellowship, greetings, and church family announcements.', 'public', FALSE, 'main_church'),
  ('sabbath-school', 'Sabbath School Classes', 'Lesson study discussion, quarterly review, and teacher insights.', 'public', FALSE, 'sabbath_school'),
  ('prayer-room', 'Intercessory Prayer Circle', 'Lift up prayer petitions, praise reports, and pray together.', 'public', FALSE, 'prayer_room'),
  ('choir-music', 'Sanctuary Choir & Music', 'Praise team coordination, rehearsals, and special music selections.', 'group', FALSE, 'choir'),
  ('adventist-youth', 'Adventist Youth (AY)', 'Young adults, youth ministry, AY programs, and social outings.', 'public', FALSE, 'ay'),
  ('children-ministry', 'Children & Adventurers', 'Sabbath school crafts, songs, memory verses, and family resources.', 'group', FALSE, 'children'),
  ('family-ministries', 'Family Ministries & Parents', 'Christian home encouragement, parenting tips, and marital fellowship.', 'group', FALSE, 'family'),
  ('church-elders', 'Church Board & Elders', 'Pastoral care, leadership coordination, and spiritual council.', 'private', TRUE, 'elders'),
  ('deacons-deaconesses', 'Deacons & Deaconesses', 'Sanctuary preparation, communion service, and community benevolence.', 'group', FALSE, 'deacons'),
  ('bible-study', 'Personal Ministries & Bible Study', 'Discipleship studies, prophecy exploration, and evangelism preparation.', 'public', FALSE, 'bible_study'),
  ('evangelism-outreach', 'Evangelism & Outreach', 'Mission initiatives, tract distribution, and community health expos.', 'public', FALSE, 'evangelism'),
  ('bulletin-announcements', 'Church Bulletin & Announcements', 'Official church announcements and weekly service bulletins.', 'broadcast', FALSE, 'announcements')
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------------------
-- 14. ROW-LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webrtc_signals ENABLE ROW LEVEL SECURITY;

-- LIVESTREAMS RLS
DROP POLICY IF EXISTS "Public can view published/live livestreams" ON public.livestreams;
CREATE POLICY "Public can view published/live livestreams"
  ON public.livestreams FOR SELECT
  USING (is_public = TRUE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create/update livestreams" ON public.livestreams;
CREATE POLICY "Authenticated users can create/update livestreams"
  ON public.livestreams FOR ALL
  USING (auth.role() = 'authenticated');

-- CHAT ROOMS RLS
DROP POLICY IF EXISTS "Anyone can view non-private chat rooms" ON public.chat_rooms;
CREATE POLICY "Anyone can view non-private chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_private = FALSE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage chat rooms" ON public.chat_rooms;
CREATE POLICY "Authenticated users can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (auth.role() = 'authenticated');

-- CHAT MESSAGES RLS
DROP POLICY IF EXISTS "Users can view messages in public rooms" ON public.chat_messages;
CREATE POLICY "Users can view messages in public rooms"
  ON public.chat_messages FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Senders can update own messages" ON public.chat_messages;
CREATE POLICY "Senders can update own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

-- USER STATUSES RLS (Stories expire in 24 hours)
DROP POLICY IF EXISTS "Anyone can view active user statuses" ON public.user_statuses;
CREATE POLICY "Anyone can view active user statuses"
  ON public.user_statuses FOR SELECT
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "Authenticated users can create user status" ON public.user_statuses;
CREATE POLICY "Authenticated users can create user status"
  ON public.user_statuses FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- MEETINGS RLS
DROP POLICY IF EXISTS "Public can view public meetings" ON public.meetings;
CREATE POLICY "Public can view public meetings"
  ON public.meetings FOR SELECT
  USING (is_public = TRUE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage meetings" ON public.meetings;
CREATE POLICY "Authenticated users can manage meetings"
  ON public.meetings FOR ALL
  USING (auth.role() = 'authenticated');

-- WEBRTC SIGNALS RLS
DROP POLICY IF EXISTS "Anyone can exchange WebRTC signals in a room" ON public.webrtc_signals;
CREATE POLICY "Anyone can exchange WebRTC signals in a room"
  ON public.webrtc_signals FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- -------------------------------------------------------------------------
-- 15. INDEXES FOR HIGH-PERFORMANCE SEARCH & SORTING
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status_date ON public.meetings(status, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS idx_user_statuses_expires ON public.user_statuses(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_presence_heartbeat ON public.presence(last_heartbeat DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = FALSE;
