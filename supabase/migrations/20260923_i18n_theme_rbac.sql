-- ==============================================================================
-- Migration: i18n, Theme Preferences, JSONB Translations & Public RLS Hardening
-- Seventh-day Adventist Digital Ministry: Peace & Hope
-- ==============================================================================

-- 1. Profiles Table Updates: Theme & Language Preferences
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'fr', 'rw', 'sw'));

-- 2. Settings Table Updates: Supported Languages
ALTER TABLE IF EXISTS public.settings
  ADD COLUMN IF NOT EXISTS supported_languages jsonb DEFAULT '["en", "fr", "rw"]'::jsonb;

-- 3. Content Tables: Add JSONB Translations Column
-- Structure: { "en": { "title": "...", "body": "..." }, "fr": { ... }, "rw": { ... } }
ALTER TABLE IF EXISTS public.teachings
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.sermons
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.devotionals
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.announcements
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.testimonies
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.homepage
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.homepage_sections
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.about_page
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.faqs
  ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;

-- 4. Audit Log Table: Ensure Existence for Admin Login Logging
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  timestamp timestamptz DEFAULT now()
);

-- 5. Row-Level Security (RLS) Policies Hardening

-- Enable RLS on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user has an admin role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'moderator', 'editor')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'moderator', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES Policies:
-- Public user can view and edit ONLY their own profile
DROP POLICY IF EXISTS "Public users view own profile" ON public.profiles;
CREATE POLICY "Public users view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "Public users update own profile" ON public.profiles;
CREATE POLICY "Public users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "Public users insert own profile" ON public.profiles;
CREATE POLICY "Public users insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin_user());

-- PRAYER REQUESTS Policies:
-- Public users can insert prayer requests. Approved prayers are viewable by all.
DROP POLICY IF EXISTS "Anyone can insert prayer request" ON public.prayer_requests;
CREATE POLICY "Anyone can insert prayer request"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view approved prayers" ON public.prayer_requests;
CREATE POLICY "Anyone can view approved prayers"
  ON public.prayer_requests FOR SELECT
  USING (status = 'approved' OR public.is_admin_user() OR user_id = auth.uid()::text);

-- TESTIMONIES Policies:
DROP POLICY IF EXISTS "Anyone can insert testimony" ON public.testimonies;
CREATE POLICY "Anyone can insert testimony"
  ON public.testimonies FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view approved testimonies" ON public.testimonies;
CREATE POLICY "Anyone can view approved testimonies"
  ON public.testimonies FOR SELECT
  USING (status = 'approved' OR is_approved = true OR public.is_admin_user());

-- NEWSLETTER SUBSCRIBERS Policies:
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.is_admin_user());

-- AUDIT LOG Policies:
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;
CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);
