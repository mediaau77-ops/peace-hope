/**
 * Global Search Engine
 * Searches across: Messages, People, Groups/Rooms, Sermons, Bible Verses, Meetings, Events
 * Peace & Hope SDA Platform
 */

import { getSupabaseClient, SUPABASE_TABLES } from './supabase';

export interface GlobalSearchItem {
  id: string;
  category: 'message' | 'person' | 'room' | 'sermon' | 'bible' | 'meeting' | 'event';
  title: string;
  snippet?: string;
  badge?: string;
  linkHref: string;
  metadata?: Record<string, any>;
}

export async function executeGlobalSearch(queryText: string): Promise<GlobalSearchItem[]> {
  const query = queryText.trim().toLowerCase();
  if (!query) return [];

  const supabase = getSupabaseClient();
  const results: GlobalSearchItem[] = [];

  if (!supabase) return results;

  try {
    // 1. Search Chat Messages
    try {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, room_id, content, user_name, created_at')
        .ilike('content', `%${query}%`)
        .limit(5);

      if (messages) {
        for (const m of messages) {
          results.push({
            id: m.id,
            category: 'message',
            title: `Message from ${m.user_name || 'Member'}`,
            snippet: m.content,
            badge: 'Chat',
            linkHref: `chat/${m.room_id}`,
          });
        }
      }
    } catch {
      // non-blocking
    }

    // 2. Search Chat Rooms & Circles
    try {
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id, name, description, type')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(4);

      if (rooms) {
        for (const r of rooms) {
          results.push({
            id: r.id,
            category: 'room',
            title: r.name,
            snippet: r.description || 'Community Fellowship Circle',
            badge: 'Circle',
            linkHref: `chat/${r.id}`,
          });
        }
      }
    } catch {
      // non-blocking
    }

    // 3. Search Sermons
    try {
      const { data: sermons } = await supabase
        .from(SUPABASE_TABLES.SERMONS)
        .select('id, title, speaker, date, bible_reference')
        .or(`title.ilike.%${query}%,speaker.ilike.%${query}%`)
        .limit(4);

      if (sermons) {
        for (const s of sermons) {
          results.push({
            id: s.id,
            category: 'sermon',
            title: s.title,
            snippet: `${s.speaker || 'Pastor'} • ${s.bible_reference || ''}`,
            badge: 'Sermon',
            linkHref: `sermons/${s.id}`,
          });
        }
      }
    } catch {
      // non-blocking
    }

    // 4. Search Meetings / Virtual Fellowship
    try {
      const { data: meetings } = await supabase
        .from('meetings')
        .select('id, title, description, date, type')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(4);

      if (meetings) {
        for (const m of meetings) {
          results.push({
            id: m.id,
            category: 'meeting',
            title: m.title,
            snippet: m.description || `Virtual Fellowship • ${m.type}`,
            badge: 'Meeting',
            linkHref: `meet/${m.id}`,
          });
        }
      }
    } catch {
      // non-blocking
    }

    // 5. Search Bible Verses
    try {
      const { data: verses } = await supabase
        .from(SUPABASE_TABLES.BIBLE_VERSES)
        .select('id, book_name, chapter_number, verse_number, verse_text')
        .or(`verse_text.ilike.%${query}%,book_name.ilike.%${query}%`)
        .limit(4);

      if (verses) {
        for (const v of verses) {
          results.push({
            id: v.id,
            category: 'bible',
            title: `${v.book_name} ${v.chapter_number}:${v.verse_number}`,
            snippet: v.verse_text,
            badge: 'Scripture',
            linkHref: `bible/${encodeURIComponent(v.book_name)}/${v.chapter_number}`,
          });
        }
      }
    } catch {
      // non-blocking
    }

    // 6. Search Church Events
    try {
      const { data: events } = await supabase
        .from(SUPABASE_TABLES.EVENTS)
        .select('id, title, location, date, time')
        .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(4);

      if (events) {
        for (const e of events) {
          results.push({
            id: e.id,
            category: 'event',
            title: e.title,
            snippet: `${e.date || ''} • ${e.location || 'Peace & Hope'}`,
            badge: 'Event',
            linkHref: `events/${e.id}`,
          });
        }
      }
    } catch {
      // non-blocking
    }
  } catch (err) {
    console.debug('Global search exception:', err);
  }

  return results;
}
