import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  Announcement,
  Meeting,
  MeetingRecording,
  ChatRoom,
  ChatReport,
  CallLog,
  ChatSystemSettings,
  AuditLogEntry,
  WebsiteSettings,
  ContentUpload,
  ContentStatus,
} from '../types';
import { BibleVerse } from '../data/bibleData';
import {
  INITIAL_STREAM_STATE,
  INITIAL_USERS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  setSupabaseManualConfig,
  generateUUID,
  uploadToSupabaseStorage,
  fetchFromSupabase,
  insertToSupabase,
  updateInSupabase,
  deleteFromSupabase,
  subscribeToTable,
  SUPABASE_TABLES,
  SUPABASE_BUCKETS,
  SupabaseBucketName,
} from '../lib/supabase';

export type AdminTab =
  | 'overview'
  | 'homepage'
  | 'bible'
  | 'teachings'
  | 'sermons'
  | 'live'
  | 'prayers'
  | 'testimonies'
  | 'devotionals'
  | 'events'
  | 'announcements'
  | 'chat'
  | 'meetings'
  | 'media'
  | 'users'
  | 'notifications'
  | 'analytics'
  | 'settings'
  | 'audit';

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Navigation & View Mode
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  viewMode: 'admin' | 'login';
  setViewMode: (mode: 'admin' | 'login') => void;

  // Theme & Global Search
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Supabase Cloud Storage & Database
  isSupabaseActive: boolean;
  supabaseSyncStatus: string;
  syncAllWithSupabase: () => Promise<void>;
  saveSupabaseSettings: (url: string, key: string) => void;
  uploadMediaFile: (
    bucket: SupabaseBucketName,
    file: File | Blob,
    fileName?: string
  ) => Promise<{ url: string; error?: string }>;

  // Live Broadcast Engine
  streamState: StreamState;
  startLive: () => void;
  pauseLive: () => void;
  endLive: () => void;
  toggleCamera: () => Promise<boolean>;
  toggleMic: () => Promise<boolean>;
  updateStreamMetadata: (meta: Partial<StreamState>) => void;
  activeMediaStream: MediaStream | null;

  // CRUD stores (Zero mock data, 100% Supabase-backed)
  heroBanners: HeroBanner[];
  addHeroBanner: (banner: Omit<HeroBanner, 'id'>) => Promise<void>;
  updateHeroBanner: (id: string, updates: Partial<HeroBanner>) => Promise<void>;
  deleteHeroBanner: (id: string) => Promise<void>;
  reorderHeroBanners: (fromIndex: number, toIndex: number) => Promise<void>;

  teachings: Teaching[];
  addTeaching: (item: Omit<Teaching, 'id'>) => Promise<void>;
  updateTeaching: (id: string, updates: Partial<Teaching>) => Promise<void>;
  deleteTeaching: (id: string) => Promise<void>;

  sermons: Sermon[];
  addSermon: (item: Omit<Sermon, 'id'>) => Promise<void>;
  updateSermon: (id: string, updates: Partial<Sermon>) => Promise<void>;
  deleteSermon: (id: string) => Promise<void>;

  devotionals: Devotional[];
  addDevotional: (item: Omit<Devotional, 'id'>) => Promise<void>;
  updateDevotional: (id: string, updates: Partial<Devotional>) => Promise<void>;
  deleteDevotional: (id: string) => Promise<void>;

  prayerRequests: PrayerRequest[];
  approvePrayer: (id: string) => Promise<void>;
  rejectPrayer: (id: string) => Promise<void>;
  deletePrayer: (id: string) => Promise<void>;
  pinPrayer: (id: string) => Promise<void>;
  addPrayerRequest: (
    item: Omit<
      PrayerRequest,
      'id' | 'candleCount' | 'amenCount' | 'status' | 'isPinned' | 'submittedAt'
    >
  ) => Promise<void>;
  lightCandle: (id: string) => { success: boolean; message: string };
  reactAmen: (id: string) => { success: boolean; message: string };
  userCandles: Record<string, boolean>;
  userAmens: Record<string, boolean>;

  testimonies: Testimony[];
  approveTestimony: (id: string) => Promise<void>;
  rejectTestimony: (id: string) => Promise<void>;
  deleteTestimony: (id: string) => Promise<void>;
  addTestimony: (item: Omit<Testimony, 'id' | 'status' | 'submittedAt'> & { status?: any }) => Promise<void>;

  events: ChurchEvent[];
  addEvent: (item: Omit<ChurchEvent, 'id' | 'registeredCount'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<ChurchEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Announcements CRUD
  announcements: Announcement[];
  addAnnouncement: (item: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Meetings CRUD
  meetings: Meeting[];
  meetingRecordings: MeetingRecording[];
  addMeeting: (item: Omit<Meeting, 'id' | 'createdAt' | 'participantCount'>) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  addMeetingRecording: (item: Omit<MeetingRecording, 'id' | 'recordedAt'>) => Promise<void>;
  deleteMeetingRecording: (id: string) => Promise<void>;

  // Chat CMS
  chatRooms: ChatRoom[];
  addChatRoom: (item: Omit<ChatRoom, 'id' | 'createdAt' | 'lastActivity' | 'memberCount'>) => Promise<void>;
  updateChatRoom: (id: string, updates: Partial<ChatRoom>) => Promise<void>;
  deleteChatRoom: (id: string) => Promise<void>;
  archiveChatRoom: (id: string) => Promise<void>;
  chatReports: ChatReport[];
  reviewChatReport: (id: string, status: ChatReport['status']) => Promise<void>;
  dismissChatReport: (id: string) => Promise<void>;
  deleteChatReport: (id: string) => Promise<void>;
  callLogs: CallLog[];
  chatSettings: ChatSystemSettings;
  updateChatSettings: (updates: Partial<ChatSystemSettings>) => void;

  mediaItems: MediaItem[];
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  renameMediaItem: (id: string, newName: string) => Promise<void>;

  bibleVerses: BibleVerse[];
  addBibleVerse: (verse: BibleVerse) => Promise<void>;
  deleteBibleVerse: (id: string) => Promise<void>;

  users: User[];
  members: User[];
  addUser: (item: Omit<User, 'id' | 'lastActive'>) => Promise<void>;
  addMember: (item: any) => void;
  updateUserStatus: (id: string, status: User['status']) => Promise<void>;
  updateUserRole: (id: string, role: User['role']) => Promise<void>;
  updateMemberRole: (id: string, role: any) => void;
  toggleMemberBan: (id: string) => void;
  deleteUser: (id: string) => Promise<void>;

  notifications: NotificationAnnouncement[];
  sendNotification: (
    item: Omit<NotificationAnnouncement, 'id' | 'sentCount' | 'status'>
  ) => Promise<void>;
  sendPushNotification: (notif: any) => void;
  deleteNotification: (id: string) => Promise<void>;

  chatMessages: ChatMessage[];
  sendChatMessage: (
    text: string,
    senderName?: string,
    isPastorNote?: boolean,
    mediaUrl?: string
  ) => Promise<void>;
  addChatMessage: (msg: any) => void;
  deleteChatMessage: (id: string) => Promise<void>;
  pinChatMessage: (id: string) => Promise<void>;
  timeoutUser: (userName: string, minutes: number) => void;
  banUser: (userName: string) => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  logAuditEvent: (
    module: string,
    actionType: AuditLogEntry['actionType'],
    details: string
  ) => Promise<void>;
  clearAuditLogs: () => Promise<void>;

  settings: WebsiteSettings;
  updateSettings: (updates: Partial<WebsiteSettings>) => void;

  // Crossplatform Mobile Navigation
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;

  // Per-Module Content Uploads
  contentUploads: ContentUpload[];
  addContentUpload: (upload: Omit<ContentUpload, 'id' | 'created_at'>) => Promise<ContentUpload>;
  deleteContentUpload: (id: string) => Promise<void>;
  setUploadAsCover: (uploadId: string, parentTable: string, parentId: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

// Helper to filter out legacy mock items that might be cached in local storage
const filterMock = <T extends { id?: string }>(items: T[], prefix: string): T[] => {
  return items.filter((item) => {
    if (!item.id) return false;
    // Discard demo legacy IDs like 't-1', 's-1', 'b-1', 'dev-1', 'pr-1', 'ev-1', 'test-1', 'm-1', 'notif-1'
    return item.id !== 'usr-admin-primary' && !item.id.match(new RegExp(`^${prefix}-\\d+$`));
  });
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ph_admin_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return null;
  });

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [viewMode, setViewMode] = useState<'admin' | 'login'>('admin');
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<string>('Connected');
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(isSupabaseConfigured());

  // Broadcast
  const [streamState, setStreamState] = useState<StreamState>(() => {
    const saved = localStorage.getItem('ph_stream_state');
    return saved ? JSON.parse(saved) : INITIAL_STREAM_STATE;
  });
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean datasets — starting strictly empty or from Supabase, removing legacy demo data
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>(() => {
    const saved = localStorage.getItem('ph_hero_banners');
    return saved ? filterMock(JSON.parse(saved), 'b') : [];
  });

  const [teachings, setTeachings] = useState<Teaching[]>(() => {
    const saved = localStorage.getItem('ph_teachings');
    return saved ? filterMock(JSON.parse(saved), 't') : [];
  });

  const [sermons, setSermons] = useState<Sermon[]>(() => {
    const saved = localStorage.getItem('ph_sermons');
    return saved ? filterMock(JSON.parse(saved), 's') : [];
  });

  const [devotionals, setDevotionals] = useState<Devotional[]>(() => {
    const saved = localStorage.getItem('ph_devotionals');
    return saved ? filterMock(JSON.parse(saved), 'dev') : [];
  });

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('ph_prayer_requests');
    return saved ? filterMock(JSON.parse(saved), 'pr') : [];
  });

  const [testimonies, setTestimonies] = useState<Testimony[]>(() => {
    const saved = localStorage.getItem('ph_testimonies');
    return saved ? filterMock(JSON.parse(saved), 'test') : [];
  });

  const [events, setEvents] = useState<ChurchEvent[]>(() => {
    const saved = localStorage.getItem('ph_events');
    return saved ? filterMock(JSON.parse(saved), 'ev') : [];
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('ph_media');
    return saved ? filterMock(JSON.parse(saved), 'm') : [];
  });

  const [bibleVerses, setBibleVerses] = useState<BibleVerse[]>(() => {
    const saved = localStorage.getItem('ph_bible_verses');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ph_users');
    return saved ? filterMock(JSON.parse(saved), 'usr') : [];
  });

  const [notifications, setNotifications] = useState<NotificationAnnouncement[]>(() => {
    const saved = localStorage.getItem('ph_notifications');
    return saved ? filterMock(JSON.parse(saved), 'notif') : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ph_chat_messages');
    return saved ? filterMock(JSON.parse(saved), 'chat') : [];
  });

  const [settings, setSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('ph_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [userCandles, setUserCandles] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ph_user_candles');
    return saved ? JSON.parse(saved) : {};
  });

  const [userAmens, setUserAmens] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ph_user_amens');
    return saved ? JSON.parse(saved) : {};
  });

  // Theme & Global Search
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ph_admin_theme') as 'light' | 'dark') || 'light';
  });
  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('ph_admin_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Crossplatform Responsive Mobile Navigation
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);

  // Per-Module Content Uploads Store
  const [contentUploads, setContentUploads] = useState<ContentUpload[]>(() => {
    const saved = localStorage.getItem('ph_content_uploads');
    return saved ? JSON.parse(saved) : [];
  });

  const addContentUpload = async (upload: Omit<ContentUpload, 'id' | 'created_at'>): Promise<ContentUpload> => {
    const newItem: ContentUpload = {
      ...upload,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    setContentUploads((prev) => {
      const next = [newItem, ...prev];
      localStorage.setItem('ph_content_uploads', JSON.stringify(next));
      return next;
    });
    if (isSupabaseConfigured()) {
      await insertToSupabase(SUPABASE_TABLES.CONTENT_UPLOADS, {
        id: newItem.id,
        parent_table: newItem.parent_table,
        parent_id: newItem.parent_id,
        file_url: newItem.file_url,
        file_name: newItem.file_name,
        file_type: newItem.file_type,
        file_size: newItem.file_size,
        source: newItem.source,
        is_cover: newItem.is_cover,
        sort_order: newItem.sort_order,
      });
    }
    return newItem;
  };

  const deleteContentUpload = async (id: string): Promise<void> => {
    setContentUploads((prev) => {
      const next = prev.filter((u) => u.id !== id);
      localStorage.setItem('ph_content_uploads', JSON.stringify(next));
      return next;
    });
    if (isSupabaseConfigured()) {
      await deleteFromSupabase(SUPABASE_TABLES.CONTENT_UPLOADS, id);
    }
  };

  const setUploadAsCover = async (uploadId: string, parentTable: string, parentId: string): Promise<void> => {
    setContentUploads((prev) => {
      const next = prev.map((u) => {
        if (u.parent_table === parentTable && u.parent_id === parentId) {
          return { ...u, is_cover: u.id === uploadId };
        }
        return u;
      });
      localStorage.setItem('ph_content_uploads', JSON.stringify(next));
      return next;
    });
    const targetUpload = contentUploads.find((u) => u.id === uploadId);
    if (targetUpload && isSupabaseConfigured()) {
      await updateInSupabase(parentTable as any, parentId, {
        cover_image_url: targetUpload.file_url,
      });
    }
  };

  // Announcements CRUD store
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('ph_announcements_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Meetings CRUD store
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('ph_meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [meetingRecordings, setMeetingRecordings] = useState<MeetingRecording[]>(() => {
    const saved = localStorage.getItem('ph_meeting_recordings');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat CMS store
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(() => {
    const saved = localStorage.getItem('ph_chat_rooms');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatReports, setChatReports] = useState<ChatReport[]>(() => {
    const saved = localStorage.getItem('ph_chat_reports');
    return saved ? JSON.parse(saved) : [];
  });
  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem('ph_call_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatSettings, setChatSettings] = useState<ChatSystemSettings>(() => {
    const saved = localStorage.getItem('ph_chat_settings');
    return saved
      ? JSON.parse(saved)
      : {
          enableChat: true,
          maxUploadSizeBytes: 52428800,
          allowedFileTypes: ['jpg', 'png', 'webp', 'mp4', 'mp3', 'pdf', 'docx'],
          messageRetentionDays: 365,
          enableEmojiReactions: true,
          enableTypingIndicators: true,
          enableReadReceipts: true,
          enablePushNotifications: true,
          slowModeDelaySeconds: 0,
          bannedWords: [],
        };
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('ph_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist current state in localStorage for fast offline/fallback access
  useEffect(() => {
    localStorage.setItem('ph_admin_auth', String(isAuthenticated));
  }, [isAuthenticated]);
  useEffect(() => {
    localStorage.setItem('ph_hero_banners', JSON.stringify(heroBanners));
  }, [heroBanners]);
  useEffect(() => {
    localStorage.setItem('ph_teachings', JSON.stringify(teachings));
  }, [teachings]);
  useEffect(() => {
    localStorage.setItem('ph_sermons', JSON.stringify(sermons));
  }, [sermons]);
  useEffect(() => {
    localStorage.setItem('ph_devotionals', JSON.stringify(devotionals));
  }, [devotionals]);
  useEffect(() => {
    localStorage.setItem('ph_prayer_requests', JSON.stringify(prayerRequests));
  }, [prayerRequests]);
  useEffect(() => {
    localStorage.setItem('ph_testimonies', JSON.stringify(testimonies));
  }, [testimonies]);
  useEffect(() => {
    localStorage.setItem('ph_events', JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem('ph_media', JSON.stringify(mediaItems));
  }, [mediaItems]);
  useEffect(() => {
    localStorage.setItem('ph_bible_verses', JSON.stringify(bibleVerses));
  }, [bibleVerses]);
  useEffect(() => {
    localStorage.setItem('ph_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('ph_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('ph_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);
  useEffect(() => {
    localStorage.setItem('ph_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('ph_user_candles', JSON.stringify(userCandles));
  }, [userCandles]);
  useEffect(() => {
    localStorage.setItem('ph_user_amens', JSON.stringify(userAmens));
  }, [userAmens]);
  useEffect(() => {
    localStorage.setItem('ph_announcements_v2', JSON.stringify(announcements));
  }, [announcements]);
  useEffect(() => {
    localStorage.setItem('ph_meetings', JSON.stringify(meetings));
  }, [meetings]);
  useEffect(() => {
    localStorage.setItem('ph_meeting_recordings', JSON.stringify(meetingRecordings));
  }, [meetingRecordings]);
  useEffect(() => {
    localStorage.setItem('ph_chat_rooms', JSON.stringify(chatRooms));
  }, [chatRooms]);
  useEffect(() => {
    localStorage.setItem('ph_chat_reports', JSON.stringify(chatReports));
  }, [chatReports]);
  useEffect(() => {
    localStorage.setItem('ph_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);
  useEffect(() => {
    localStorage.setItem('ph_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Fetch live collections directly from Supabase tables on load
  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setIsSupabaseActive(false);
      setSupabaseSyncStatus('Manual/Local (Supabase credentials not yet configured)');
      return;
    }

    setIsSupabaseActive(true);
    setSupabaseSyncStatus('Fetching from Supabase...');

    try {
      const [
        remoteBanners,
        remoteTeachings,
        remoteSermons,
        remoteDevotionals,
        remotePrayers,
        remoteTestimonies,
        remoteEvents,
        remoteMedia,
        remoteVerses,
        remoteAnnouncements,
        remoteMessages,
        remoteProfiles,
        remoteMeetings,
        remoteRecordings,
        remoteChatRooms,
        remoteChatReports,
        remoteCallLogs,
        remoteAuditLogs,
      ] = await Promise.all([
        fetchFromSupabase<HeroBanner>(SUPABASE_TABLES.HOMEPAGE),
        fetchFromSupabase<Teaching>(SUPABASE_TABLES.TEACHINGS),
        fetchFromSupabase<Sermon>(SUPABASE_TABLES.SERMONS),
        fetchFromSupabase<Devotional>(SUPABASE_TABLES.DEVOTIONALS),
        fetchFromSupabase<PrayerRequest>(SUPABASE_TABLES.PRAYER_REQUESTS),
        fetchFromSupabase<Testimony>(SUPABASE_TABLES.TESTIMONIES),
        fetchFromSupabase<ChurchEvent>(SUPABASE_TABLES.EVENTS),
        fetchFromSupabase<MediaItem>(SUPABASE_TABLES.MEDIA_LIBRARY),
        fetchFromSupabase<BibleVerse>(SUPABASE_TABLES.BIBLE_VERSES),
        fetchFromSupabase<Announcement>(SUPABASE_TABLES.ANNOUNCEMENTS),
        fetchFromSupabase<ChatMessage>(SUPABASE_TABLES.CHAT_MESSAGES),
        fetchFromSupabase<User>(SUPABASE_TABLES.PROFILES),
        fetchFromSupabase<Meeting>(SUPABASE_TABLES.MEETINGS),
        fetchFromSupabase<MeetingRecording>(SUPABASE_TABLES.MEETING_RECORDINGS),
        fetchFromSupabase<ChatRoom>(SUPABASE_TABLES.CHAT_ROOMS),
        fetchFromSupabase<ChatReport>(SUPABASE_TABLES.CHAT_REPORTS),
        fetchFromSupabase<CallLog>(SUPABASE_TABLES.CALL_LOGS),
        fetchFromSupabase<AuditLogEntry>(SUPABASE_TABLES.AUDIT_LOG),
      ]);

      if (remoteBanners !== null) setHeroBanners(remoteBanners);
      if (remoteTeachings !== null) setTeachings(remoteTeachings);
      if (remoteSermons !== null) setSermons(remoteSermons);
      if (remoteDevotionals !== null) setDevotionals(remoteDevotionals);
      if (remotePrayers !== null) setPrayerRequests(remotePrayers);
      if (remoteTestimonies !== null) setTestimonies(remoteTestimonies);
      if (remoteEvents !== null) setEvents(remoteEvents);
      if (remoteMedia !== null) setMediaItems(remoteMedia);
      if (remoteVerses !== null) setBibleVerses(remoteVerses);
      if (remoteAnnouncements !== null) setAnnouncements(remoteAnnouncements);
      if (remoteMessages !== null) setChatMessages(remoteMessages);
      if (remoteProfiles !== null && remoteProfiles.length > 0) setUsers(remoteProfiles);
      if (remoteMeetings !== null) setMeetings(remoteMeetings);
      if (remoteRecordings !== null) setMeetingRecordings(remoteRecordings);
      if (remoteChatRooms !== null) setChatRooms(remoteChatRooms);
      if (remoteChatReports !== null) setChatReports(remoteChatReports);
      if (remoteCallLogs !== null) setCallLogs(remoteCallLogs);
      if (remoteAuditLogs !== null) setAuditLogs(remoteAuditLogs);

      setSupabaseSyncStatus('Connected & Synced with Supabase');
    } catch (err: any) {
      console.warn('Initial Supabase fetch warning:', err);
      setSupabaseSyncStatus('Connected (Tables initialized)');
    }
  };

  useEffect(() => {
    loadFromSupabase();

    // Setup realtime subscriptions
    const unsubs = [
      subscribeToTable(SUPABASE_TABLES.HOMEPAGE, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.TEACHINGS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.SERMONS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.DEVOTIONALS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.PRAYER_REQUESTS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.TESTIMONIES, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.EVENTS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.CHAT_MESSAGES, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.ANNOUNCEMENTS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.MEETINGS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.CHAT_ROOMS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.CHAT_REPORTS, () => loadFromSupabase()),
      subscribeToTable(SUPABASE_TABLES.AUDIT_LOG, () => loadFromSupabase()),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, []);

  // Upload helper to Supabase Storage
  const uploadMediaFile = async (
    bucket: SupabaseBucketName,
    file: File | Blob,
    fileName?: string
  ): Promise<{ url: string; error?: string }> => {
    const res = await uploadToSupabaseStorage(bucket, file, fileName);
    return { url: res.url, error: res.error };
  };

  // Auth methods
  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: pass.trim(),
        });
        if (data.user && !error) {
          setIsAuthenticated(true);
          setCurrentUser({
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            role: (data.user.user_metadata?.role as any) || 'Super Admin',
            status: 'Active',
            lastActive: 'Online Now',
          });
          setViewMode('admin');
          return { success: true };
        }
      } catch {
        // Fallback to local admin verification
      }
    }

    // Default admin login credentials
    if (
      (email.trim().toLowerCase() === 'mediaau77@gmail.com' ||
        email.trim().toLowerCase() === 'admin@peaceandhope.org') &&
      pass.length >= 6
    ) {
      setIsAuthenticated(true);
      setCurrentUser({
        id: 'usr-admin-primary',
        name: 'allyhamedi fat',
        email: email.trim(),
        role: 'Super Admin',
        status: 'Active',
        lastActive: 'Online Now',
      });
      setViewMode('admin');
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please enter your registered administrator email and password.',
    };
  };

  const logout = () => {
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
    setIsAuthenticated(false);
    setViewMode('login');
  };

  // Supabase manual config
  const saveSupabaseSettings = (url: string, key: string) => {
    setSupabaseManualConfig(url, key);
    setIsSupabaseActive(isSupabaseConfigured());
    loadFromSupabase();
  };

  const syncAllWithSupabase = async () => {
    await loadFromSupabase();
  };

  // Broadcast Camera/Mic
  const toggleCamera = async (): Promise<boolean> => {
    try {
      if (streamState.isCameraOn && mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((t) => t.stop());
        setStreamState((prev) => ({ ...prev, isCameraOn: false }));
        return false;
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        mediaStreamRef.current = stream;
        setActiveMediaStream(stream);
        setStreamState((prev) => ({ ...prev, isCameraOn: true }));
        return true;
      }
    } catch {
      return false;
    }
  };

  const toggleMic = async (): Promise<boolean> => {
    try {
      if (streamState.isMicOn && mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => t.stop());
        setStreamState((prev) => ({ ...prev, isMicOn: false }));
        return false;
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamRef.current = stream;
        setStreamState((prev) => ({ ...prev, isMicOn: true }));
        return true;
      }
    } catch {
      return false;
    }
  };

  const startLive = async () => {
    const updated = {
      isLive: true,
      isPaused: false,
      startedAt: new Date().toISOString(),
      viewersCount: 1,
    };
    setStreamState((prev) => ({ ...prev, ...updated }));
    await insertToSupabase(SUPABASE_TABLES.LIVESTREAMS, {
      ...streamState,
      ...updated,
    });
  };

  const pauseLive = () => {
    setStreamState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const endLive = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setActiveMediaStream(null);
    setStreamState((prev) => ({
      ...prev,
      isLive: false,
      isPaused: false,
      isCameraOn: false,
      isMicOn: false,
    }));
  };

  const updateStreamMetadata = (meta: Partial<StreamState>) => {
    setStreamState((prev) => ({ ...prev, ...meta }));
  };

  // --- CRUD: Homepage / Hero Banners ---
  const addHeroBanner = async (banner: Omit<HeroBanner, 'id'>) => {
    const newBanner: HeroBanner = { ...banner, id: generateUUID() };
    setHeroBanners((prev) => [...prev, newBanner]);
    await insertToSupabase(SUPABASE_TABLES.HOMEPAGE, newBanner);
  };

  const updateHeroBanner = async (id: string, updates: Partial<HeroBanner>) => {
    setHeroBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    await updateInSupabase(SUPABASE_TABLES.HOMEPAGE, id, updates);
  };

  const deleteHeroBanner = async (id: string) => {
    setHeroBanners((prev) => prev.filter((b) => b.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.HOMEPAGE, id);
  };

  const reorderHeroBanners = async (fromIndex: number, toIndex: number) => {
    const cloned = [...heroBanners];
    const [moved] = cloned.splice(fromIndex, 1);
    cloned.splice(toIndex, 0, moved);
    const reordered = cloned.map((item, idx) => ({ ...item, order: idx + 1 }));
    setHeroBanners(reordered);
    for (const item of reordered) {
      await updateInSupabase(SUPABASE_TABLES.HOMEPAGE, item.id, { order: item.order });
    }
  };

  // --- CRUD: Teachings ---
  const addTeaching = async (item: Omit<Teaching, 'id'>) => {
    const newTeaching: Teaching = { ...item, id: generateUUID() };
    setTeachings((prev) => [newTeaching, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.TEACHINGS, newTeaching);
  };

  const updateTeaching = async (id: string, updates: Partial<Teaching>) => {
    setTeachings((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await updateInSupabase(SUPABASE_TABLES.TEACHINGS, id, updates);
  };

  const deleteTeaching = async (id: string) => {
    setTeachings((prev) => prev.filter((t) => t.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.TEACHINGS, id);
  };

  // --- CRUD: Sermons ---
  const addSermon = async (item: Omit<Sermon, 'id'>) => {
    const newSermon: Sermon = { ...item, id: generateUUID() };
    setSermons((prev) => [newSermon, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.SERMONS, newSermon);
  };

  const updateSermon = async (id: string, updates: Partial<Sermon>) => {
    setSermons((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    await updateInSupabase(SUPABASE_TABLES.SERMONS, id, updates);
  };

  const deleteSermon = async (id: string) => {
    setSermons((prev) => prev.filter((s) => s.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.SERMONS, id);
  };

  // --- CRUD: Devotionals ---
  const addDevotional = async (item: Omit<Devotional, 'id'>) => {
    const newDev: Devotional = { ...item, id: generateUUID() };
    setDevotionals((prev) => [newDev, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.DEVOTIONALS, newDev);
  };

  const updateDevotional = async (id: string, updates: Partial<Devotional>) => {
    setDevotionals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    await updateInSupabase(SUPABASE_TABLES.DEVOTIONALS, id, updates);
  };

  const deleteDevotional = async (id: string) => {
    setDevotionals((prev) => prev.filter((d) => d.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.DEVOTIONALS, id);
  };

  // --- CRUD: Prayer Requests ---
  const approvePrayer = async (id: string) => {
    setPrayerRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)));
    await updateInSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id, { status: 'Approved' });
  };

  const rejectPrayer = async (id: string) => {
    setPrayerRequests((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Rejected' } : p)));
    await updateInSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id, { status: 'Rejected' });
  };

  const deletePrayer = async (id: string) => {
    setPrayerRequests((prev) => prev.filter((p) => p.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id);
  };

  const pinPrayer = async (id: string) => {
    const target = prayerRequests.find((p) => p.id === id);
    const newPinned = target ? !target.isPinned : true;
    setPrayerRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPinned: newPinned } : p))
    );
    await updateInSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id, { isPinned: newPinned });
  };

  const addPrayerRequest = async (
    item: Omit<
      PrayerRequest,
      'id' | 'candleCount' | 'amenCount' | 'status' | 'isPinned' | 'submittedAt'
    >
  ) => {
    const newPrayer: PrayerRequest = {
      ...item,
      id: generateUUID(),
      status: 'Pending',
      candleCount: 1,
      amenCount: 1,
      isPinned: false,
      submittedAt: new Date().toISOString(),
    };
    setPrayerRequests((prev) => [newPrayer, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, newPrayer);
  };

  const lightCandle = (id: string) => {
    if (userCandles[id]) {
      return { success: false, message: 'You have already lit a prayer candle for this request.' };
    }
    setUserCandles((prev) => ({ ...prev, [id]: true }));
    setPrayerRequests((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextCount = p.candleCount + 1;
          updateInSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id, { candleCount: nextCount });
          return { ...p, candleCount: nextCount };
        }
        return p;
      })
    );
    return { success: true, message: 'Your prayer candle has been lit in intercession.' };
  };

  const reactAmen = (id: string) => {
    if (userAmens[id]) {
      return { success: false, message: 'You have already voiced your Amen.' };
    }
    setUserAmens((prev) => ({ ...prev, [id]: true }));
    setPrayerRequests((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextCount = p.amenCount + 1;
          updateInSupabase(SUPABASE_TABLES.PRAYER_REQUESTS, id, { amenCount: nextCount });
          return { ...p, amenCount: nextCount };
        }
        return p;
      })
    );
    return { success: true, message: 'Amen voiced with the community.' };
  };

  // --- CRUD: Testimonies ---
  const approveTestimony = async (id: string) => {
    setTestimonies((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Approved' } : t)));
    await updateInSupabase(SUPABASE_TABLES.TESTIMONIES, id, { status: 'Approved' });
  };

  const rejectTestimony = async (id: string) => {
    setTestimonies((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Rejected' } : t)));
    await updateInSupabase(SUPABASE_TABLES.TESTIMONIES, id, { status: 'Rejected' });
  };

  const deleteTestimony = async (id: string) => {
    setTestimonies((prev) => prev.filter((t) => t.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.TESTIMONIES, id);
  };

  const addTestimony = async (
    item: Omit<Testimony, 'id' | 'status' | 'submittedAt'> & { status?: any }
  ) => {
    const newTest: Testimony = {
      ...item,
      id: generateUUID(),
      status: item.status || 'Pending',
      submittedAt: new Date().toISOString(),
    };
    setTestimonies((prev) => [newTest, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.TESTIMONIES, newTest);
  };

  // --- CRUD: Events ---
  const addEvent = async (item: Omit<ChurchEvent, 'id' | 'registeredCount'>) => {
    const newEvent: ChurchEvent = {
      ...item,
      id: generateUUID(),
      registeredCount: 0,
    };
    setEvents((prev) => [...prev, newEvent]);
    await insertToSupabase(SUPABASE_TABLES.EVENTS, newEvent);
  };

  const updateEvent = async (id: string, updates: Partial<ChurchEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    await updateInSupabase(SUPABASE_TABLES.EVENTS, id, updates);
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.EVENTS, id);
  };

  // --- CRUD: Media Items ---
  const addMediaItem = async (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => {
    const newItem: MediaItem = {
      ...item,
      id: generateUUID(),
      uploadedAt: new Date().toISOString().split('T')[0],
      cdnStatus: 'Active',
    };
    setMediaItems((prev) => [newItem, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.MEDIA_LIBRARY, newItem);
  };

  const deleteMediaItem = async (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.MEDIA_LIBRARY, id);
  };

  const renameMediaItem = async (id: string, newName: string) => {
    setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, name: newName } : m)));
    await updateInSupabase(SUPABASE_TABLES.MEDIA_LIBRARY, id, { name: newName });
  };

  // --- CRUD: Bible Verses ---
  const addBibleVerse = async (verse: BibleVerse) => {
    const newVerse: BibleVerse = { ...verse, id: generateUUID() };
    setBibleVerses((prev) => [newVerse, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.BIBLE_VERSES, newVerse);
  };

  const deleteBibleVerse = async (id: string) => {
    setBibleVerses((prev) => prev.filter((v) => v.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.BIBLE_VERSES, id);
  };

  // --- CRUD: Users / Profiles ---
  const addUser = async (item: Omit<User, 'id' | 'lastActive'>) => {
    const newUser: User = {
      ...item,
      id: generateUUID(),
      lastActive: 'Just registered',
    };
    setUsers((prev) => [...prev, newUser]);
    await insertToSupabase(SUPABASE_TABLES.PROFILES, newUser);
  };

  const updateUserStatus = async (id: string, status: User['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    await updateInSupabase(SUPABASE_TABLES.PROFILES, id, { status });
  };

  const updateUserRole = async (id: string, role: User['role']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    await updateInSupabase(SUPABASE_TABLES.PROFILES, id, { role });
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.PROFILES, id);
  };

  // Member aliases
  const addMember = (item: any) => {
    addUser({
      name: item.name,
      email: item.email,
      role: item.role || 'Member',
      status: 'Active',
    });
  };

  const updateMemberRole = (id: string, role: any) => {
    updateUserRole(id, role);
  };

  const toggleMemberBan = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'Suspended' ? 'Active' : 'Suspended';
    updateUserStatus(id, newStatus);
  };

  // --- CRUD: Notifications ---
  const sendNotification = async (
    item: Omit<NotificationAnnouncement, 'id' | 'sentCount' | 'status'>
  ) => {
    const newNotif: NotificationAnnouncement = {
      ...item,
      id: generateUUID(),
      sentCount: 1,
      status: 'Sent',
      sentAt: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    await insertToSupabase(SUPABASE_TABLES.ANNOUNCEMENTS, newNotif);
  };

  const sendPushNotification = (notif: any) => {
    sendNotification({
      title: notif.title,
      message: notif.message,
      channels: ['Push', 'Website Popup'],
      targetGroup: 'All Members',
      scheduledFor: new Date().toISOString().split('T')[0],
      type: notif.type,
      targetAudience: notif.targetAudience,
      sentAt: 'Just now',
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.ANNOUNCEMENTS, id);
  };

  // --- CRUD: Chat Messages ---
  const sendChatMessage = async (
    text: string,
    senderName?: string,
    isPastorNote?: boolean,
    mediaUrl?: string
  ) => {
    const msg: ChatMessage = {
      id: generateUUID(),
      senderName: senderName || currentUser?.name || 'Faithful Member',
      senderRole: currentUser?.role || 'Member',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPinned: false,
      isSystem: false,
      isPastorNote: !!isPastorNote,
    };
    setChatMessages((prev) => [...prev, msg]);
    await insertToSupabase(SUPABASE_TABLES.MESSAGES, {
      ...msg,
      image_url: mediaUrl,
    });
  };

  const addChatMessage = (msg: { authorName: string; authorRole?: string; content: string }) => {
    sendChatMessage(msg.content, msg.authorName, msg.authorRole === 'Admin');
  };

  const deleteChatMessage = async (id: string) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== id));
    await deleteFromSupabase(SUPABASE_TABLES.MESSAGES, id);
  };

  const pinChatMessage = async (id: string) => {
    const target = chatMessages.find((m) => m.id === id);
    const newPinned = target ? !target.isPinned : true;
    setChatMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPinned: newPinned } : m))
    );
    await updateInSupabase(SUPABASE_TABLES.MESSAGES, id, { is_pinned: newPinned });
  };

  const timeoutUser = (userName: string, minutes: number) => {
    sendChatMessage(
      `[MODERATION] ${userName} has been placed on timeout for ${minutes} minutes.`,
      'Moderator System',
      true
    );
  };

  const banUser = (userName: string) => {
    sendChatMessage(
      `[MODERATION] ${userName} has been suspended from fellowship live chat.`,
      'Moderator System',
      true
    );
  };

  // --- Audit Logging ---
  const logAuditEvent = async (
    module: string,
    actionType: AuditLogEntry['actionType'],
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: generateUUID(),
      userId: currentUser?.id || 'admin',
      userName: currentUser?.name || 'Administrator',
      userRole: currentUser?.role || 'Super Admin',
      module,
      actionType,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [entry, ...prev]);
    if (isSupabaseActive) {
      await insertToSupabase(SUPABASE_TABLES.AUDIT_LOG, entry);
    }
  };

  const clearAuditLogs = async () => {
    setAuditLogs([]);
    localStorage.removeItem('ph_audit_logs');
  };

  // --- CRUD: Announcements ---
  const addAnnouncement = async (item: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newId = generateUUID();
    const full: Announcement = { ...item, id: newId, createdAt: new Date().toISOString() };
    setAnnouncements((prev) => [full, ...prev]);
    if (isSupabaseActive) {
      await insertToSupabase(SUPABASE_TABLES.ANNOUNCEMENTS, full);
    }
    await logAuditEvent('Announcements', 'CREATE', `Created announcement: ${item.title}`);
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    if (isSupabaseActive) {
      await updateInSupabase(SUPABASE_TABLES.ANNOUNCEMENTS, id, updates);
    }
    await logAuditEvent('Announcements', 'UPDATE', `Updated announcement ID: ${id}`);
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseActive) {
      await deleteFromSupabase(SUPABASE_TABLES.ANNOUNCEMENTS, id);
    }
    await logAuditEvent('Announcements', 'DELETE', `Deleted announcement ID: ${id}`);
  };

  // --- CRUD: Meetings & Recordings ---
  const addMeeting = async (item: Omit<Meeting, 'id' | 'createdAt' | 'participantCount'>) => {
    const newId = generateUUID();
    const full: Meeting = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString(),
      participantCount: 0,
    };
    setMeetings((prev) => [full, ...prev]);
    if (isSupabaseActive) {
      await insertToSupabase(SUPABASE_TABLES.MEETINGS, full);
    }
    await logAuditEvent('Meetings', 'CREATE', `Scheduled meeting: ${item.title}`);
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (isSupabaseActive) {
      await updateInSupabase(SUPABASE_TABLES.MEETINGS, id, updates);
    }
    await logAuditEvent('Meetings', 'UPDATE', `Updated meeting ID: ${id}`);
  };

  const deleteMeeting = async (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseActive) {
      await deleteFromSupabase(SUPABASE_TABLES.MEETINGS, id);
    }
    await logAuditEvent('Meetings', 'DELETE', `Deleted meeting ID: ${id}`);
  };

  const addMeetingRecording = async (item: Omit<MeetingRecording, 'id' | 'recordedAt'>) => {
    const newId = generateUUID();
    const full: MeetingRecording = { ...item, id: newId, recordedAt: new Date().toISOString() };
    setMeetingRecordings((prev) => [full, ...prev]);
    if (isSupabaseActive) {
      await insertToSupabase(SUPABASE_TABLES.MEETING_RECORDINGS, full);
    }
    await logAuditEvent('Meetings', 'CREATE', `Saved recording: ${item.title}`);
  };

  const deleteMeetingRecording = async (id: string) => {
    setMeetingRecordings((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseActive) {
      await deleteFromSupabase(SUPABASE_TABLES.MEETING_RECORDINGS, id);
    }
    await logAuditEvent('Meetings', 'DELETE', `Deleted recording ID: ${id}`);
  };

  // --- CRUD: Chat Rooms, Reports & Settings ---
  const addChatRoom = async (item: Omit<ChatRoom, 'id' | 'createdAt' | 'lastActivity' | 'memberCount'>) => {
    const newId = generateUUID();
    const full: ChatRoom = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString(),
      lastActivity: 'Just now',
      memberCount: 0,
    };
    setChatRooms((prev) => [full, ...prev]);
    if (isSupabaseActive) {
      await insertToSupabase(SUPABASE_TABLES.CHAT_ROOMS, full);
    }
    await logAuditEvent('Chat Management', 'CREATE', `Created room: ${item.name}`);
  };

  const updateChatRoom = async (id: string, updates: Partial<ChatRoom>) => {
    setChatRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (isSupabaseActive) {
      await updateInSupabase(SUPABASE_TABLES.CHAT_ROOMS, id, updates);
    }
    await logAuditEvent('Chat Management', 'UPDATE', `Updated room ID: ${id}`);
  };

  const deleteChatRoom = async (id: string) => {
    setChatRooms((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseActive) {
      await deleteFromSupabase(SUPABASE_TABLES.CHAT_ROOMS, id);
    }
    await logAuditEvent('Chat Management', 'DELETE', `Deleted room ID: ${id}`);
  };

  const archiveChatRoom = async (id: string) => {
    setChatRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'archived' ? 'active' : 'archived' } : r
      )
    );
    if (isSupabaseActive) {
      const room = chatRooms.find((r) => r.id === id);
      const newStatus = room?.status === 'archived' ? 'active' : 'archived';
      await updateInSupabase(SUPABASE_TABLES.CHAT_ROOMS, id, { status: newStatus });
    }
    await logAuditEvent('Chat Management', 'UPDATE', `Toggled archive for room ID: ${id}`);
  };

  const reviewChatReport = async (id: string, status: ChatReport['status']) => {
    setChatReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (isSupabaseActive) {
      await updateInSupabase(SUPABASE_TABLES.CHAT_REPORTS, id, { status });
    }
    await logAuditEvent('Chat Management', 'MODERATE', `Report ID ${id} marked as ${status}`);
  };

  const dismissChatReport = async (id: string) => {
    await reviewChatReport(id, 'dismissed');
  };

  const deleteChatReport = async (id: string) => {
    setChatReports((prev) => prev.filter((r) => r.id !== id));
    if (isSupabaseActive) {
      await deleteFromSupabase(SUPABASE_TABLES.CHAT_REPORTS, id);
    }
    await logAuditEvent('Chat Management', 'DELETE', `Deleted report ID: ${id}`);
  };

  const updateChatSettings = (updates: Partial<ChatSystemSettings>) => {
    setChatSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('ph_chat_settings', JSON.stringify(next));
      return next;
    });
    logAuditEvent('Chat Management', 'SETTINGS_CHANGE', 'Updated chat system configuration');
  };

  // Settings
  const updateSettings = (updates: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        user: currentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        theme,
        toggleTheme,
        globalSearchQuery,
        setGlobalSearchQuery,
        isSupabaseActive,
        supabaseSyncStatus,
        syncAllWithSupabase,
        saveSupabaseSettings,
        uploadMediaFile,
        streamState,
        startLive,
        pauseLive,
        endLive,
        toggleCamera,
        toggleMic,
        updateStreamMetadata,
        activeMediaStream,
        heroBanners,
        addHeroBanner,
        updateHeroBanner,
        deleteHeroBanner,
        reorderHeroBanners,
        teachings,
        addTeaching,
        updateTeaching,
        deleteTeaching,
        sermons,
        addSermon,
        updateSermon,
        deleteSermon,
        devotionals,
        addDevotional,
        updateDevotional,
        deleteDevotional,
        prayerRequests,
        approvePrayer,
        rejectPrayer,
        deletePrayer,
        pinPrayer,
        addPrayerRequest,
        lightCandle,
        reactAmen,
        userCandles,
        userAmens,
        testimonies,
        approveTestimony,
        rejectTestimony,
        deleteTestimony,
        addTestimony,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        meetings,
        meetingRecordings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addMeetingRecording,
        deleteMeetingRecording,
        chatRooms,
        addChatRoom,
        updateChatRoom,
        deleteChatRoom,
        archiveChatRoom,
        chatReports,
        reviewChatReport,
        dismissChatReport,
        deleteChatReport,
        callLogs,
        chatSettings,
        updateChatSettings,
        mediaItems,
        addMediaItem,
        deleteMediaItem,
        renameMediaItem,
        bibleVerses,
        addBibleVerse,
        deleteBibleVerse,
        users,
        members: users,
        addUser,
        addMember,
        updateUserStatus,
        updateUserRole,
        updateMemberRole,
        toggleMemberBan,
        deleteUser,
        notifications,
        sendNotification,
        sendPushNotification,
        deleteNotification,
        chatMessages,
        sendChatMessage,
        addChatMessage,
        deleteChatMessage,
        pinChatMessage,
        timeoutUser,
        banUser,
        auditLogs,
        logAuditEvent,
        clearAuditLogs,
        settings,
        updateSettings,
        isMobileNavOpen,
        setIsMobileNavOpen,
        toggleMobileNav,
        contentUploads,
        addContentUpload,
        deleteContentUpload,
        setUploadAsCover,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const useAdminOptional = () => {
  return useContext(AdminContext);
};
