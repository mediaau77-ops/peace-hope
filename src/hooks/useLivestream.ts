/**
 * 3-Tier Architecture Hook Adapter:
 * Delegates strictly to backend API endpoints and Server-Sent Events (SSE).
 * The client bundle NEVER initializes or imports Supabase directly.
 */
export {
  useLivestream,
  useLivestreamPresence,
  useLivestreamChat,
  useLivestreamReactions,
  useLivestreamOverlays,
} from './useLivestreamRealtime';
