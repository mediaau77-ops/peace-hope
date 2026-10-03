export type Role = 'super_admin' | 'admin' | 'moderator' | 'editor' | 'Super Admin' | 'Moderator' | 'Teacher' | 'Member' | 'Pastor' | 'Deacon' | 'Church Member' | 'Guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Suspended' | 'Pending';
  lastActive: string;
  avatarUrl?: string;
  churchBranch?: string;
  joinedDate?: string;
  phone?: string;
}

export interface StreamState {
  isLive: boolean;
  isPaused: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  title: string;
  speaker: string;
  scripture: string;
  category: string;
  startedAt: string | null;
  viewersCount: number;
  bitrateKbps: number;
  latencySec: number;
  networkQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unknown';
  isRecording: boolean;
  streamSource: 'camera' | 'rtmp' | 'hls';
  externalUrl?: string;
}

export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface ContentUpload {
  id: string;
  parent_table: string;
  parent_id: string;
  file_url: string;
  file_name?: string;
  file_type: 'image' | 'video' | 'audio' | 'pdf' | 'document' | string;
  file_size: number;
  source: 'device' | 'google-drive';
  is_cover: boolean;
  sort_order: number;
  created_by?: string;
  created_at: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: string;
  type?: string;
  visible?: boolean;
  media_url?: string;
  media_type?: 'image' | 'video';
  cover_image_url?: string;
  sort_order: number;
  status: ContentStatus;
  created_at?: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  bgImageUrl: string;
  cover_image_url?: string;
  welcomeVideoUrl?: string;
  ctaText: string;
  ctaLink: string;
  status?: ContentStatus;
  active: boolean;
  order: number;
}

export interface Teaching {
  id: string;
  title: string;
  coverImage: string;
  cover_image_url?: string;
  videoUrl?: string;
  content: string;
  bibleReferences: string[];
  category: 'Sabbath Truth' | 'Sanctuary & Prophecy' | 'Health & Temperance' | 'Second Coming' | 'Christian Living';
  author: string;
  publishDate: string;
  scheduled_at?: string;
  status: 'Published' | 'Draft' | 'Scheduled' | ContentStatus;
  readTimeMinutes: number;
  attachments?: string[];
  inlineImages?: string[];
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  bibleReference: string;
  category: 'Divine Service' | 'Sabbath School' | 'Evangelism' | 'Youth Ministry' | 'Health & Prophecy';
  videoUrl: string;
  thumbnailUrl: string;
  cover_image_url?: string;
  duration: string;
  views?: number;
  hlsReady?: boolean;
  transcript: string;
  status?: ContentStatus;
  scheduled_at?: string;
}

export interface Devotional {
  id: string;
  date: string;
  title: string;
  verseReference: string;
  verseText: string;
  meditation: string;
  prayer: string;
  author: string;
  imageUrl: string;
  cover_image_url?: string;
  inline_image_url?: string;
  status: 'Published' | 'Scheduled' | ContentStatus;
  scheduled_at?: string;
}

export interface PrayerRequest {
  id: string;
  authorName: string;
  authorEmail: string;
  isAnonymous: boolean;
  location: string;
  title: string;
  content: string;
  cover_image_url?: string;
  category: 'Health & Healing' | 'Spiritual Growth' | 'Family' | 'Church Mission' | 'Thanksgiving';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Answered' | ContentStatus;
  candleCount: number;
  amenCount: number;
  isPinned: boolean;
  submittedAt: string;
}

export interface Testimony {
  id: string;
  authorName: string;
  location: string;
  title: string;
  story: string;
  testimonyText?: string;
  date?: string;
  mediaUrl?: string;
  imageUrl?: string;
  cover_image_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | ContentStatus;
  submittedAt: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  theme?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  time: string;
  location: string;
  speaker?: string;
  isOnline?: boolean;
  bannerUrl?: string;
  imageUrl?: string;
  cover_image_url?: string;
  flyer_url?: string;
  gallery_urls?: string[];
  capacity?: number;
  registeredCount?: number;
  isRecurringWeekly?: boolean;
  registrationRequired?: boolean;
  status?: ContentStatus;
  category: 'Camp Meeting' | 'Week of Prayer' | 'Youth Rally' | 'Sabbath School Convention' | 'Health Expo' | 'Sabbath Worship' | 'Youth Fellowship' | 'Health Ministry';
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  body: string;
  cover_image_url?: string;
  publishDate: string;
  expiryDate: string;
  priority: 'Normal' | 'High' | 'Urgent';
  targetAudience: 'All Members' | 'Leaders' | 'Youth' | 'Choir' | 'Sabbath School Teachers';
  channels: ('Website' | 'App Push' | 'SMS' | 'Email')[];
  status: 'Published' | 'Scheduled' | 'Expired' | 'Draft' | ContentStatus;
  createdAt?: string;
}

// Chat Management (WhatsApp-like CMS)
export type ChatRoomType = 'public' | 'group' | 'ministry' | 'private' | 'broadcast';

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: ChatRoomType;
  coverImage?: string;
  memberCount: number;
  lastActivity: string;
  status: 'active' | 'archived' | 'muted';
  welcomeMessage?: string;
  isE2EE?: boolean; // 1:1 private chats are E2EE encrypted
  ministryGroup?: string;
  createdAt: string;
  pinnedAnnouncement?: string;
}

export interface ChatRoomMember {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'muted' | 'banned';
  joinedDate: string;
  lastSeen: string;
  messageCount: number;
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  senderId?: string;
  senderName: string;
  senderRole?: string;
  authorName?: string;
  authorRole?: string;
  avatar?: string;
  text: string;
  content?: string;
  timestamp: string;
  isPinned: boolean;
  isSystem: boolean;
  isPastorNote?: boolean;
  isEncrypted?: boolean;
  encryptedPayload?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'audio' | 'document' | 'bible';
  reactions?: Record<string, number>; // emoji -> count
  status?: 'sent' | 'delivered' | 'read' | 'hidden' | 'deleted';
  bibleRef?: string;
}

export interface ChatReport {
  id: string;
  messageId: string;
  roomId: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: 'Spam' | 'Abuse' | 'Offensive content' | 'Fake information';
  messageSnippet: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
}

export interface CallLog {
  id: string;
  type: 'voice' | 'video' | 'group';
  participants: string[];
  callerName: string;
  durationSeconds: number;
  status: 'completed' | 'missed' | 'declined';
  timestamp: string;
}

export interface ChatSystemSettings {
  enableChat: boolean;
  maxUploadSizeBytes: number;
  allowedFileTypes: string[];
  messageRetentionDays: number;
  enableEmojiReactions: boolean;
  enableTypingIndicators: boolean;
  enableReadReceipts: boolean;
  enablePushNotifications: boolean;
  slowModeDelaySeconds: number;
  bannedWords: string[];
}

// Meet Call Management (Google Meet-like CMS)
export type MeetingType = 'private call' | 'group meeting' | 'Bible study' | 'church conference' | 'pastoral counseling';

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  scheduledAt?: string;
  durationMinutes: number;
  type: MeetingType;
  coverImage?: string;
  meetingLink?: string;
  passcode?: string;
  hostId?: string;
  hostName: string;
  status: 'scheduled' | 'live' | 'ended';
  isLocked?: boolean;
  isRecorded?: boolean;
  waitingRoomEnabled: boolean;
  invitedGroups?: string[];
  participantCount: number;
  createdAt: string;
}

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  userId: string;
  name: string;
  role: 'host' | 'co-host' | 'participant';
  isAudioOn: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  networkQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  joinedAt: string;
}

export interface MeetingRecording {
  id: string;
  meetingId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  speaker?: string;
  duration?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  recordedAt: string;
  publishedToSermons: boolean;
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  module: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'MODERATE' | 'BROADCAST' | 'SETTINGS_CHANGE' | 'LOGIN' | 'EXPORT';
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Google Drive Integration
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  iconUrl?: string;
  thumbnailUrl?: string;
  modifiedTime: string;
}

export interface GoogleDriveToken {
  id: string;
  adminId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  email?: string;
  connectedAt: string;
}

// Media Library
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'document';
  folder?: 'Sermons' | 'Banners' | 'Hymnals' | 'Bulletins' | 'Ellen G White Library' | 'Chat' | 'Meetings' | 'Google Drive Imports';
  sizeBytes?: number;
  size?: string;
  uploadedAt: string;
  url: string;
  cdnStatus?: 'Active' | 'Propagating' | 'Cached';
  bucket?: string;
  source?: 'device' | 'google-drive';
}

export interface NotificationAnnouncement {
  id: string;
  title: string;
  message: string;
  channels?: ('Website Popup' | 'Email' | 'SMS' | 'Push')[];
  targetGroup?: 'All Members' | 'Sabbath School Teachers' | 'Youth' | 'Choir' | 'Prayer Warriors';
  targetAudience?: 'All Members' | 'Registered Users' | 'Prayer Warriors';
  scheduledFor?: string;
  status?: 'Sent' | 'Scheduled' | 'Draft';
  sentCount?: number;
  sentAt?: string;
  type?: 'Live Alert' | 'Sermon Update' | 'Prayer Reminder' | 'General Notice';
}

export type AppNotification = NotificationAnnouncement;
export type MemberUser = User;

export interface WebsiteSettings {
  churchName: string;
  siteName?: string;
  logoUrl?: string;
  tagline: string;
  missionStatement: string;
  primaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  contactAddress?: string;
  country: string;
  defaultLanguage: 'Kinyarwanda' | 'English' | 'Français';
  streamServerUrl: string;
  rtmpServer?: string;
  streamKey: string;
  autoRecordLivestreams: boolean;
  autoRecordLiveStreams?: boolean;
  enableCommunityChat: boolean;
  sabbathSunsetCalculation: 'Kigali (UTC+2)' | 'UTC' | 'Auto-GPS';
  maintenanceMode?: boolean;
  smtpServer?: string;
  smtpUser?: string;
  googleDriveClientId?: string;
  googleDriveApiKey?: string;
  livekitUrl?: string;
  livekitApiKey?: string;
  storageQuotaMb?: number;
  socialLinks?: {
    youtube?: string;
    facebook?: string;
  };
}
