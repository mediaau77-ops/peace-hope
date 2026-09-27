import React, { useState } from 'react';
import { Play, Calendar, User, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicSermon } from '../../../types/public';
import { PublicImage } from '../shared/PublicImage';
import { EmptyState } from '../shared/EmptyState';
import { VideoModal } from '../shared/VideoModal';

interface LatestSermonsProps {
  sermons: PublicSermon[];
}

export const LatestSermons: React.FC<LatestSermonsProps> = ({ sermons }) => {
  const { t } = useI18n();
  const [activeSermon, setActiveSermon] = useState<PublicSermon | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      id="sermons"
      aria-label="Sermons Archive"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
              SPIRITUAL NOURISHMENT
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#11203D] dark:text-white">
              {t('sermons_heading')}
            </h2>
          </div>
          {sermons.length > 0 && (
            <a
              href="#sermons"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group"
            >
              <span>{t('sermons_view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>

        {/* Content: Cards Grid or Graceful Empty State */}
        {sermons.length === 0 ? (
          <EmptyState
            title={t('sermons_empty')}
            description="Our pastoral team regularly shares weekly biblical sermons and divine worship messages."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sermons.map((sermon) => {
              const coverImg = sermon.cover_image_url || sermon.thumbnailUrl;
              const hasVideo = Boolean(sermon.videoUrl);

              return (
                <article
                  key={sermon.id}
                  className="rounded-3xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-[#11203D]/60 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail Container */}
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => hasVideo && setActiveSermon(sermon)}
                  >
                    <PublicImage
                      src={coverImg}
                      alt={sermon.title}
                      aspectRatio="video"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Play Icon Overlay */}
                    {hasVideo && (
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <div className="w-12 h-12 rounded-full bg-[#C5A059] group-hover:bg-[#DFB15B] text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Duration Badge */}
                    {sermon.duration && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-xs text-[11px] font-medium text-slate-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{sermon.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2.5">
                      {sermon.bibleReference && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF4EA] dark:bg-amber-950/40 border border-[#F0E4D0] dark:border-amber-800/40 text-[#C5A059] text-xs font-semibold tracking-wide">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{sermon.bibleReference}</span>
                        </div>
                      )}

                      <h3
                        onClick={() => hasVideo && setActiveSermon(sermon)}
                        className={`font-serif text-xl font-bold text-[#11203D] dark:text-white leading-snug tracking-tight ${
                          hasVideo ? 'cursor-pointer hover:text-[#C5A059] transition-colors' : ''
                        }`}
                      >
                        {sermon.title}
                      </h3>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-4 border-t border-[#EAE3D9]/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sermon.speaker}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(sermon.date)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {activeSermon && activeSermon.videoUrl && (
        <VideoModal
          isOpen={Boolean(activeSermon)}
          onClose={() => setActiveSermon(null)}
          videoUrl={activeSermon.videoUrl}
          title={activeSermon.title}
        />
      )}
    </section>
  );
};
