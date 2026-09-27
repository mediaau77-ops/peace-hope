import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

// Theme Schema
export const ThemeUpdateSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    logoLightUrl: z.string().optional().default(''),
    logoDarkUrl: z.string().optional().default(''),
    faviconUrl: z.string().optional().default(''),
  }).optional(),
  colors: z.object({
    primary: z.string(),
    primaryForeground: z.string(),
    secondary: z.string(),
    secondaryForeground: z.string(),
    accent: z.string(),
    accentForeground: z.string(),
    backgroundLight: z.string(),
    backgroundDark: z.string(),
    surfaceLight: z.string(),
    surfaceDark: z.string(),
    textLight: z.string(),
    textDark: z.string(),
    mutedLight: z.string(),
    mutedDark: z.string(),
    borderLight: z.string(),
    borderDark: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
  }).optional(),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    baseSize: z.string(),
  }).optional(),
  radius: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
  }).optional(),
  shadows: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
  }).optional(),
});

// Livestream Schemas
export const CreateLivestreamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  scheduledStartAt: z.string().optional(),
  provider: z.enum(['mux', 'livekit', 'cloudflare', 'ivs', 'rtmp']).default('mux'),
  isPublic: z.boolean().default(true),
  chatEnabled: z.boolean().default(true),
  reactionsEnabled: z.boolean().default(true),
});

export const UpdateLivestreamSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  scheduledStartAt: z.string().optional(),
  playbackUrl: z.string().optional().nullable(),
  ingestUrl: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  chatEnabled: z.boolean().optional(),
  reactionsEnabled: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export const CreateChatMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  messageType: z.enum(['text', 'verse', 'emoji']).default('text'),
});

export const CreateReactionSchema = z.object({
  emoji: z.string().min(1).max(8),
});

export const CreateReminderSchema = z.object({
  email: z.string().email('Valid email is required'),
  sendAt: z.string().optional(),
});

export const PushOverlaySchema = z.object({
  type: z.enum(['bible_verse', 'announcement', 'lower_third']),
  content: z.record(z.string(), z.any()),
  durationSeconds: z.number().int().min(3).max(120).default(15),
});

// Prayer Request Schema
export const CreatePrayerRequestSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Prayer details required'),
  name: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

// Testimony Schema
export const CreateTestimonySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Testimony content is required'),
  authorName: z.string().min(2, 'Name is required'),
});

// Meeting Schema
export const CreateMeetingSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  scheduledStartTime: z.string().optional(),
  isPublic: z.boolean().default(true),
});

// Sermons / Teachings / Devotionals / Events Schemas
export const ContentItemSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  slug: z.string().optional(),
  speaker: z.string().optional(),
  author: z.string().optional(),
  scripture: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  date: z.string().optional(),
  cover_image_url: z.string().optional(),
  video_url: z.string().optional(),
  audio_url: z.string().optional(),
  pdf_url: z.string().optional(),
  category: z.string().optional(),
  is_featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});
