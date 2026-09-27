// ==============================================================================
// LiveStream Provider Abstraction Interface
// Decoupled architecture for WebRTC (LiveKit) & RTMP/HLS (Mux, Cloudflare, IVS)
// ==============================================================================

import { StreamProvider } from '../types/livestream';

export interface CreateStreamParams {
  title: string;
  streamId: string;
  record?: boolean;
}

export interface StreamCredentials {
  streamId: string;
  provider: StreamProvider;
  ingestUrl: string;
  streamKey: string;
  playbackUrl: string;
  webrtcToken?: string;
}

export interface LiveStreamProvider {
  readonly providerName: StreamProvider;

  /**
   * Initializes or creates a new broadcast stream on the cloud provider
   */
  createStream(params: CreateStreamParams): Promise<StreamCredentials>;

  /**
   * Starts broadcasting session
   */
  startStream(streamId: string): Promise<{ success: boolean; message?: string }>;

  /**
   * Ends broadcast and triggers server-side VOD processing
   */
  endStream(streamId: string): Promise<{
    success: boolean;
    recordingUrl?: string;
    durationSeconds?: number;
  }>;

  /**
   * Obtains live playback HLS / WebRTC URL
   */
  getPlaybackUrl(streamId: string, quality?: string): Promise<string>;

  /**
   * Retrieves active realtime viewer metric
   */
  getViewerCount(streamId: string): Promise<number>;

  /**
   * Deletes stream resource on the provider
   */
  deleteStream(streamId: string): Promise<boolean>;
}

// ------------------------------------------------------------------------------
// Mux Live Provider Implementation
// ------------------------------------------------------------------------------
export class MuxLiveProvider implements LiveStreamProvider {
  readonly providerName: StreamProvider = 'mux';

  async createStream(params: CreateStreamParams): Promise<StreamCredentials> {
    const key = `live_ph_mux_${params.streamId.substring(0, 8)}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      streamId: params.streamId,
      provider: 'mux',
      ingestUrl: 'rtmps://global-live.mux.com:443/app',
      streamKey: key,
      playbackUrl: `https://stream.mux.com/${params.streamId}.m3u8`,
    };
  }

  async startStream(_streamId: string): Promise<{ success: boolean; message?: string }> {
    return { success: true, message: 'Mux stream ready for ingest' };
  }

  async endStream(streamId: string): Promise<{
    success: boolean;
    recordingUrl?: string;
    durationSeconds?: number;
  }> {
    return {
      success: true,
      recordingUrl: `https://stream.mux.com/${streamId}/highest.mp4`,
      durationSeconds: 3600,
    };
  }

  async getPlaybackUrl(streamId: string): Promise<string> {
    return `https://stream.mux.com/${streamId}.m3u8`;
  }

  async getViewerCount(_streamId: string): Promise<number> {
    return 0; // Handled primarily through Supabase Realtime presence
  }

  async deleteStream(_streamId: string): Promise<boolean> {
    return true;
  }
}

// ------------------------------------------------------------------------------
// LiveKit WebRTC Provider Implementation (For Browser Broadcast & Low-Latency)
// ------------------------------------------------------------------------------
export class LiveKitStreamProvider implements LiveStreamProvider {
  readonly providerName: StreamProvider = 'livekit';

  async createStream(params: CreateStreamParams): Promise<StreamCredentials> {
    const key = `lk_token_${params.streamId.substring(0, 8)}`;
    return {
      streamId: params.streamId,
      provider: 'livekit',
      ingestUrl: 'wss://peacehope-livekit.cloud.livekit.io',
      streamKey: key,
      playbackUrl: `wss://peacehope-livekit.cloud.livekit.io/room/${params.streamId}`,
      webrtcToken: key,
    };
  }

  async startStream(_streamId: string): Promise<{ success: boolean; message?: string }> {
    return { success: true, message: 'LiveKit room activated' };
  }

  async endStream(_streamId: string): Promise<{
    success: boolean;
    recordingUrl?: string;
    durationSeconds?: number;
  }> {
    return { success: true };
  }

  async getPlaybackUrl(streamId: string): Promise<string> {
    return `wss://peacehope-livekit.cloud.livekit.io/room/${streamId}`;
  }

  async getViewerCount(_streamId: string): Promise<number> {
    return 0;
  }

  async deleteStream(_streamId: string): Promise<boolean> {
    return true;
  }
}

// ------------------------------------------------------------------------------
// Provider Factory
// ------------------------------------------------------------------------------
export function getStreamProvider(provider: StreamProvider): LiveStreamProvider {
  switch (provider) {
    case 'livekit':
      return new LiveKitStreamProvider();
    case 'mux':
    case 'cloudflare':
    case 'ivs':
    case 'rtmp':
    default:
      return new MuxLiveProvider();
  }
}
