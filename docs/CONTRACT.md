# Peace & Hope Contract Inventory

This document is the frozen migration contract for the web application. The purpose of the split is to keep the same URLs, API shapes, events, and behavior while moving the runtime boundary to Express in JavaScript and the UI to Next.js in TypeScript.

## Public routes

- `/`
- `/teachings`
- `/teachings/[slug]`
- `/sermons`
- `/sermons/[slug]`
- `/devotionals`
- `/devotionals/[slug]`
- `/events`
- `/events/[slug]`
- `/prayer`
- `/testimonies`
- `/testimonies/[slug]`
- `/bible`
- `/bible/[translation]/[book]/[chapter]`
- `/live-worship`
- `/meet`
- `/meet/[id]`
- `/chat`
- `/chat/[roomId]`
- `/announcements`
- `/announcements/[slug]`
- `/about`
- `/contact`
- `/give`
- `/auth/*`
- `/profile`
- `/notifications`
- `/search`
- `/not-found`
- `/error`
- `/loading`

## Admin routes

- `/dashboard`
- `/dashboard/homepage`
- `/dashboard/teachings`
- `/dashboard/sermons`
- `/dashboard/devotionals`
- `/dashboard/prayer`
- `/dashboard/testimonies`
- `/dashboard/events`
- `/dashboard/announcements`
- `/dashboard/livestreams`
- `/dashboard/live-studio`
- `/dashboard/chat`
- `/dashboard/meetings`
- `/dashboard/users`
- `/dashboard/settings`
- `/dashboard/audit-log`
- `/auth/admin-login`

## API endpoints

- `/api/livestreams/active`
- `/api/livestreams/:id`
- `/api/livestreams/:id/chat`
- `/api/livestreams/:id/start`
- `/api/livestreams/:id/pause`
- `/api/livestreams/:id/end`
- `/api/prayer/:id/amen`
- `/api/settings/public`
- `/api/theme`
- `/api/sermons`
- `/api/teachings`
- `/api/devotionals`
- `/api/events`
- `/api/testimonies`
- `/api/bible/*`
- `/api/meetings/*`
- `/api/users/me`
- `/api/notifications`
- `/api/contact`
- `/api/newsletter`
- `/api/auth/google`
- `/api/auth/callback`
- `/api/admin/*`
- `/api/realtime/public`
- `/api/realtime/livestream/:id`

## Realtime payload contract

- `event: status`
- `event: chat`
- `event: reaction`
- `event: overlay`
- `event: presence`

## Shared types and validation

- Domain and response contracts remain in the shared layer.
- Request validation remains done at the backend boundary.
- Response envelopes preserve `{ ok: true, data }` and `{ ok: false, error }`.
- All Supabase calls stay in the backend only.

## Visual contract

- Light theme remains default.
- Current colors, spacing scale, typography, and layout structure remain unchanged.
- Hidden admin access remains the 15-second logo hold.
- Google sign-in and live-stream behavior remain unchanged.
