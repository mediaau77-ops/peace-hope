-- ========================================================================
-- PEACE & HOPE CHURCH PLATFORM — COMPLETE SUPABASE DATABASE MIGRATION
-- Per-Module Upload Model, RLS Policies, Indexes, and Storage Buckets
-- ========================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for content status
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'published', 'scheduled', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'Active',
    avatar_url TEXT,
    church_branch TEXT,
    phone TEXT,
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Homepage Content Table
CREATE TABLE IF NOT EXISTS public.homepage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT,
    hero_tagline TEXT,
    hero_image_url TEXT,
    welcome_video_url TEXT,
    cover_image_url TEXT,
    cta_text TEXT DEFAULT 'Join Worship',
    cta_link TEXT DEFAULT '/live',
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1 Homepage Featured Sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT,
    media_type TEXT DEFAULT 'image',
    cover_image_url TEXT,
    sort_order INT DEFAULT 0,
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Content Uploads (Per-Module Inline Upload Registry)
CREATE TABLE IF NOT EXISTS public.content_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_table TEXT NOT NULL,
    parent_id UUID NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    source TEXT DEFAULT 'device', -- 'device' | 'google-drive'
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Teachings Table
CREATE TABLE IF NOT EXISTS public.teachings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    bible_references TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    video_url TEXT,
    attachments TEXT[] DEFAULT '{}',
    inline_images TEXT[] DEFAULT '{}',
    read_time_minutes INT DEFAULT 5,
    publish_date TIMESTAMPTZ DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sermons Table
CREATE TABLE IF NOT EXISTS public.sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    date DATE NOT NULL,
    bible_reference TEXT,
    category TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    cover_image_url TEXT,
    duration TEXT,
    views INT DEFAULT 0,
    hls_ready BOOLEAN DEFAULT TRUE,
    transcript TEXT,
    status content_status DEFAULT 'published',
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Devotionals Table
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
    cover_image_url TEXT,
    inline_image_url TEXT,
    status content_status DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Prayer Requests Table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    author_email TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    location TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT,
    candle_count INT DEFAULT 0,
    amen_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    status content_status DEFAULT 'draft',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Testimonies Table
CREATE TABLE IF NOT EXISTS public.testimonies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    location TEXT,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    media_url TEXT,
    cover_image_url TEXT,
    status content_status DEFAULT 'draft',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    theme TEXT,
    date DATE,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    time TEXT,
    location TEXT NOT NULL,
    speaker TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    banner_url TEXT,
    cover_image_url TEXT,
    flyer_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    capacity INT,
    registered_count INT DEFAULT 0,
    is_recurring_weekly BOOLEAN DEFAULT FALSE,
    registration_required BOOLEAN DEFAULT FALSE,
    category TEXT NOT NULL,
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    cover_image_url TEXT,
    publish_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'Normal',
    target_audience TEXT DEFAULT 'All Members',
    channels TEXT[] DEFAULT '{"Website"}',
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Livestreams Table
CREATE TABLE IF NOT EXISTS public.livestreams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    speaker TEXT,
    scripture TEXT,
    category TEXT,
    embed_url TEXT,
    cover_image_url TEXT,
    stream_source TEXT DEFAULT 'camera',
    is_live BOOLEAN DEFAULT FALSE,
    viewers_count INT DEFAULT 0,
    started_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Holy Bible Tables
CREATE TABLE IF NOT EXISTS public.bible_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    translation_id UUID REFERENCES public.bible_translations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    testament TEXT NOT NULL, -- 'Old' | 'New'
    book_order INT NOT NULL,
    total_chapters INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    total_verses INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bible_verses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES public.bible_chapters(id) ON DELETE CASCADE,
    verse_number INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Chat Management Tables
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'public' | 'group' | 'ministry' | 'private' | 'broadcast'
    cover_image_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    slow_mode_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin' | 'moderator' | 'member'
    is_muted BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    content TEXT,
    encrypted_payload TEXT, -- For Web Crypto E2EE in private 1:1
    message_type TEXT DEFAULT 'text', -- 'text' | 'image' | 'video' | 'audio' | 'document'
    attachment_url TEXT,
    reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'reviewed' | 'dismissed'
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Meetings Management Tables
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    host_name TEXT NOT NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 60,
    type TEXT NOT NULL, -- 'private call' | 'group meeting' | 'Bible study' | 'church conference' | 'pastoral counseling'
    cover_image_url TEXT,
    status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'live' | 'ended' | 'cancelled'
    room_id TEXT NOT NULL UNIQUE,
    passcode TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    waiting_room_enabled BOOLEAN DEFAULT TRUE,
    invited_groups TEXT[] DEFAULT '{}',
    invited_users TEXT[] DEFAULT '{}',
    live_participant_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meeting_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    recording_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    published_to_sermons BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_name TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. System Settings & Google Drive Tokens
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.google_drive_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    email TEXT,
    connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_drive_tokens ENABLE ROW LEVEL SECURITY;

-- Admins full access policy helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin', 'moderator', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Universal Admin Policy macro across tables
DO $$
DECLARE
    tbl TEXT;
    tbls TEXT[] := ARRAY[
        'profiles', 'homepage', 'homepage_sections', 'content_uploads',
        'teachings', 'sermons', 'devotionals', 'prayer_requests',
        'testimonies', 'events', 'announcements', 'livestreams',
        'chat_rooms', 'chat_room_members', 'chat_messages', 'chat_reports',
        'meetings', 'meeting_recordings', 'audit_log', 'settings', 'google_drive_tokens'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        EXECUTE format('DROP POLICY IF EXISTS admin_all ON public.%I', tbl);
        EXECUTE format('CREATE POLICY admin_all ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', tbl);
    END LOOP;
END $$;

-- Public read policies for published content
CREATE POLICY public_read_homepage ON public.homepage FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_sections ON public.homepage_sections FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_teachings ON public.teachings FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_sermons ON public.sermons FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_devotionals ON public.devotionals FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_events ON public.events FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY public_read_announcements ON public.announcements FOR SELECT TO anon, authenticated USING (status = 'published');

-- ========================================================================
-- STORAGE BUCKETS CONFIGURATION (Per-Module Storage Architecture)
-- ========================================================================
-- Insert buckets into storage.buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('homepage-media', 'homepage-media', true),
    ('teaching-media', 'teaching-media', true),
    ('sermon-media', 'sermon-media', true),
    ('devotional-media', 'devotional-media', true),
    ('prayer-media', 'prayer-media', true),
    ('testimony-media', 'testimony-media', true),
    ('event-media', 'event-media', true),
    ('announcement-media', 'announcement-media', true),
    ('livestream-media', 'livestream-media', true),
    ('chat-attachments', 'chat-attachments', false),
    ('meeting-recordings', 'meeting-recordings', true),
    ('meeting-media', 'meeting-media', true),
    ('profile-images', 'profile-images', true),
    ('branding-media', 'branding-media', true),
    ('audio-bible', 'audio-bible', true),
    ('google-drive-imports', 'google-drive-imports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Admin full management on all buckets
CREATE POLICY "Admins full storage control" ON storage.objects
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Storage RLS: Public read on public buckets
CREATE POLICY "Public read on media buckets" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id IN (
    'homepage-media', 'teaching-media', 'sermon-media', 'devotional-media',
    'prayer-media', 'testimony-media', 'event-media', 'announcement-media',
    'livestream-media', 'meeting-recordings', 'meeting-media', 'profile-images',
    'branding-media', 'audio-bible', 'google-drive-imports'
));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_uploads_parent ON public.content_uploads (parent_table, parent_id);
CREATE INDEX IF NOT EXISTS idx_teachings_status ON public.teachings (status, publish_date);
CREATE INDEX IF NOT EXISTS idx_sermons_status ON public.sermons (status, date);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (status, date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log (created_at DESC);
