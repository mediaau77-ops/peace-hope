import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  url?: string;
  poster?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  poster,
  title = 'Video Player',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url) {
    return (
      <div className={`w-full aspect-16/9 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 ${className}`}>
        <span>No video available</span>
      </div>
    );
  }

  // Detect YouTube
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <div className={`relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 shadow-md ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Native HTML5 Video
  return (
    <div className={`relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 shadow-md group ${className}`}>
      <video
        src={url}
        poster={poster}
        controls
        playsInline
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>

      {!isPlaying && poster && (
        <div
          onClick={() => {
            setIsPlaying(true);
            const video = document.querySelector('video');
            video?.play();
          }}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] cursor-pointer group-hover:bg-slate-950/20 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};
