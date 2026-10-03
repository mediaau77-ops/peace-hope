import type { ChatMessage, Overlay } from './domain';

export type LivestreamEvent =
  | { type: 'status'; status: 'live' | 'paused' | 'ended' }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'reaction'; emoji: string; count: number }
  | { type: 'overlay'; overlay: Overlay }
  | { type: 'presence'; viewers: number };

export type RealtimeEvent = LivestreamEvent;
