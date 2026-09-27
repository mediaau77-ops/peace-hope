import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Radio,
  PictureInPicture,
  RotateCcw,
} from 'lucide-react';

interface StreamVideoPlayerProps {
  playbackUrl?: string | null;
  posterUrl?: string | null;
  isLive?: boolean;
  lowLatency?: boolean;
  onViewerAction?: () => void;
  floatingEmojis?: { id: string; emoji: string; left: number }[];
  overlayContent?: React.ReactNode;
}

export const StreamVideoPlayer: React.FC<StreamVideoPlayerProps> = ({
  playbackUrl,
  posterUrl,
  isLive = true,
  floatingEmojis = [],
  overlayContent,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; label: string }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = auto
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Target URL strictly comes from the live row's playback_url
  const targetUrl = playbackUrl?.trim() || '';

  // If playback_url is null or empty, show waiting state — no fallback video
  if (!targetUrl) {
    return (
      <div className="relative aspect-video w-full bg-slate-950 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mb-4" />
        <h3 className="font-serif font-bold text-lg sm:text-xl text-amber-300">
          The stream is starting. Please wait.
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
          Connecting to the sanctuary broadcast feed. Player will begin automatically as soon as the signal connects.
        </p>
      </div>
    );
  }

  // Initialize HLS.js or native HTML5 video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !targetUrl) return;

    setHasError(false);
    setIsBuffering(true);

    const isHlsUrl =
      targetUrl.includes('.m3u8') ||
      targetUrl.includes('mux.com') ||
      targetUrl.includes('cloudflarestream');

    if (isHlsUrl && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 20,
        maxMaxBufferLength: 40,
      });
      hlsRef.current = hls;

      hls.loadSource(targetUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsBuffering(false);
        const levels = data.levels.map((lvl, idx) => ({
          id: idx,
          label: lvl.height ? `${lvl.height}p` : `Level ${idx + 1}`,
        }));
        setQualityLevels(levels);

        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setIsPlaying(false));
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setSelectedQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasError(true);
              setErrorMessage('Live stream connection lost. Reconnecting...');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari iOS/macOS HLS playback
      video.src = targetUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setIsPlaying(false));
        });
      });
    } else {
      video.src = targetUrl;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [targetUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol > 0 && video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.debug('Picture-in-picture error:', err);
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setSelectedQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full bg-black overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl select-none group border border-slate-900"
    >
      <video
        ref={videoRef}
        src={targetUrl}
        poster={posterUrl || undefined}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Floating Reactions across player */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.left}%` }}
            className="absolute bottom-6 text-3xl sm:text-4xl animate-float-reaction opacity-0 transform -translate-x-1/2"
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Live Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {isLive ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold tracking-wide shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE WORSHIP</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-medium backdrop-blur-md border border-slate-700">
            <span>RECORDED</span>
          </div>
        )}
      </div>

      {/* Active Overlay (Top / Lower-Third from Admin) */}
      {overlayContent && (
        <div className="absolute inset-x-4 bottom-16 sm:bottom-20 z-20 pointer-events-none flex justify-center">
          <div className="max-w-2xl w-full pointer-events-auto transform transition-all duration-500 ease-out animate-fade-in-up">
            {overlayContent}
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error / Recovery State */}
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 text-white p-6 text-center space-y-4">
          <p className="text-sm sm:text-base text-slate-200">{errorMessage}</p>
          <button
            onClick={() => {
              setHasError(false);
              if (hlsRef.current) hlsRef.current.startLoad();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#b4832e] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Cinematic Controls Bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
            className="text-white hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />}
          </button>

          <div className="flex items-center gap-2 group/volume">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-white hover:text-[#C5A059] transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#C5A059] h-1 bg-white/30 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {qualityLevels.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="text-white hover:text-[#C5A059] transition-colors flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>
                  {selectedQuality === -1
                    ? 'Auto'
                    : qualityLevels.find((q) => q.id === selectedQuality)?.label || 'Quality'}
                </span>
              </button>

              {showQualityMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 text-xs text-white z-40">
                  <button
                    type="button"
                    onClick={() => handleQualityChange(-1)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-white/10 ${
                      selectedQuality === -1 ? 'text-[#C5A059] font-bold' : ''
                    }`}
                  >
                    Auto (Adaptive)
                  </button>
                  {qualityLevels.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleQualityChange(lvl.id)}
                      className={`w-full text-left px-3 py-1.5 hover:bg-white/10 ${
                        selectedQuality === lvl.id ? 'text-[#C5A059] font-bold' : ''
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={togglePictureInPicture}
            aria-label="Picture in picture"
            className="text-white hover:text-[#C5A059] transition-colors hidden sm:block cursor-pointer"
          >
            <PictureInPicture className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="text-white hover:text-[#C5A059] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
