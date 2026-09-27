import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title = 'Watch Video',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoUrl) return null;

  // Determine embed type
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('watch?v=')) {
      const id = new URL(url).searchParams.get('v');
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-2xl z-10 animate-scale-up"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 text-slate-200">
          <h3 className="font-serif text-base font-medium truncate pr-4 text-slate-100">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video dialog"
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {isYouTube || isVimeo ? (
            <iframe
              src={getEmbedUrl(videoUrl)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video streaming.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};
