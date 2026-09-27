# Live Worship Streaming Infrastructure Setup

## Overview
The Live Worship Streaming platform provides end-to-end broadcast management for Seventh-day Adventist digital ministry. It unites browser broadcasting, external hardware/OBS RTMP encoders, Supabase Realtime synchronization, HLS.js adaptive player, and interactive fellowship chat.

---

## 1. Supabase Environment Setup
Add these tables and storage buckets using `/supabase/migrations/20260923_livestream_system.sql`:

- `livestreams`: Primary metadata (status, ingest URL, playback HLS URL, stream key).
- `livestream_chat`: Real-time fellowship messages with anti-spam rate limiting.
- `livestream_reactions`: Real-time praise emojis (❤️, 🙏, 👍, 🔥, 🎉).
- `livestream_viewers`: Session logging and viewer presence tracking.
- `livestream_reminders`: Email subscriptions for upcoming broadcasts.
- `livestream_overlays`: Real-time push-to-screen Bible verses, announcements, and lower-thirds.
- `livestream_recordings`: Archived broadcast recordings published to Sermon library.
- `livestream_moderation`: Audit log for administrative chat actions (delete, pin, slow-mode).

### Required Storage Buckets
- `livestream-covers` (Public)
- `livestream-recordings` (Public)
- `livestream-chat-attachments` (Public)
- `livestream-thumbnails` (Public)

---

## 2. Ingest & Video Providers Configuration
The architecture includes provider abstractions in `/src/lib/streamProviders.ts`:

### A. Mux Live (Recommended for RTMP/HLS)
- **Ingest Server URL**: `rtmps://global-live.mux.com:443/app`
- **Stream Key**: Auto-generated in admin dashboard (`live_ph_mux_*`)
- **Playback URL**: `https://stream.mux.com/{STREAM_ID}.m3u8`

### B. LiveKit (Recommended for Interactive WebRTC)
- **Ingest WebSocket**: `wss://peacehope-livekit.cloud.livekit.io`
- Supports co-hosts, browser mic, camera, and display/screen capture.

---

## 3. Realtime Channel Topology
All channels adhere to the singleton discipline:
1. `livestream-status-{streamId}-{uuid}`: Subscribes to broadcast state changes (`draft` → `scheduled` → `live` → `ended`).
2. `livestream-chat-{streamId}-{uuid}`: Subscribes to chat insertions and updates with local deduplication.
3. `livestream-presence-{streamId}-{uuid}`: Uses Supabase Realtime Presence to track active viewer count without polling.
4. `livestream-reactions-{streamId}-{uuid}`: Listens to incoming emoji reactions and triggers floating animations.
5. `livestream-overlay-{streamId}-{uuid}`: Receives scripture verses and lower-thirds pushed by pastor/admin.
