// ==============================================================================
// Live Worship Streaming Types & Interfaces
// Seventh-day Adventist Digital Ministry: Peace & Hope
// ==============================================================================

export type LivestreamStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'archived';
export type StreamProvider = 'livekit' | 'mux' | 'cloudflare' | 'ivs' | 'rtmp';
export type OverlayType = 'bible_verse' | 'announcement' | 'lower_third';
export type ModerationAction = 'delete_message' | 'mute_user' | 'ban_user' | 'slow_mode' | 'disable_chat';

export interface LivestreamSpeaker {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  is_active?: boolean;
}

export interface LivestreamRecord {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string | null;
  scheduled_start_at?: string | null;
  actual_start_at?: string | null;
  ended_at?: string | null;
  status: LivestreamStatus;
  stream_provider: StreamProvider;
  stream_key?: string | null;
  playback_url?: string | null;
  ingest_url?: string | null;
  host_user_id?: string | null;
  host_name?: string | null;
  speakers?: LivestreamSpeaker[] | null;
  chat_enabled: boolean;
  reactions_enabled: boolean;
  is_public: boolean;
  language_default: string;
  translations?: Record<string, { title?: string; description?: string }> | null;
  viewer_count?: number;
  peak_viewers?: number;
  created_at: string;
  updated_at?: string;
}

export interface LivestreamChatMessage {
  id: string;
  livestream_id: string;
  user_id?: string | null;
  guest_name?: string | null;
  user_avatar_url?: string | null;
  message_type: 'text' | 'emoji' | 'verse' | 'image';
  content: string;
  media_url?: string | null;
  reply_to?: string | null;
  mentions?: string[] | null;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  pinned: boolean;
  status: 'visible' | 'hidden' | 'flagged';
  is_admin?: boolean;
}

export interface LivestreamReaction {
  id: string;
  livestream_id: string;
  user_id?: string | null;
  emoji: '❤️' | '🙏' | '👍' | '🔥' | '🎉' | string;
  created_at: string;
}

export interface LivestreamOverlay {
  id: string;
  livestream_id: string;
  type: OverlayType;
  content: {
    reference?: string;
    text: string;
    version?: string;
    speakerName?: string;
    speakerTitle?: string;
    announcementHeadline?: string;
  };
  duration_seconds: number;
  created_by?: string | null;
  created_at: string;
  active: boolean;
}

export interface LivestreamRecording {
  id: string;
  livestream_id: string;
  video_url: string;
  audio_url?: string | null;
  thumbnail_url?: string | null;
  duration?: number | null;
  transcript_url?: string | null;
  published_as_sermon_id?: string | null;
  created_at: string;
}

export interface LivestreamReminder {
  id: string;
  livestream_id: string;
  user_id?: string | null;
  email: string;
  send_at: string;
  sent_at?: string | null;
}

export interface LivestreamModerationEvent {
  id: string;
  livestream_id: string;
  action: ModerationAction;
  target_user_id?: string | null;
  target_message_id?: string | null;
  performed_by: string;
  created_at: string;
}

export interface CreateStreamPayload {
  title: string;
  description: string;
  cover_image_url?: string;
  scheduled_start_at?: string;
  stream_provider: StreamProvider;
  playback_url?: string;
  ingest_url?: string;
  speakers?: LivestreamSpeaker[];
  chat_enabled: boolean;
  reactions_enabled: boolean;
  is_public: boolean;
  language_default: string;
  translations?: Record<string, { title?: string; description?: string }>;
}
