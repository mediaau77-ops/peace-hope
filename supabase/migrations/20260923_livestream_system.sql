-- ==============================================================================
-- Migration: Live Worship Streaming Architecture
-- Seventh-day Adventist Digital Ministry: Peace & Hope
-- ==============================================================================

-- 1. Livestreams Table
CREATE TABLE IF NOT EXISTS public.livestreams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  cover_image_url text,
  scheduled_start_at timestamptz,
  actual_start_at timestamptz,
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'archived')),
  stream_provider text NOT NULL DEFAULT 'mux' CHECK (stream_provider IN ('livekit', 'mux', 'cloudflare', 'ivs', 'rtmp')),
  stream_key text NOT NULL DEFAULT ('live_ph_' || encode(gen_random_bytes(12), 'hex')),
  playback_url text,
  ingest_url text,
  host_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name text,
  speakers jsonb DEFAULT '[]'::jsonb,
  chat_enabled boolean NOT NULL DEFAULT true,
  reactions_enabled boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  language_default text NOT NULL DEFAULT 'en',
  translations jsonb DEFAULT '{}'::jsonb,
  viewer_count integer NOT NULL DEFAULT 0,
  peak_viewers integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_livestreams_status ON public.livestreams(status);
CREATE INDEX IF NOT EXISTS idx_livestreams_scheduled ON public.livestreams(scheduled_start_at);

-- 2. Livestream Chat Table
CREATE TABLE IF NOT EXISTS public.livestream_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name text,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'verse', 'image')),
  content text NOT NULL,
  media_url text,
  reply_to uuid REFERENCES public.livestream_chat(id) ON DELETE SET NULL,
  mentions text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  deleted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  pinned boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'flagged'))
);

CREATE INDEX IF NOT EXISTS idx_livestream_chat_stream ON public.livestream_chat(livestream_id, created_at);

-- 3. Livestream Reactions Table
CREATE TABLE IF NOT EXISTS public.livestream_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_livestream_reactions_stream ON public.livestream_reactions(livestream_id);

-- 4. Livestream Viewers & Presence Logging
CREATE TABLE IF NOT EXISTS public.livestream_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  user_agent text,
  country text
);

CREATE INDEX IF NOT EXISTS idx_livestream_viewers_stream ON public.livestream_viewers(livestream_id);

-- 5. Livestream Reminders Table
CREATE TABLE IF NOT EXISTS public.livestream_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  send_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_livestream_reminders_unique ON public.livestream_reminders(livestream_id, email);

-- 6. Livestream Overlays (Bible verses, Announcements, Lower-thirds pushed by admin)
CREATE TABLE IF NOT EXISTS public.livestream_overlays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bible_verse', 'announcement', 'lower_third')),
  content jsonb NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 15,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_livestream_overlays_active ON public.livestream_overlays(livestream_id, active);

-- 7. Livestream Recordings Table
CREATE TABLE IF NOT EXISTS public.livestream_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  audio_url text,
  thumbnail_url text,
  duration integer,
  transcript_url text,
  published_as_sermon_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Livestream Moderation Log
CREATE TABLE IF NOT EXISTS public.livestream_moderation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  livestream_id uuid NOT NULL REFERENCES public.livestreams(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('delete_message', 'mute_user', 'ban_user', 'slow_mode', 'disable_chat')),
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_message_id uuid REFERENCES public.livestream_chat(id) ON DELETE SET NULL,
  performed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Storage Buckets Creation (if not present)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('livestream-covers', 'livestream-covers', true),
  ('livestream-recordings', 'livestream-recordings', true),
  ('livestream-chat-attachments', 'livestream-chat-attachments', true),
  ('livestream-thumbnails', 'livestream-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Rate Limiting Function for Chat Messages (Anti-Spam & Scalability)
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit(p_user_id uuid, p_stream_id uuid, p_seconds integer DEFAULT 2)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN true;
  END IF;

  SELECT count(*)
  INTO v_count
  FROM public.livestream_chat
  WHERE user_id = p_user_id
    AND livestream_id = p_stream_id
    AND created_at >= now() - (p_seconds || ' seconds')::interval;

  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Row-Level Security (RLS) Policies
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestream_moderation ENABLE ROW LEVEL SECURITY;

-- LIVESTREAMS RLS
-- Public read: status in ('scheduled', 'live', 'ended', 'archived') and is_public = true
DROP POLICY IF EXISTS "Public can view active or past streams" ON public.livestreams;
CREATE POLICY "Public can view active or past streams"
  ON public.livestreams FOR SELECT
  USING (
    (status IN ('scheduled', 'live', 'ended', 'archived') AND is_public = true)
    OR public.is_admin_user()
  );

-- Admin full access
DROP POLICY IF EXISTS "Admins full manage livestreams" ON public.livestreams;
CREATE POLICY "Admins full manage livestreams"
  ON public.livestreams FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- CHAT RLS: Strictly require authentication (Google sign-in)
DROP POLICY IF EXISTS "Public can read visible chat" ON public.livestream_chat;
CREATE POLICY "Public can read visible chat"
  ON public.livestream_chat FOR SELECT
  USING (status = 'visible' OR public.is_admin_user());

DROP POLICY IF EXISTS "Anyone can insert chat message" ON public.livestream_chat;
DROP POLICY IF EXISTS "Authenticated users insert own chat message" ON public.livestream_chat;
CREATE POLICY "Authenticated users insert own chat message"
  ON public.livestream_chat FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Admins can update or delete chat" ON public.livestream_chat;
CREATE POLICY "Admins can update or delete chat"
  ON public.livestream_chat FOR UPDATE
  USING (public.is_admin_user() OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

-- REACTIONS RLS
DROP POLICY IF EXISTS "Public can read reactions" ON public.livestream_reactions;
CREATE POLICY "Public can read reactions"
  ON public.livestream_reactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert reaction" ON public.livestream_reactions;
CREATE POLICY "Anyone can insert reaction"
  ON public.livestream_reactions FOR INSERT
  WITH CHECK (true);

-- OVERLAYS RLS
DROP POLICY IF EXISTS "Public view active overlays" ON public.livestream_overlays;
CREATE POLICY "Public view active overlays"
  ON public.livestream_overlays FOR SELECT
  USING (active = true OR public.is_admin_user());

DROP POLICY IF EXISTS "Admins manage overlays" ON public.livestream_overlays;
CREATE POLICY "Admins manage overlays"
  ON public.livestream_overlays FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- REMINDERS RLS
DROP POLICY IF EXISTS "Anyone can subscribe to reminders" ON public.livestream_reminders;
CREATE POLICY "Anyone can subscribe to reminders"
  ON public.livestream_reminders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view reminders" ON public.livestream_reminders;
CREATE POLICY "Admins can view reminders"
  ON public.livestream_reminders FOR SELECT
  USING (public.is_admin_user() OR auth.uid() = user_id);
