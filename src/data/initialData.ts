import {
  User,
  StreamState,
  HeroBanner,
  Teaching,
  Sermon,
  Devotional,
  PrayerRequest,
  Testimony,
  ChurchEvent,
  ChatMessage,
  MediaItem,
  NotificationAnnouncement,
  WebsiteSettings,
} from '../types';

export const INITIAL_STREAM_STATE: StreamState = {
  isLive: false,
  isPaused: false,
  isCameraOn: false,
  isMicOn: false,
  title: '',
  speaker: '',
  scripture: '',
  category: 'Divine Service',
  startedAt: null,
  viewersCount: 0,
  bitrateKbps: 4500,
  latencySec: 0.8,
  networkQuality: 'Excellent',
  isRecording: true,
  streamSource: 'camera',
  externalUrl: '',
};

// Only authenticated Super Administrator profile — no fake or placeholder users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-primary',
    name: 'allyhamedi fat',
    email: 'mediaau77@gmail.com',
    role: 'Super Admin',
    status: 'Active',
    lastActive: 'Online Now',
  },
];

// Clean CMS Datasets — All mock, demo, and hardcoded items removed.
// Every record is fetched dynamically from Supabase database tables.
export const INITIAL_HERO_BANNERS: HeroBanner[] = [];
export const INITIAL_TEACHINGS: Teaching[] = [];
export const INITIAL_SERMONS: Sermon[] = [];
export const INITIAL_DEVOTIONALS: Devotional[] = [];
export const INITIAL_PRAYER_REQUESTS: PrayerRequest[] = [];
export const INITIAL_TESTIMONIES: Testimony[] = [];
export const INITIAL_EVENTS: ChurchEvent[] = [];
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_MEDIA: MediaItem[] = [];
export const INITIAL_NOTIFICATIONS: NotificationAnnouncement[] = [];

export const INITIAL_SETTINGS: WebsiteSettings = {
  churchName: 'Peace & Hope Seventh-day Adventist Church',
  tagline: 'Proclaiming the Everlasting Gospel & The Three Angels’ Messages',
  missionStatement: 'To make disciples of Jesus Christ who live as His loving witnesses and proclaim to all people the everlasting gospel of the Three Angels’ Messages in preparation for His soon return.',
  primaryColor: '#0F172A',
  accentColor: '#D97706',
  contactEmail: 'mediaau77@gmail.com',
  contactPhone: '+250 788 123 456',
  address: 'KN 3 Rd, Kigali Central, Rwanda',
  country: 'Rwanda',
  defaultLanguage: 'English',
  streamServerUrl: 'rtmp://live.peaceandhope.org/live',
  streamKey: 'live_ph_sda_2026_primary',
  autoRecordLivestreams: true,
  enableCommunityChat: true,
  sabbathSunsetCalculation: 'Kigali (UTC+2)',
};
