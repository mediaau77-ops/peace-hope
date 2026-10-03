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
  category: '',
  startedAt: null,
  viewersCount: 0,
  bitrateKbps: 0,
  latencySec: 0,
  networkQuality: 'Unknown',
  isRecording: false,
  streamSource: 'camera',
  externalUrl: '',
};

export const INITIAL_USERS: User[] = [];

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
  churchName: '',
  tagline: '',
  missionStatement: '',
  primaryColor: '#0F172A',
  accentColor: '#D97706',
  contactEmail: '',
  contactPhone: '',
  address: '',
  country: '',
  defaultLanguage: 'English',
  streamServerUrl: '',
  streamKey: '',
  autoRecordLivestreams: false,
  enableCommunityChat: false,
  sabbathSunsetCalculation: 'UTC',
};
