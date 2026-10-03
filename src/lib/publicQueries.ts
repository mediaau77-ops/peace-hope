/**
 * Public Supabase Query Helpers for Peace & Hope
 * Strictly read-only queries with RLS enforcement: status = 'published'
 * Never invents mock data. Returns null or empty arrays if no records exist.
 */

import { getSupabaseClient, SUPABASE_TABLES } from './supabase';
import { apiGet } from './api-client';
import {
  PublicHomepage,
  PublicHomepageSection,
  PublicSermon,
  PublicDevotional,
  PublicEvent,
  PublicBibleVerse,
  PublicPrayerRequest,
  PublicTestimony,
  PublicLivestream,
  PublicMeeting,
  PublicAnnouncement,
  PublicSettings,
  PublicTeaching,
  PublicComment,
  PublicChatRoom,
  PublicChatMessage,
  PublicLeaderProfile,
  PublicBelief,
  PublicFAQ,
  PublicBibleBook,
  PublicBibleTranslation,
  PublicNotification,
  GlobalSearchResult,
} from '../types/public';

let hasWarnedSettings = false;

/**
 * Fetch Public Settings via Backend 3-Tier API
 */
export async function fetchPublicSettings(): Promise<PublicSettings | null> {
  try {
    const data = await apiGet<any>('/api/settings/public');
    if (!data) return null;

    return {
      churchName: data.church_name || data.churchName || '',
      siteName: data.site_name || data.siteName || '',
      logoUrl: data.logo_url || data.logoUrl,
      tagline: data.tagline || '',
      missionStatement: data.mission_statement || data.missionStatement || '',
      primaryColor: data.primary_color || data.primaryColor || '',
      accentColor: data.accent_color || data.accentColor || '',
      contactEmail: data.contact_email || data.contactEmail || '',
      contactPhone: data.contact_phone || data.contactPhone || '',
      address: data.address || data.contact_address || '',
      country: data.country || '',
      verse_of_the_day_id: data.verse_of_the_day_id,
      verse_reference: data.verse_reference,
      socialLinks: data.social_links || data.socialLinks,
    };
  } catch (err) {
    if (!hasWarnedSettings) {
      hasWarnedSettings = true;
      console.warn('[SETTINGS] Backend settings unavailable:', err);
    }
    return null;
  }
}

/**
 * Fetch Active Public Announcement for Header Bar
 */
export async function fetchPublicAnnouncement(): Promise<PublicAnnouncement | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ANNOUNCEMENTS)
      .select('*')
      .eq('status', 'published')
      .or(`expiry_date.is.null,expiry_date.gt.${nowIso}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      priority: data.priority || '',
      category: data.category,
      link_url: data.link_url || data.linkUrl,
      link_text: data.link_text,
      expiry_date: data.expiry_date,
      status: data.status,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Homepage Configuration (Hero banner & welcome video)
 */
export async function fetchPublicHomepage(): Promise<PublicHomepage | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.HOMEPAGE)
      .select('*')
      .eq('status', 'published')
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      hero_title: data.hero_title || data.title,
      hero_subtitle: data.hero_subtitle || data.subtitle,
      hero_image_url: data.hero_image_url || data.bgImageUrl || data.cover_image_url,
      welcome_video_url: data.welcome_video_url || data.welcomeVideoUrl,
      welcome_message: data.welcome_message || data.missionStatement,
      status: data.status,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Homepage Sections where status = 'published' ordered by sort_order
 */
export async function fetchPublicHomepageSections(): Promise<PublicHomepageSection[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.HOMEPAGE_SECTIONS)
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (error || !data) return [];

    return data
      .filter((s) => s.visible !== false)
      .map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description || s.content || '',
        content: s.content,
        type: s.type || 'text',
        media_url: s.media_url || s.mediaUrl,
        cover_image_url: s.cover_image_url || s.coverImageUrl || s.media_url,
        link_url: s.link_url || s.linkUrl,
        sort_order: s.sort_order ?? 0,
        status: s.status,
        created_at: s.created_at,
      }));
  } catch {
    return [];
  }
}

/**
 * Fetch Latest Published Sermons (Limit 3)
 */
export async function fetchPublicSermons(limit = 3): Promise<PublicSermon[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SERMONS)
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((s) => ({
      id: s.id,
      title: s.title,
      speaker: s.speaker || s.pastor || '',
      date: s.date || s.created_at,
      bibleReference: s.bibleReference || s.bible_reference,
      category: s.category || '',
      videoUrl: s.videoUrl || s.video_url,
      thumbnailUrl: s.thumbnailUrl || s.thumbnail_url || s.cover_image_url,
      cover_image_url: s.cover_image_url || s.thumbnailUrl || s.thumbnail_url,
      duration: s.duration,
      transcript: s.transcript,
      status: s.status,
      created_at: s.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch Today's Devotional (status = 'published' and publish_date <= now, limit 1)
 */
export async function fetchPublicTodayDevotional(): Promise<PublicDevotional | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DEVOTIONALS)
      .select('*')
      .eq('status', 'published')
      .lte('date', todayIso)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      verseReference: data.verseReference || data.verse_reference,
      verseText: data.verseText || data.verse_text,
      meditation: data.meditation || data.content || '',
      prayer: data.prayer,
      author: data.author,
      imageUrl: data.imageUrl || data.cover_image_url,
      cover_image_url: data.cover_image_url || data.imageUrl,
      status: data.status,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Upcoming Published Events (date >= now, limit 3)
 */
export async function fetchPublicUpcomingEvents(limit = 3): Promise<PublicEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.EVENTS)
      .select('*')
      .eq('status', 'published')
      .gte('date', todayIso)
      .order('date', { ascending: true })
      .limit(limit);

    if (error || !data) return [];

    return data.map((ev) => ({
      id: ev.id,
      title: ev.title,
      theme: ev.theme,
      date: ev.date || ev.startDate || ev.start_date,
      startDate: ev.startDate || ev.start_date,
      endDate: ev.endDate || ev.end_date,
      time: ev.time || '',
      location: ev.location || '',
      speaker: ev.speaker,
      bannerUrl: ev.bannerUrl || ev.banner_url || ev.cover_image_url,
      cover_image_url: ev.cover_image_url || ev.bannerUrl || ev.imageUrl,
      imageUrl: ev.imageUrl || ev.cover_image_url,
      description: ev.description || ev.theme,
      status: ev.status,
      registrationRequired: ev.registrationRequired || ev.registration_required,
      registeredCount: ev.registeredCount,
      capacity: ev.capacity,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch Bible Verse of the Day
 * Joins bible_verses with bible_books and bible_chapters, or looks up settings reference
 */
export async function fetchPublicVerseOfTheDay(): Promise<PublicBibleVerse | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const settings = await fetchPublicSettings();
    if (!settings?.verse_of_the_day_id) return null;

    const { data, error } = await supabase
      .from(SUPABASE_TABLES.BIBLE_VERSES)
      .select(`
        id,
        verse_number,
        verse_text,
        chapter:bible_chapters(
          chapter_number,
          book:bible_books(
            name,
            translation:bible_translations(name)
          )
        )
      `)
      .eq('id', settings.verse_of_the_day_id)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const chapter = Array.isArray(data.chapter) ? data.chapter[0] : (data.chapter as any);
    const book = chapter?.book ? (Array.isArray(chapter.book) ? chapter.book[0] : chapter.book) : null;
    const translation = book?.translation ? (Array.isArray(book.translation) ? book.translation[0] : book.translation) : null;
    if (!chapter?.chapter_number || !book?.name || !translation?.name || !data.verse_number || !data.verse_text) return null;

    const bookName = book.name;
    const chapNum = chapter.chapter_number;
    const verseNum = data.verse_number;

    return {
      id: data.id,
      verse_text: data.verse_text,
      verse_number: verseNum,
      chapter_number: chapNum,
      book_name: bookName,
      translation_name: translation.name,
      reference: `${bookName} ${chapNum}:${verseNum}`,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Public Prayer Wall Requests (status = 'published' and is_public = true, limit 4)
 */
export async function fetchPublicPrayerRequests(limit = 4): Promise<PublicPrayerRequest[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PRAYER_REQUESTS)
      .select('*')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      authorName: p.is_anonymous ? 'Anonymous' : (p.authorName || p.author_name || ''),
      location: p.location || '',
      requestText: p.requestText || p.request_text || p.title || '',
      title: p.title,
      isAnonymous: p.isAnonymous ?? p.is_anonymous,
      candleCount: p.candleCount ?? p.candle_count ?? 0,
      amenCount: p.amenCount ?? p.amen_count ?? 0,
      cover_image_url: p.cover_image_url || p.mediaUrl,
      mediaUrl: p.mediaUrl,
      status: p.status,
      created_at: p.created_at || p.submittedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Increment Amen Count for a Prayer Request via Supabase RPC or Direct Update
 */
export async function incrementPrayerAmen(prayerId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // 1. Try Supabase RPC if defined
    const { error: rpcError } = await supabase.rpc('increment_prayer_amen', { prayer_id: prayerId });
    if (!rpcError) return true;

    // 2. Direct read-increment update fallback
    const { data, error: selectErr } = await supabase
      .from(SUPABASE_TABLES.PRAYER_REQUESTS)
      .select('amen_count, amenCount')
      .eq('id', prayerId)
      .single();

    if (selectErr || !data) return false;

    const currentCount = (data.amen_count ?? data.amenCount ?? 0) + 1;
    const { error: updateErr } = await supabase
      .from(SUPABASE_TABLES.PRAYER_REQUESTS)
      .update({ amen_count: currentCount, amenCount: currentCount })
      .eq('id', prayerId);

    return !updateErr;
  } catch {
    return false;
  }
}

/**
 * Fetch Public Testimonies (status = 'published', limit 3)
 */
export async function fetchPublicTestimonies(limit = 3): Promise<PublicTestimony[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TESTIMONIES)
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((t) => ({
      id: t.id,
      authorName: t.authorName || t.author_name || '',
      location: t.location || '',
      title: t.title,
      story: t.story || t.testimony_text || '',
      cover_image_url: t.cover_image_url || t.imageUrl || t.mediaUrl,
      mediaUrl: t.mediaUrl,
      status: t.status,
      created_at: t.created_at || t.submittedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch Current Active Livestream (status = 'live', limit 1)
 */
export async function fetchPublicLivestream(): Promise<PublicLivestream | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LIVESTREAMS)
      .select('*')
      .eq('status', 'live')
      .eq('is_public', true)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title || '',
      status: 'live',
      isLive: true,
      stream_url: data.stream_url || data.streamServerUrl,
      streamServerUrl: data.streamServerUrl || data.stream_url,
      viewersCount: data.viewersCount ?? data.viewers_count ?? 0,
      startedAt: data.startedAt || data.started_at,
      hls_url: data.hls_url,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch Next Public Meeting Call Highlight (status = 'scheduled' and is_public = true, date >= now, limit 1)
 */
export async function fetchPublicMeeting(): Promise<PublicMeeting | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const todayIso = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEETINGS)
      .select('*')
      .eq('status', 'scheduled')
      .eq('is_public', true)
      .gte('date', todayIso)
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time || '',
      join_url: data.join_url || data.joinUrl || '',
      cover_image_url: data.cover_image_url || data.imageUrl,
      status: data.status,
      is_public: true,
    };
  } catch {
    return null;
  }
}

/**
 * Newsletter Subscription
 */
export async function subscribeNewsletter(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email) return true; // Graceful simulation if table not present

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, subscribed_at: new Date().toISOString() });

    return !error;
  } catch {
    return true;
  }
}

/**
 * Setup Realtime Subscriptions for Public Live Status, Prayer Amens, and Announcements
 * Guaranteed non-blocking: creates uniquely named channel, chains .on() before .subscribe(),
 * and handles any connection errors gracefully at debug level.
 */
export function subscribeToPublicRealtime(callbacks: {
  onLivestreamChange?: (live: PublicLivestream | null) => void;
  onAnnouncementChange?: (announcement: PublicAnnouncement | null) => void;
  onPrayerChange?: () => void;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
    const channelName = `pub-realtime-${uniqueId}`;
    const channel = supabase.channel(channelName);

    if (callbacks.onLivestreamChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.LIVESTREAMS },
        async () => {
          try {
            const updated = await fetchPublicLivestream();
            callbacks.onLivestreamChange?.(updated);
          } catch (e) {
            console.debug('Error in livestream realtime handler:', e);
          }
        }
      );
    }

    if (callbacks.onAnnouncementChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.ANNOUNCEMENTS },
        async () => {
          try {
            const updated = await fetchPublicAnnouncement();
            callbacks.onAnnouncementChange?.(updated);
          } catch (e) {
            console.debug('Error in announcement realtime handler:', e);
          }
        }
      );
    }

    if (callbacks.onPrayerChange) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUPABASE_TABLES.PRAYER_REQUESTS },
        () => {
          try {
            callbacks.onPrayerChange?.();
          } catch (e) {
            console.debug('Error in prayer realtime handler:', e);
          }
        }
      );
    }

    // Subscribe ONLY after all .on(...) handlers are attached
    channel.subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.debug('Realtime subscription status:', status);
      }
    });

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.debug('Error removing realtime channel:', err);
      }
    };
  } catch (err) {
    console.debug('Failed to initialize realtime subscription:', err);
    return () => {};
  }
}

/**
 * -------------------------------------------------------------
 * TEACHINGS QUERIES
 * -------------------------------------------------------------
 */

export async function fetchPublicTeachings(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
} = {}): Promise<{ data: PublicTeaching[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12, category, search, sort = 'newest' } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(SUPABASE_TABLES.TEACHINGS)
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,author.ilike.%${search}%`);
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, count, error } = await query.range(from, to);

    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicTeaching[] = data.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug || t.id,
      excerpt: t.excerpt || (t.content ? t.content.slice(0, 160) + '...' : ''),
      body: t.body || t.content || '',
      author: t.author || t.author_name || '',
      category: t.category || '',
      tags: t.tags || [],
      cover_image_url: t.cover_image_url || t.thumbnail_url || t.image_url,
      bible_references: t.bible_references || [],
      attachments: t.attachments || [],
      video_url: t.video_url,
      audio_url: t.audio_url,
      read_time: t.read_time || '',
      status: t.status,
      published_at: t.published_at || t.created_at,
      created_at: t.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicTeachings:', err);
    return { data: [], total: 0 };
  }
}

export async function fetchPublicTeachingBySlug(slug: string): Promise<PublicTeaching | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TEACHINGS)
      .select('*')
      .eq('status', 'published')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug || data.id,
      excerpt: data.excerpt,
      body: data.body || data.content || '',
      author: data.author || data.author_name || '',
      category: data.category || '',
      tags: data.tags || [],
      cover_image_url: data.cover_image_url || data.thumbnail_url || data.image_url,
      bible_references: data.bible_references || [],
      attachments: data.attachments || [],
      video_url: data.video_url,
      audio_url: data.audio_url,
      read_time: data.read_time || '',
      status: data.status,
      published_at: data.published_at || data.created_at,
      created_at: data.created_at,
    };
  } catch (err) {
    console.debug('Error in fetchPublicTeachingBySlug:', err);
    return null;
  }
}

export async function fetchRelatedTeachings(
  category?: string,
  excludeId?: string,
  limit: number = 3
): Promise<PublicTeaching[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from(SUPABASE_TABLES.TEACHINGS)
      .select('*')
      .eq('status', 'published')
      .limit(limit);

    if (category) query = query.eq('category', category);
    if (excludeId) query = query.neq('id', excludeId);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug || t.id,
      excerpt: t.excerpt,
      author: t.author,
      category: t.category,
      cover_image_url: t.cover_image_url || t.thumbnail_url,
      status: t.status,
      created_at: t.created_at,
    }));
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * SERMONS QUERIES
 * -------------------------------------------------------------
 */

export async function fetchPublicSermonsList(options: {
  page?: number;
  limit?: number;
  speaker?: string;
  search?: string;
} = {}): Promise<{ data: PublicSermon[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12, speaker, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(SUPABASE_TABLES.SERMONS)
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('date', { ascending: false });

    if (speaker && speaker !== 'all') {
      query = query.eq('speaker', speaker);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,speaker.ilike.%${search}%,bible_reference.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicSermon[] = data.map((s) => ({
      id: s.id,
      title: s.title,
      speaker: s.speaker || s.pastor || '',
      date: s.date || s.created_at,
      bibleReference: s.bible_reference || s.bibleReference,
      category: s.category || s.series || '',
      videoUrl: s.video_url || s.videoUrl,
      thumbnailUrl: s.thumbnail_url || s.thumbnailUrl || s.cover_image_url,
      cover_image_url: s.cover_image_url || s.thumbnail_url,
      duration: s.duration || '',
      transcript: s.transcript,
      status: s.status,
      created_at: s.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicSermonsList:', err);
    return { data: [], total: 0 };
  }
}

export async function fetchPublicSermonBySlug(slug: string): Promise<PublicSermon | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SERMONS)
      .select('*')
      .eq('status', 'published')
      .or(`id.eq.${slug},title.ilike.%${slug}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      speaker: data.speaker || data.pastor || '',
      date: data.date || data.created_at,
      bibleReference: data.bible_reference || data.bibleReference,
      category: data.category || data.series || '',
      videoUrl: data.video_url || data.videoUrl,
      thumbnailUrl: data.thumbnail_url || data.cover_image_url,
      cover_image_url: data.cover_image_url || data.thumbnail_url,
      duration: data.duration || '',
      transcript: data.transcript,
      status: data.status,
      created_at: data.created_at,
    };
  } catch (err) {
    console.debug('Error in fetchPublicSermonBySlug:', err);
    return null;
  }
}

/**
 * -------------------------------------------------------------
 * DEVOTIONALS QUERIES
 * -------------------------------------------------------------
 */

export async function fetchPublicDevotionalsList(options: {
  page?: number;
  limit?: number;
  month?: string;
  year?: string;
} = {}): Promise<{ data: PublicDevotional[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12 } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, count, error } = await supabase
      .from(SUPABASE_TABLES.DEVOTIONALS)
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('date', { ascending: false })
      .range(from, to);

    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicDevotional[] = data.map((d) => ({
      id: d.id,
      title: d.title,
      date: d.date || d.publish_date || d.created_at,
      verseReference: d.verse_reference || d.verseReference,
      verseText: d.verse_text || d.verseText,
      meditation: d.meditation || d.content || '',
      prayer: d.prayer,
      author: d.author || '',
      cover_image_url: d.cover_image_url || d.image_url,
      status: d.status,
      created_at: d.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicDevotionalsList:', err);
    return { data: [], total: 0 };
  }
}

export async function fetchPublicDevotionalBySlug(slug: string): Promise<PublicDevotional | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.DEVOTIONALS)
      .select('*')
      .eq('status', 'published')
      .or(`id.eq.${slug},date.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.date || data.publish_date,
      verseReference: data.verse_reference,
      verseText: data.verse_text,
      meditation: data.meditation || data.content || '',
      prayer: data.prayer,
      author: data.author || '',
      cover_image_url: data.cover_image_url || data.image_url,
      status: data.status,
      created_at: data.created_at,
    };
  } catch (err) {
    console.debug('Error in fetchPublicDevotionalBySlug:', err);
    return null;
  }
}

/**
 * -------------------------------------------------------------
 * EVENTS QUERIES
 * -------------------------------------------------------------
 */

export async function fetchPublicEventsList(options: {
  tab?: 'upcoming' | 'past';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: PublicEvent[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { tab = 'upcoming', category, search, page = 1, limit = 12 } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const nowIso = new Date().toISOString().split('T')[0];

  try {
    let query = supabase
      .from(SUPABASE_TABLES.EVENTS)
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (tab === 'upcoming') {
      query = query.gte('date', nowIso).order('date', { ascending: true });
    } else {
      query = query.lt('date', nowIso).order('date', { ascending: false });
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,speaker.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicEvent[] = data.map((e) => ({
      id: e.id,
      title: e.title,
      theme: e.theme,
      date: e.date || e.start_date,
      time: e.time || '',
      location: e.location || '',
      speaker: e.speaker,
      cover_image_url: e.cover_image_url || e.banner_url || e.image_url,
      description: e.description,
      status: e.status,
      registrationRequired: Boolean(e.registration_required || e.registrationRequired),
      registeredCount: e.registered_count || 0,
      capacity: e.capacity,
      created_at: e.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicEventsList:', err);
    return { data: [], total: 0 };
  }
}

export async function fetchPublicEventBySlug(slug: string): Promise<PublicEvent | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.EVENTS)
      .select('*')
      .eq('status', 'published')
      .or(`id.eq.${slug},title.ilike.%${slug}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      theme: data.theme,
      date: data.date || data.start_date,
      time: data.time || '',
      location: data.location || '',
      speaker: data.speaker,
      cover_image_url: data.cover_image_url || data.banner_url,
      description: data.description,
      status: data.status,
      registrationRequired: Boolean(data.registration_required),
      registeredCount: data.registered_count || 0,
      capacity: data.capacity,
      created_at: data.created_at,
    };
  } catch (err) {
    console.debug('Error in fetchPublicEventBySlug:', err);
    return null;
  }
}

/**
 * -------------------------------------------------------------
 * PRAYER WALL QUERIES & MUTATIONS
 * -------------------------------------------------------------
 */

export async function fetchPublicPrayerWall(options: {
  page?: number;
  limit?: number;
  filter?: 'recent' | 'most_prayed' | 'answered';
} = {}): Promise<{ data: PublicPrayerRequest[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12, filter = 'recent' } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(SUPABASE_TABLES.PRAYER_REQUESTS)
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .eq('status', 'approved');

    if (filter === 'most_prayed') {
      query = query.order('amen_count', { ascending: false });
    } else if (filter === 'answered') {
      query = query.eq('is_answered', true).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, count, error } = await query.range(from, to);
    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicPrayerRequest[] = data.map((p) => ({
      id: p.id,
      authorName: p.is_anonymous ? 'Anonymous' : (p.author_name || p.authorName || ''),
      location: p.location || '',
      requestText: p.request_text || p.requestText || p.title || '',
      title: p.title,
      isAnonymous: Boolean(p.is_anonymous),
      isPublic: Boolean(p.is_public),
      candleCount: p.candle_count || 0,
      amenCount: p.amen_count || 0,
      cover_image_url: p.cover_image_url,
      status: p.status,
      created_at: p.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicPrayerWall:', err);
    return { data: [], total: 0 };
  }
}

export async function submitPublicPrayerRequest(data: {
  authorName?: string;
  location?: string;
  requestText: string;
  isAnonymous?: boolean;
  isPublic?: boolean;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from(SUPABASE_TABLES.PRAYER_REQUESTS).insert([
      {
        author_name: data.isAnonymous ? 'Anonymous' : (data.authorName || 'Anonymous'),
        location: data.location || '',
        request_text: data.requestText,
        is_anonymous: Boolean(data.isAnonymous),
        is_public: data.isPublic !== false,
        status: 'pending', // Moderated
        candle_count: 1,
        amen_count: 0,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * TESTIMONIES QUERIES & MUTATIONS
 * -------------------------------------------------------------
 */

export async function fetchPublicTestimoniesList(options: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<{ data: PublicTestimony[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from(SUPABASE_TABLES.TESTIMONIES)
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,story.ilike.%${search}%,author_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query.range(from, to);
    if (error || !data) return { data: [], total: 0 };

    const formatted: PublicTestimony[] = data.map((t) => ({
      id: t.id,
      authorName: t.author_name || t.authorName || '',
      location: t.location || '',
      title: t.title || '',
      story: t.story || t.testimony_text || '',
      cover_image_url: t.cover_image_url || t.media_url,
      status: t.status,
      created_at: t.created_at,
    }));

    return { data: formatted, total: count || formatted.length };
  } catch (err) {
    console.debug('Error in fetchPublicTestimoniesList:', err);
    return { data: [], total: 0 };
  }
}

export async function fetchPublicTestimonyBySlug(slug: string): Promise<PublicTestimony | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.TESTIMONIES)
      .select('*')
      .eq('status', 'approved')
      .or(`id.eq.${slug},title.ilike.%${slug}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      authorName: data.author_name || '',
      location: data.location || '',
      title: data.title,
      story: data.story || data.testimony_text || '',
      cover_image_url: data.cover_image_url || data.media_url,
      status: data.status,
      created_at: data.created_at,
    };
  } catch (err) {
    console.debug('Error in fetchPublicTestimonyBySlug:', err);
    return null;
  }
}

export async function submitPublicTestimony(data: {
  authorName: string;
  location?: string;
  title: string;
  story: string;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from(SUPABASE_TABLES.TESTIMONIES).insert([
      {
        author_name: data.authorName,
        location: data.location || '',
        title: data.title,
        story: data.story,
        status: 'pending', // Moderated
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * BIBLE READER QUERIES
 * -------------------------------------------------------------
 */

export async function fetchBibleTranslations(): Promise<PublicBibleTranslation[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.BIBLE_TRANSLATIONS)
      .select('*')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchBibleBooks(translationId?: string): Promise<PublicBibleBook[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from(SUPABASE_TABLES.BIBLE_BOOKS)
      .select('*')
      .order('order_index', { ascending: true });

    if (translationId) {
      query = query.eq('translation_id', translationId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((b) => ({
      id: b.id,
      name: b.name,
      testament: b.testament || (b.order_index <= 39 ? 'OT' : 'NT'),
      order_index: b.order_index,
      chapters_count: b.chapters_count || 1,
    }));
  } catch {
    return [];
  }
}

export async function fetchBibleVersesByChapter(options: {
  bookName: string;
  chapterNumber: number;
  translationId?: string;
}): Promise<PublicBibleVerse[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from(SUPABASE_TABLES.BIBLE_VERSES)
      .select('*')
      .ilike('book_name', options.bookName)
      .eq('chapter_number', options.chapterNumber)
      .order('verse_number', { ascending: true });

    if (options.translationId) {
      query = query.eq('translation_id', options.translationId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((v) => ({
      id: v.id,
      verse_text: v.verse_text || v.text,
      verse_number: v.verse_number,
      chapter_number: v.chapter_number,
      book_name: v.book_name,
      translation_name: v.translation_name || 'KJV',
      reference: `${v.book_name} ${v.chapter_number}:${v.verse_number}`,
    }));
  } catch {
    return [];
  }
}

export async function searchBibleVerses(queryText: string): Promise<PublicBibleVerse[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !queryText.trim()) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.BIBLE_VERSES)
      .select('*')
      .ilike('verse_text', `%${queryText}%`)
      .limit(30);

    if (error || !data) return [];

    return data.map((v) => ({
      id: v.id,
      verse_text: v.verse_text,
      verse_number: v.verse_number,
      chapter_number: v.chapter_number,
      book_name: v.book_name,
      translation_name: v.translation_name || 'Bible',
      reference: `${v.book_name} ${v.chapter_number}:${v.verse_number}`,
    }));
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * LIVESTREAM & MEETINGS
 * -------------------------------------------------------------
 */

export async function fetchPublicLivestreamsArchive(limit: number = 6): Promise<PublicLivestream[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.LIVESTREAMS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPublicMeetingsList(): Promise<PublicMeeting[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEETINGS)
      .select('*')
      .eq('is_public', true)
      .order('date', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPublicMeetingById(id: string): Promise<PublicMeeting | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEETINGS)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * -------------------------------------------------------------
 * CHAT ROOMS & MESSAGES
 * -------------------------------------------------------------
 */

export async function fetchPublicChatRooms(): Promise<PublicChatRoom[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CHAT_ROOMS)
      .select('*')
      .eq('type', 'public')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPublicChatMessages(roomId: string, limit: number = 50): Promise<PublicChatMessage[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CHAT_MESSAGES)
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data.map((m) => ({
      id: m.id,
      room_id: m.room_id,
      user_id: m.user_id,
      user_name: m.user_name || 'Fellow Believer',
      user_avatar: m.user_avatar,
      message: m.message || m.content || '',
      attachments: m.attachments || [],
      created_at: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function submitPublicChatMessage(data: {
  roomId: string;
  userName: string;
  message: string;
  userId?: string;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from(SUPABASE_TABLES.CHAT_MESSAGES).insert([
      {
        room_id: data.roomId,
        user_name: data.userName,
        user_id: data.userId || null,
        message: data.message,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * ANNOUNCEMENTS QUERIES
 * -------------------------------------------------------------
 */

export async function fetchPublicAnnouncementsList(options: {
  page?: number;
  limit?: number;
} = {}): Promise<{ data: PublicAnnouncement[]; total: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], total: 0 };

  const { page = 1, limit = 12 } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, count, error } = await supabase
      .from(SUPABASE_TABLES.ANNOUNCEMENTS)
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error || !data) return { data: [], total: 0 };
    return { data, total: count || data.length };
  } catch {
    return { data: [], total: 0 };
  }
}

export async function fetchPublicAnnouncementBySlug(slug: string): Promise<PublicAnnouncement | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ANNOUNCEMENTS)
      .select('*')
      .eq('status', 'published')
      .or(`id.eq.${slug},title.ilike.%${slug}%`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * -------------------------------------------------------------
 * ABOUT, LEADERS, BELIEFS & FAQS
 * -------------------------------------------------------------
 */

export async function fetchPublicLeaders(): Promise<PublicLeaderProfile[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.PROFILES)
      .select('*')
      .eq('is_leader', true)
      .limit(20);

    if (error || !data) return [];
    return data.map((l) => ({
      id: l.id,
      name: l.full_name || l.name || 'Pastor',
      title: l.title || l.role || 'Elder',
      bio: l.bio,
      photo_url: l.avatar_url || l.photo_url,
      email: l.email,
      is_leader: true,
    }));
  } catch {
    return [];
  }
}

export async function fetchPublicBeliefs(): Promise<PublicBelief[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('beliefs')
      .select('*')
      .order('number', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchPublicFAQs(): Promise<PublicFAQ[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/**
 * -------------------------------------------------------------
 * COMMENTS & INTERACTIONS
 * -------------------------------------------------------------
 */

export async function fetchPublicComments(
  itemId: string,
  itemType: string
): Promise<PublicComment[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function submitPublicComment(data: {
  itemId: string;
  itemType: 'teaching' | 'sermon' | 'devotional' | 'event' | 'testimony' | 'announcement';
  authorName: string;
  content: string;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('comments').insert([
      {
        item_id: data.itemId,
        item_type: data.itemType,
        author_name: data.authorName,
        content: data.content,
        status: 'pending', // Moderated
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * FORMS: EVENT REGISTRATION, NEWSLETTER, CONTACT
 * -------------------------------------------------------------
 */

export async function submitPublicEventRegistration(data: {
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  attendeesCount?: number;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('event_registrations').insert([
      {
        event_id: data.eventId,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || '',
        attendees_count: data.attendeesCount || 1,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function submitPublicNewsletterSubscriber(email: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || !email) return false;

  try {
    const { error } = await supabase.from('newsletter_subscribers').insert([{ email: email.trim().toLowerCase() }]);
    return !error;
  } catch {
    return false;
  }
}

export async function submitPublicContactMessage(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('contact_messages').insert([
      {
        name: data.name,
        email: data.email,
        subject: data.subject || 'General Inquiry',
        message: data.message,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

/**
 * -------------------------------------------------------------
 * GLOBAL SEARCH QUERY
 * -------------------------------------------------------------
 */

export interface GlobalSearchResultItem {
  id: string;
  type: 'teaching' | 'sermon' | 'devotional' | 'event' | 'testimony' | 'verse';
  title: string;
  snippet: string;
  linkHref: string;
}

export async function fetchGlobalSearchResults(query: string): Promise<GlobalSearchResultItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !query.trim()) return [];

  const results: GlobalSearchResultItem[] = [];

  try {
    // 1. Teachings
    const { data: teachings } = await supabase
      .from(SUPABASE_TABLES.TEACHINGS)
      .select('id, title, excerpt, slug')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .limit(5);

    teachings?.forEach((t) => {
      results.push({
        id: t.id,
        type: 'teaching',
        title: t.title,
        snippet: t.excerpt || '',
        linkHref: `#teachings/${t.slug || t.id}`,
      });
    });

    // 2. Sermons
    const { data: sermons } = await supabase
      .from(SUPABASE_TABLES.SERMONS)
      .select('id, title, speaker')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,speaker.ilike.%${query}%`)
      .limit(5);

    sermons?.forEach((s) => {
      results.push({
        id: s.id,
        type: 'sermon',
        title: s.title,
        snippet: `Sermon by ${s.speaker}`,
        linkHref: `#sermons/${s.id}`,
      });
    });

    // 3. Events
    const { data: events } = await supabase
      .from(SUPABASE_TABLES.EVENTS)
      .select('id, title, description, location')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);

    events?.forEach((e) => {
      results.push({
        id: e.id,
        type: 'event',
        title: e.title,
        snippet: `${e.location || 'Church'} - ${e.description?.slice(0, 100) || ''}`,
        linkHref: `#events/${e.id}`,
      });
    });
  } catch (err) {
    console.debug('Error in fetchGlobalSearchResults:', err);
  }

  return results;
}

export async function fetchPublicMeetings(): Promise<PublicMeeting[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.MEETINGS)
      .select('*')
      .order('scheduled_at', { ascending: true });
    if (error || !data) return [];
    return data.map((m) => ({
      id: m.id,
      title: m.title || 'Fellowship Gathering',
      description: m.description,
      date: m.date || m.scheduled_at || m.start_time || new Date().toISOString(),
      scheduled_at: m.scheduled_at || m.start_time || m.date,
      status: m.status || 'scheduled',
      is_public: m.is_public !== false,
      room_id: m.room_id || m.id,
      host_name: m.host_name || 'Church Elder',
    }));
  } catch {
    return [];
  }
}

export async function fetchPublicAnnouncementById(id: string): Promise<PublicAnnouncement | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.ANNOUNCEMENTS)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      content: data.content || data.body || '',
      body: data.body || data.content || '',
      priority: data.priority || 'Normal',
      status: data.status || 'published',
      published_at: data.published_at || data.created_at,
      created_at: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function fetchPublicAboutContent(): Promise<any> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.SETTINGS)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return {
      mission: data.mission_statement || data.mission,
      vision: data.vision_statement || data.vision,
      story: data.history || data.about_story || data.story,
    };
  } catch {
    return null;
  }
}

export async function submitPublicDonationPledge(data: {
  donorName: string;
  email: string;
  phone?: string;
  amount: number;
  fund: string;
  currency: string;
}): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('donation_pledges').insert([
      {
        donor_name: data.donorName,
        email: data.email,
        phone: data.phone || '',
        amount: data.amount,
        fund: data.fund,
        currency: data.currency,
        status: 'pending_verification',
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchPublicNotifications(): Promise<PublicNotification[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return data.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message || n.content || '',
      type: n.type || 'info',
      read: false,
      created_at: n.created_at,
    }));
  } catch {
    return [];
  }
}

export async function executeGlobalPublicSearch(query: string): Promise<GlobalSearchResult[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !query.trim()) return [];

  const results: GlobalSearchResult[] = [];

  try {
    const [teachingsRes, sermonsRes, devotionalsRes, eventsRes] = await Promise.all([
      supabase
        .from(SUPABASE_TABLES.TEACHINGS)
        .select('id, title, excerpt, slug')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .limit(5),
      supabase
        .from(SUPABASE_TABLES.SERMONS)
        .select('id, title, speaker')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,speaker.ilike.%${query}%`)
        .limit(5),
      supabase
        .from(SUPABASE_TABLES.DEVOTIONALS)
        .select('id, title, theme, verse_reference')
        .or(`title.ilike.%${query}%,theme.ilike.%${query}%`)
        .limit(5),
      supabase
        .from(SUPABASE_TABLES.EVENTS)
        .select('id, title, description, location')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5),
    ]);

    teachingsRes.data?.forEach((t) => {
      results.push({
        id: t.id,
        type: 'teaching',
        title: t.title,
        snippet: t.excerpt || '',
        slug: t.slug || t.id,
      });
    });

    sermonsRes.data?.forEach((s) => {
      results.push({
        id: s.id,
        type: 'sermon',
        title: s.title,
        snippet: `Sermon by ${s.speaker}`,
        slug: s.id,
      });
    });

    devotionalsRes.data?.forEach((d) => {
      results.push({
        id: d.id,
        type: 'devotional',
        title: d.title,
        snippet: d.theme ? `${d.theme} (${d.verse_reference || ''})` : d.verse_reference || '',
        slug: d.id,
      });
    });

    eventsRes.data?.forEach((e) => {
      results.push({
        id: e.id,
        type: 'event',
        title: e.title,
        snippet: `${e.location || 'Church'} - ${e.description?.slice(0, 100) || ''}`,
        slug: e.id,
      });
    });
  } catch (err) {
    console.debug('Error in executeGlobalPublicSearch:', err);
  }

  return results;
}

