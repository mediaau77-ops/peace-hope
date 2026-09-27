/**
 * TypeScript Interfaces for Public Peace & Hope Web Portal
 * Direct typed schemas for Supabase read-only operations
 */

export interface PublicHomepage {
  id?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  welcome_video_url?: string;
  welcome_message?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicHomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: string;
  type?: 'text' | 'media_grid' | 'testimonial' | 'callout' | 'events_preview' | string;
  media_url?: string;
  cover_image_url?: string;
  link_url?: string;
  sort_order: number;
  status: 'published' | 'draft' | 'archived';
  created_at?: string;
}

export interface PublicSermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  bibleReference?: string;
  bible_reference?: string;
  category?: string;
  videoUrl?: string;
  video_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  cover_image_url?: string;
  duration?: string;
  transcript?: string;
  status: string;
  created_at?: string;
}

export interface PublicDevotional {
  id: string;
  title: string;
  date?: string;
  publish_date?: string;
  verseReference?: string;
  verse_reference?: string;
  verseText?: string;
  verse_text?: string;
  meditation: string;
  prayer?: string;
  author?: string;
  imageUrl?: string;
  cover_image_url?: string;
  status: string;
  created_at?: string;
}

export interface PublicEvent {
  id: string;
  title: string;
  theme?: string;
  date?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  time: string;
  location: string;
  speaker?: string;
  bannerUrl?: string;
  banner_url?: string;
  imageUrl?: string;
  cover_image_url?: string;
  description?: string;
  status: string;
  registrationRequired?: boolean;
  registration_required?: boolean;
  registeredCount?: number;
  capacity?: number;
  created_at?: string;
}

export interface PublicBibleVerse {
  id: string;
  verse_text: string;
  verse_number: number;
  chapter_number: number;
  book_name: string;
  translation_name: string;
  reference: string;
}

export interface PublicPrayerRequest {
  id: string;
  authorName?: string;
  author_name?: string;
  location?: string;
  requestText?: string;
  request_text?: string;
  title?: string;
  isAnonymous?: boolean;
  is_anonymous?: boolean;
  isPublic?: boolean;
  is_public?: boolean;
  candleCount?: number;
  candle_count?: number;
  amenCount?: number;
  amen_count?: number;
  cover_image_url?: string;
  mediaUrl?: string;
  status: string;
  created_at?: string;
  submittedAt?: string;
}

export interface PublicTestimony {
  id: string;
  authorName?: string;
  author_name?: string;
  location?: string;
  title: string;
  story?: string;
  testimony_text?: string;
  cover_image_url?: string;
  mediaUrl?: string;
  status: string;
  created_at?: string;
  submittedAt?: string;
}

export interface PublicLivestream {
  id: string;
  title: string;
  status: 'live' | 'ended' | 'scheduled' | string;
  isLive?: boolean;
  stream_url?: string;
  streamServerUrl?: string;
  viewersCount?: number;
  viewers_count?: number;
  startedAt?: string;
  started_at?: string;
  hls_url?: string;
}

export interface PublicMeeting {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  join_url?: string;
  cover_image_url?: string;
  status: string;
  is_public?: boolean;
  room_id?: string;
  scheduled_at?: string;
  host_name?: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  body?: string;
  slug?: string;
  priority: 'Normal' | 'High' | 'Urgent' | string;
  category?: string;
  link_url?: string;
  link_text?: string;
  cover_image_url?: string;
  expiry_date?: string;
  published_at?: string;
  status: string;
  created_at?: string;
}

export interface PublicTeaching {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  content?: string;
  author?: string;
  author_name?: string;
  category?: string;
  tags?: string[];
  cover_image_url?: string;
  thumbnail_url?: string;
  bible_references?: string[];
  attachments?: Array<{ name: string; url: string; size?: string }>;
  video_url?: string;
  audio_url?: string;
  read_time?: string;
  status: string;
  published_at?: string;
  created_at?: string;
}

export interface PublicComment {
  id: string;
  item_id: string;
  item_type: 'teaching' | 'sermon' | 'devotional' | 'event' | 'testimony' | 'announcement';
  author_name: string;
  author_avatar?: string;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
}

export interface PublicReaction {
  amen: number;
  heart: number;
  pray: number;
}

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'VOICE_NOTE'
  | 'DOCUMENT'
  | 'LOCATION'
  | 'CONTACT'
  | 'BIBLE_VERSE'
  | 'POLL'
  | 'SYSTEM'
  | 'MEETING_INVITE'
  | 'LIVE_WORSHIP_INVITE';

export interface PublicChatRoom {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  type: 'public' | 'group' | 'private' | 'broadcast' | 'department' | 'direct';
  is_private?: boolean;
  is_pinned?: boolean;
  auto_provisioned_key?: string;
  member_count?: number;
  last_activity_at?: string;
  created_at?: string;
}

export interface PublicChatMessage {
  id: string;
  room_id: string;
  user_id?: string;
  sender_id?: string;
  user_name: string;
  user_avatar?: string;
  message: string;
  content?: string;
  message_type?: MessageType;
  media_url?: string;
  media_meta?: Record<string, any>;
  reply_to?: string;
  reply_preview?: {
    user_name: string;
    message: string;
  };
  bible_reference?: string;
  poll_data?: {
    question: string;
    options: Array<{ id: string; text: string; votes: number; voters?: string[] }>;
  };
  pinned?: boolean;
  starred?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: Array<{ name: string; url: string; type: string }>;
  reactions?: Record<string, number>;
  user_reaction?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  voice_duration?: number;
}

export interface UserStatusStory {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  type: 'text' | 'image' | 'verse' | 'event';
  content: string;
  media_url?: string;
  verse_reference?: string;
  expires_at: string;
  created_at: string;
}

export interface PublicLeaderProfile {
  id: string;
  name: string;
  title?: string;
  role?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  is_leader?: boolean;
}

export type PublicLeader = PublicLeaderProfile;

export interface PublicBelief {
  id: string;
  number?: number;
  title: string;
  description: string;
  bible_references?: string[];
  scripture_references?: string[];
  category?: string;
}

export interface GlobalSearchResult {
  id: string;
  type: string;
  title: string;
  snippet?: string;
  slug?: string;
  linkHref?: string;
}

export interface PublicFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
}

export interface PublicNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'prayer' | 'event' | 'sermon' | 'livestream';
  read: boolean;
  link_url?: string;
  created_at: string;
}

export interface PublicBibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  order_index: number;
  chapters_count: number;
}

export interface PublicBibleTranslation {
  id: string;
  name: string;
  language: string;
  code: string;
}

export interface PublicSettings {
  churchName: string;
  siteName?: string;
  logoUrl?: string;
  tagline?: string;
  missionStatement?: string;
  primaryColor?: string;
  accentColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  country?: string;
  verse_of_the_day_id?: string;
  verse_reference?: string;
  socialLinks?: {
    youtube?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}
