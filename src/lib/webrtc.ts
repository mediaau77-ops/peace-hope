/**
 * WebRTC Media & Signaling Engine
 * Voice calls, video conferences, and screen sharing
 * Peace & Hope SDA Platform
 */

import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PeerStreamInfo {
  peerId: string;
  userName: string;
  stream: MediaStream;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

export type WebRTCEventType =
  | 'peer_joined'
  | 'peer_left'
  | 'remote_stream'
  | 'track_toggle'
  | 'connection_state';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCManager {
  private roomId: string;
  private localUserId: string;
  private localUserName: string;
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, PeerStreamInfo>();
  private channel: RealtimeChannel | null = null;
  private listeners = new Map<WebRTCEventType, Set<(...args: any[]) => void>>();

  constructor(roomId: string, localUserId: string, localUserName: string) {
    this.roomId = roomId;
    this.localUserId = localUserId;
    this.localUserName = localUserName;
  }

  public on(event: WebRTCEventType, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: WebRTCEventType, ...args: any[]) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(...args);
      } catch (err) {
        console.debug('Error in WebRTC event listener:', err);
      }
    });
  }

  /**
   * Initialize local camera and microphone stream
   */
  public async startLocalMedia(options: { video?: boolean; audio?: boolean } = {}): Promise<MediaStream | null> {
    const wantVideo = options.video !== false;
    const wantAudio = options.audio !== false;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: wantVideo
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
              }
            : false,
          audio: wantAudio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            : false,
        });
      }
    } catch (err) {
      console.warn('getUserMedia failed, falling back to simulated stream:', err);
      this.localStream = this.createFallbackCanvasStream();
    }

    return this.localStream;
  }

  /**
   * Start screen sharing
   */
  public async startScreenShare(): Promise<MediaStream | null> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Replace video track on all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
          this.peerConnections.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });

          videoTrack.onended = () => {
            this.revertToCameraTrack();
          };
        }

        return screenStream;
      }
    } catch (err) {
      console.warn('Screen share failed:', err);
    }
    return null;
  }

  public revertToCameraTrack() {
    if (!this.localStream) return;
    const cameraVideoTrack = this.localStream.getVideoTracks()[0];
    if (cameraVideoTrack) {
      this.peerConnections.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraVideoTrack);
        }
      });
    }
  }

  public toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
      this.broadcastSignal('track_state', {
        userId: this.localUserId,
        kind: 'audio',
        enabled,
      });
    }
  }

  public toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => {
        t.enabled = enabled;
      });
      this.broadcastSignal('track_state', {
        userId: this.localUserId,
        kind: 'video',
        enabled,
      });
    }
  }

  /**
   * Connect to signaling channel via Supabase Realtime
   */
  public connectSignaling() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channelName = `webrtc-room-${this.roomId}`;
    this.channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    this.channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        if (!payload || payload.senderId === this.localUserId) return;
        await this.handleIncomingSignal(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Announce presence to room peers
          this.broadcastSignal('join', {
            senderId: this.localUserId,
            userName: this.localUserName,
          });
        }
      });
  }

  private broadcastSignal(action: string, data: any) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: {
          action,
          senderId: this.localUserId,
          userName: this.localUserName,
          data,
        },
      });
    }
  }

  private async handleIncomingSignal(payload: any) {
    const { action, senderId, userName, data } = payload;

    switch (action) {
      case 'join':
        this.emit('peer_joined', { peerId: senderId, userName });
        // Create offer to the newly joined peer
        await this.initiatePeerConnection(senderId, userName, true);
        break;

      case 'offer':
        await this.initiatePeerConnection(senderId, userName, false);
        const pc = this.peerConnections.get(senderId);
        if (pc && data.offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          this.broadcastSignal('answer', { targetId: senderId, answer });
        }
        break;

      case 'answer':
        if (data.targetId === this.localUserId) {
          const targetPc = this.peerConnections.get(senderId);
          if (targetPc && data.answer) {
            await targetPc.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        }
        break;

      case 'candidate':
        if (data.targetId === this.localUserId) {
          const candidatePc = this.peerConnections.get(senderId);
          if (candidatePc && data.candidate) {
            try {
              await candidatePc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
              console.debug('Error adding ice candidate:', err);
            }
          }
        }
        break;

      case 'leave':
        this.closePeer(senderId);
        this.emit('peer_left', senderId);
        break;

      case 'track_state':
        this.emit('track_toggle', data);
        break;
    }
  }

  private async initiatePeerConnection(peerId: string, peerName: string, isInitiator: boolean) {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(peerId, pc);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.broadcastSignal('candidate', {
          targetId: peerId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        const info: PeerStreamInfo = {
          peerId,
          userName: peerName,
          stream: remoteStream,
          isAudioMuted: false,
          isVideoMuted: false,
        };
        this.remoteStreams.set(peerId, info);
        this.emit('remote_stream', info);
      }
    };

    pc.onconnectionstatechange = () => {
      this.emit('connection_state', { peerId, state: pc.connectionState });
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.closePeer(peerId);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.broadcastSignal('offer', { offer });
    }

    return pc;
  }

  private closePeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
    this.remoteStreams.delete(peerId);
  }

  public disconnect() {
    this.broadcastSignal('leave', { senderId: this.localUserId });

    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }

    if (this.channel) {
      const supabase = getSupabaseClient();
      supabase?.removeChannel(this.channel).catch(() => {});
      this.channel = null;
    }

    this.listeners.clear();
  }

  /**
   * Fallback stream with colored initials for environments without real webcams
   */
  private createFallbackCanvasStream(): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#C5A059';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.localUserName || 'Peace & Hope', 320, 240);
    }
    const stream = canvas.captureStream ? canvas.captureStream(15) : new MediaStream();
    return stream;
  }
}
