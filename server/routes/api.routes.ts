import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { getThemeConfig, updateThemeConfig } from '../services/theme.service';
import * as LivestreamService from '../services/livestream.service';
import * as SermonsService from '../services/sermons.service';
import * as TeachingsService from '../services/teachings.service';
import * as DevotionalsService from '../services/devotionals.service';
import * as EventsService from '../services/events.service';
import * as PrayerService from '../services/prayer.service';
import * as TestimoniesService from '../services/testimonies.service';
import * as BibleService from '../services/bible.service';
import * as MeetingsService from '../services/meetings.service';
import * as UsersService from '../services/users.service';
import * as MediaService from '../services/media.service';
import * as NotificationsService from '../services/notifications.service';
import * as SettingsService from '../services/settings.service';
import { getDbClient, SUPABASE_TABLES } from '../db/client';
import { publicRoute, authRoute, adminRoute, AuthenticatedRequest } from '../auth/middlewares';
import { registerStreamSSE } from '../realtime/relay';
import {
  CreateLivestreamSchema,
  UpdateLivestreamSchema,
  CreateChatMessageSchema,
  CreateReactionSchema,
  CreateReminderSchema,
  PushOverlaySchema,
  CreatePrayerRequestSchema,
  CreateTestimonySchema,
  CreateMeetingSchema,
  ContentItemSchema,
  ThemeUpdateSchema,
} from '../validation/schemas';

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25 MB max
export const apiRouter = Router();

// Standard Helper for Typed ApiResponse Envelope
function success<T>(res: Response, data: T, meta?: Record<string, unknown>, status = 200) {
  return res.status(status).json({ ok: true, data, ...(meta ? { meta } : {}) });
}

function error(res: Response, code: string, message: string, status = 400, details?: unknown) {
  return res.status(status).json({ ok: false, error: { code, message, details } });
}

// ==============================================================================
// 1. Theme Endpoints (Backend Single Source of Truth)
// ==============================================================================
apiRouter.get('/theme', publicRoute(), async (_req, res, next) => {
  try {
    const theme = await getThemeConfig();
    return success(res, theme);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/theme', adminRoute(), async (req, res, next) => {
  try {
    const parsed = ThemeUpdateSchema.parse(req.body);
    const updated = await updateThemeConfig(parsed as any);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 2. Settings Endpoints
// ==============================================================================
apiRouter.get('/settings/public', publicRoute(), async (_req, res, next) => {
  try {
    const settings = await SettingsService.getPublicSettings();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/settings', adminRoute(), async (_req, res, next) => {
  try {
    const settings = await SettingsService.getFullSettings();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/settings', adminRoute(), async (req, res, next) => {
  try {
    const updated = await SettingsService.updateSettings(req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 2.1 Homepage & Announcements Endpoints (Public Reads)
// ==============================================================================
apiRouter.get('/homepage', publicRoute(), async (_req, res, next) => {
  try {
    const supabase = getDbClient();
    const { data } = await supabase
      .from(SUPABASE_TABLES.HOMEPAGE)
      .select('*')
      .limit(1)
      .maybeSingle();
    return success(res, data || null);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/announcements', publicRoute(), async (_req, res, next) => {
  try {
    const supabase = getDbClient();
    const { data } = await supabase
      .from(SUPABASE_TABLES.ANNOUNCEMENTS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return success(res, data || []);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 3. Live Worship Endpoints (Strictly Driven by Backend Broadcast)
// ==============================================================================
// GET /api/livestreams/active — strictly returns row where status = 'live' and is_public = true, or null
apiRouter.get('/livestreams/active', publicRoute(), async (_req, res, next) => {
  try {
    const active = await LivestreamService.getActiveLivestream();
    return success(res, active);
  } catch (err) {
    next(err);
  }
});

// GET /api/livestreams/current — returns live > scheduled > ended > null
apiRouter.get('/livestreams/current', publicRoute(), async (_req, res, next) => {
  try {
    const current = await LivestreamService.getScheduledOrLatestLivestream();
    return success(res, current);
  } catch (err) {
    next(err);
  }
});

// GET /api/livestreams — list streams (admin only)
apiRouter.get('/livestreams', adminRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const result = await LivestreamService.listLivestreams(page, limit, status);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams — create stream (admin only)
apiRouter.post('/livestreams', adminRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const parsed = CreateLivestreamSchema.parse(req.body);
    const stream = await LivestreamService.createLivestream(parsed, user.id);
    return success(res, stream, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/livestreams/:id — get stream details (public read)
apiRouter.get('/livestreams/:id', publicRoute(), async (req, res, next) => {
  try {
    const stream = await LivestreamService.getLivestreamById(req.params.id);
    if (!stream) return error(res, 'NOT_FOUND', 'Livestream not found', 404);
    return success(res, stream);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/livestreams/:id — update metadata (admin only)
apiRouter.patch('/livestreams/:id', adminRoute(), async (req, res, next) => {
  try {
    const parsed = UpdateLivestreamSchema.parse(req.body);
    const updated = await LivestreamService.updateLivestream(req.params.id, parsed);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/go-live — sets status = 'live', writes playback_url (admin only)
apiRouter.post('/livestreams/:id/go-live', adminRoute(), async (req, res, next) => {
  try {
    const liveStream = await LivestreamService.goLive(req.params.id);
    return success(res, liveStream);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/end — sets status = 'ended' (admin only)
apiRouter.post('/livestreams/:id/end', adminRoute(), async (req, res, next) => {
  try {
    const ended = await LivestreamService.endStream(req.params.id);
    return success(res, ended);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/livestreams/:id — delete stream (admin only)
apiRouter.delete('/livestreams/:id', adminRoute(), async (req, res, next) => {
  try {
    await LivestreamService.deleteLivestream(req.params.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/livestreams/:id/chat — paginated chat (public read)
apiRouter.get('/livestreams/:id/chat', publicRoute(), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const messages = await LivestreamService.getChatMessages(req.params.id, limit);
    return success(res, messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/chat — authenticated insert
apiRouter.post('/livestreams/:id/chat', authRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const parsed = CreateChatMessageSchema.parse(req.body);
    const message = await LivestreamService.postChatMessage(
      req.params.id,
      user,
      parsed.content,
      parsed.messageType
    );
    return success(res, message, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/reactions — authenticated reaction
apiRouter.post('/livestreams/:id/reactions', authRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const parsed = CreateReactionSchema.parse(req.body);
    const reaction = await LivestreamService.postReaction(req.params.id, user, parsed.emoji);
    return success(res, reaction, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/livestreams/:id/overlays — active overlay (public read)
apiRouter.get('/livestreams/:id/overlays', publicRoute(), async (req, res, next) => {
  try {
    const overlay = await LivestreamService.getOverlays(req.params.id);
    return success(res, overlay);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/reminders — subscribe to reminder (public)
apiRouter.post('/livestreams/:id/reminders', publicRoute(), async (req, res, next) => {
  try {
    const parsed = CreateReminderSchema.parse(req.body);
    const reminder = await LivestreamService.createLivestreamReminder(
      req.params.id,
      parsed.email,
      parsed.sendAt
    );
    return success(res, reminder, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// POST /api/livestreams/:id/overlays — push overlay (admin only)
apiRouter.post('/livestreams/:id/overlays', adminRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const parsed = PushOverlaySchema.parse(req.body);
    const overlay = await LivestreamService.pushOverlay(
      req.params.id,
      parsed.type,
      parsed.content,
      parsed.durationSeconds,
      user.id
    );
    return success(res, overlay, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 4. Realtime SSE Relay Endpoint (No Supabase on Client)
// ==============================================================================
// GET /api/realtime/livestream/:id
apiRouter.get('/realtime/livestream/:id', publicRoute(), (req, res) => {
  const streamId = req.params.id;
  registerStreamSSE(streamId, res);
});

// ==============================================================================
// 5. Sermons Endpoints
// ==============================================================================
apiRouter.get('/sermons', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const result = await SermonsService.listSermons(page, limit, search, category);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/sermons/:slug', publicRoute(), async (req, res, next) => {
  try {
    const sermon = await SermonsService.getSermonBySlug(req.params.slug);
    if (!sermon) return error(res, 'NOT_FOUND', 'Sermon not found', 404);
    return success(res, sermon);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/sermons', adminRoute(), async (req, res, next) => {
  try {
    const parsed = ContentItemSchema.parse(req.body);
    const sermon = await SermonsService.createSermon(parsed);
    return success(res, sermon, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/sermons/:id', adminRoute(), async (req, res, next) => {
  try {
    const updated = await SermonsService.updateSermon(req.params.id, req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

apiRouter.delete('/sermons/:id', adminRoute(), async (req, res, next) => {
  try {
    await SermonsService.deleteSermon(req.params.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 6. Teachings Endpoints
// ==============================================================================
apiRouter.get('/teachings', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const result = await TeachingsService.listTeachings(page, limit, search, category);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/teachings/:slug', publicRoute(), async (req, res, next) => {
  try {
    const item = await TeachingsService.getTeachingBySlug(req.params.slug);
    if (!item) return error(res, 'NOT_FOUND', 'Teaching not found', 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/teachings', adminRoute(), async (req, res, next) => {
  try {
    const parsed = ContentItemSchema.parse(req.body);
    const item = await TeachingsService.createTeaching(parsed);
    return success(res, item, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/teachings/:id', adminRoute(), async (req, res, next) => {
  try {
    const updated = await TeachingsService.updateTeaching(req.params.id, req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

apiRouter.delete('/teachings/:id', adminRoute(), async (req, res, next) => {
  try {
    await TeachingsService.deleteTeaching(req.params.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 7. Devotionals Endpoints
// ==============================================================================
apiRouter.get('/devotionals', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string | undefined;
    const result = await DevotionalsService.listDevotionals(page, limit, search);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/devotionals/:slug', publicRoute(), async (req, res, next) => {
  try {
    const item = await DevotionalsService.getDevotionalBySlug(req.params.slug);
    if (!item) return error(res, 'NOT_FOUND', 'Devotional not found', 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/devotionals', adminRoute(), async (req, res, next) => {
  try {
    const parsed = ContentItemSchema.parse(req.body);
    const item = await DevotionalsService.createDevotional(parsed);
    return success(res, item, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/devotionals/:id', adminRoute(), async (req, res, next) => {
  try {
    const updated = await DevotionalsService.updateDevotional(req.params.id, req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

apiRouter.delete('/devotionals/:id', adminRoute(), async (req, res, next) => {
  try {
    await DevotionalsService.deleteDevotional(req.params.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 8. Events Endpoints
// ==============================================================================
apiRouter.get('/events', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const upcoming = req.query.upcoming === 'true';
    const result = await EventsService.listEvents(page, limit, upcoming);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/events/:slug', publicRoute(), async (req, res, next) => {
  try {
    const item = await EventsService.getEventBySlug(req.params.slug);
    if (!item) return error(res, 'NOT_FOUND', 'Event not found', 404);
    return success(res, item);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/events', adminRoute(), async (req, res, next) => {
  try {
    const parsed = ContentItemSchema.parse(req.body);
    const item = await EventsService.createEvent(parsed);
    return success(res, item, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.patch('/events/:id', adminRoute(), async (req, res, next) => {
  try {
    const updated = await EventsService.updateEvent(req.params.id, req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

apiRouter.delete('/events/:id', adminRoute(), async (req, res, next) => {
  try {
    await EventsService.deleteEvent(req.params.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 9. Prayer Requests Endpoints
// ==============================================================================
apiRouter.get('/prayer', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await PrayerService.listPrayerRequests(page, limit, true);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/prayer', publicRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = CreatePrayerRequestSchema.parse(req.body);
    const created = await PrayerService.submitPrayerRequest(parsed, req.user?.id);
    return success(res, created, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/prayer/:id/pray', publicRoute(), async (req, res, next) => {
  try {
    const updated = await PrayerService.prayForRequest(req.params.id);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 10. Testimonies Endpoints
// ==============================================================================
apiRouter.get('/testimonies', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await TestimoniesService.listTestimonies(page, limit, true);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/testimonies', publicRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = CreateTestimonySchema.parse(req.body);
    const created = await TestimoniesService.submitTestimony(parsed, req.user?.id);
    return success(res, created, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 11. Bible Reader Endpoints
// ==============================================================================
apiRouter.get('/bible/books', publicRoute(), async (_req, res, next) => {
  try {
    const books = await BibleService.getBibleBooks();
    return success(res, books);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/bible/:book/:chapter', publicRoute(), async (req, res, next) => {
  try {
    const book = req.params.book;
    const chapter = parseInt(req.params.chapter) || 1;
    const verses = await BibleService.getChapterVerses(book, chapter);
    return success(res, verses);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 12. Meetings Endpoints
// ==============================================================================
apiRouter.get('/meetings', publicRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await MeetingsService.listMeetings(page, limit);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/meetings/:id', publicRoute(), async (req, res, next) => {
  try {
    const meeting = await MeetingsService.getMeetingById(req.params.id);
    if (!meeting) return error(res, 'NOT_FOUND', 'Meeting not found', 404);
    return success(res, meeting);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/meetings', authRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const parsed = CreateMeetingSchema.parse(req.body);
    const meeting = await MeetingsService.createMeeting(parsed, user.id);
    return success(res, meeting, undefined, 201);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 13. Users & Auth Profile Endpoints
// ==============================================================================
// GET /api/users/me — returns user profile if session exists, or null for anonymous visitors (never 401)
apiRouter.get('/users/me', publicRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      return success(res, null);
    }
    const profile = await UsersService.getCurrentUserProfile(req.user);
    return success(res, profile);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — updates current user profile (requires auth)
apiRouter.patch('/users/me', authRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const updated = await UsersService.updateCurrentUserProfile(user, req.body);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/users', adminRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await UsersService.listUsers(page, limit);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 14. Media Upload Endpoints
// ==============================================================================
apiRouter.post('/media/upload', adminRoute(), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'BAD_REQUEST', 'No file provided');
    }
    const bucket = (req.body.bucket as string) || 'documents';
    const uploaded = await MediaService.uploadMediaFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      bucket
    );
    return success(res, uploaded, undefined, 201);
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/media', adminRoute(), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await MediaService.listMediaLibrary(page, limit);
    return success(res, result.items, { total: result.total, page, limit });
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 15. Notifications Endpoints
// ==============================================================================
apiRouter.get('/notifications', authRoute(), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const notifs = await NotificationsService.listNotifications(user.id);
    return success(res, notifs);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/notifications/:id/read', authRoute(), async (req, res, next) => {
  try {
    const updated = await NotificationsService.markNotificationRead(req.params.id);
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

// ==============================================================================
// 16. Auth Endpoints (Backend Controlled)
// ==============================================================================
apiRouter.post('/auth/signin', publicRoute(), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const supabase = (await import('../db/client')).getDbClient();
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) return error(res, 'AUTH_ERROR', authErr.message, 401);

    if (data.session) {
      res.cookie('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    const authHelper = await import('../auth/requireUser');
    const user = await authHelper.getAuthUser(req);
    return success(res, { user, session: data.session });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/auth/signup', publicRoute(), async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const supabase = (await import('../db/client')).getDbClient();
    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (authErr) return error(res, 'AUTH_ERROR', authErr.message, 400);

    return success(res, { user: data.user });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/auth/google/url', publicRoute(), async (req, res, next) => {
  try {
    const supabase = (await import('../db/client')).getDbClient();
    const returnUrl = (req.query.returnUrl as string) || '/';
    const redirectOrigin = `${req.protocol}://${req.get('host')}`;
    const redirectTo = `${redirectOrigin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`;

    const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (oauthErr) return error(res, 'OAUTH_ERROR', oauthErr.message, 400);
    return success(res, { url: data.url });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/auth/signout', publicRoute(), async (_req, res, next) => {
  try {
    res.clearCookie('sb-access-token');
    return success(res, { success: true });
  } catch (err) {
    next(err);
  }
});

// Centralized Express Error Handler for /api/* routes
apiRouter.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || (err.name === 'ZodError' ? 400 : 500);
  const code = err.code || (err.name === 'ZodError' ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || (err.name === 'ZodError' ? err.errors : undefined);

  if (status >= 500) {
    console.error('[API CRITICAL ERROR]:', err);
  } else if (status === 401) {
    console.warn(`[API AUTH 401]: ${message} on ${req.method} ${req.originalUrl || req.url}`);
  }

  return res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
});
