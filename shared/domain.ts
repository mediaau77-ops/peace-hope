export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicLivestream = {
  id: string;
  title: string;
  status: 'live' | 'paused' | 'ended';
  isPublic: boolean;
  startedAt?: string | null;
  viewerCount?: number;
  coverImageUrl?: string | null;
};

export type Livestream = PublicLivestream & {
  description?: string;
  provider?: string;
  ingestUrl?: string | null;
  playbackUrl?: string | null;
  chatEnabled?: boolean;
  reactionsEnabled?: boolean;
  scheduledStartAt?: string | null;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  livestreamId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  messageType?: 'text' | 'verse' | 'emoji';
};

export type ChatMessageInput = {
  content: string;
  messageType?: 'text' | 'verse' | 'emoji';
};

export type PrayerRequest = {
  id: string;
  title: string;
  description: string;
  name?: string | null;
  isPrivate: boolean;
  createdAt?: string;
};

export type Testimony = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt?: string;
};

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  content?: string;
  publishedAt?: string;
  status?: ContentStatus;
};

export type Teaching = {
  id: string;
  title: string;
  author: string;
  content?: string;
  publishedAt?: string;
  status?: ContentStatus;
};

export type ChurchEvent = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  status?: ContentStatus;
};

export type Meeting = {
  id: string;
  title: string;
  scheduledStartTime?: string;
  isPublic: boolean;
};

export type Message = {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
};

export type Overlay = {
  type: 'bible_verse' | 'announcement' | 'lower_third';
  content: Record<string, unknown>;
  durationSeconds: number;
};

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
};
