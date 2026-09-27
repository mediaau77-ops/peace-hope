import React, { useState } from 'react';

interface PublicImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'hero' | 'auto';
  priority?: boolean;
  objectFit?: 'cover' | 'contain';
}

export const PublicImage: React.FC<PublicImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'video',
  priority = false,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-3/4',
    wide: 'aspect-16/10',
    hero: 'aspect-21/9 sm:aspect-16/9',
    auto: '',
  }[aspectRatio];

  if (!src || hasError) {
    return (
      <div
        className={`relative w-full ${aspectClass} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center ${containerClassName}`}
        aria-label={alt}
      >
        <span className="text-xs font-serif text-slate-400 dark:text-slate-600 tracking-wider uppercase select-none">
          Peace & Hope
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden bg-slate-100 dark:bg-slate-900 ${containerClassName}`}
    >
      {/* Subtle blur placeholder during loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-xs animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full ${
          objectFit === 'contain' ? 'object-contain' : 'object-cover'
        } transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-105 blur-xs'
        } ${className}`}
      />
    </div>
  );
};
