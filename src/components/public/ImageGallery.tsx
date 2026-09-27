import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GalleryImage {
  url: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') setSelectedIndex((selectedIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-xs hover:shadow-md transition-all"
          >
            <img
              src={img.url}
              alt={img.caption || `Gallery photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-white truncate">
                {img.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close Lightbox"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedIndex((selectedIndex - 1 + images.length) % images.length)}
              aria-label="Previous Image"
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image Display */}
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={images[selectedIndex].url}
              alt={images[selectedIndex].caption || 'Enlarged photo'}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            {images[selectedIndex].caption && (
              <p className="mt-3 text-sm text-slate-300 text-center font-light">
                {images[selectedIndex].caption}
              </p>
            )}
            <span className="mt-1 text-xs text-slate-500">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setSelectedIndex((selectedIndex + 1) % images.length)}
              aria-label="Next Image"
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
