import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = 'Audio Track',
  artist = 'Peace & Hope',
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Track Info */}
        <div className="min-w-0">
          <h4 className="font-serif text-base font-semibold text-white truncate">{title}</h4>
          <p className="text-xs text-slate-400 truncate">{artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 15);
            }}
            title="Rewind 15 seconds"
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            title="Download Audio"
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] text-slate-400 w-9 text-right font-mono">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <span className="text-[11px] text-slate-400 w-9 font-mono">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
