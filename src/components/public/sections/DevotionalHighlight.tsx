import React from 'react';
import { BookOpen, Calendar, ArrowRight, Quote } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicDevotional } from '../../../types/public';
import { PublicImage } from '../shared/PublicImage';

interface DevotionalHighlightProps {
  devotional?: PublicDevotional | null;
}

export const DevotionalHighlight: React.FC<DevotionalHighlightProps> = ({ devotional }) => {
  const { t } = useI18n();

  // If table is completely empty, hide the section gracefully
  if (!devotional) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const coverImg = devotional.cover_image_url || devotional.imageUrl;

  // Truncate meditation to first 2-3 sentences
  const excerpt = devotional.meditation
    ? devotional.meditation
        .replace(/<[^>]*>?/gm, '')
        .split(/(?<=[.?!])\s+/)
        .slice(0, 3)
        .join(' ')
    : '';

  return (
    <section
      id="devotional"
      aria-label="Daily Devotional"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-[#11203D]/60 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            {/* Optional Cover Image (Image Left) */}
            {coverImg && (
              <div className="md:col-span-5 relative bg-slate-900 min-h-[260px] md:min-h-full">
                <PublicImage
                  src={coverImg}
                  alt={devotional.title}
                  aspectRatio="auto"
                  className="h-full object-cover"
                  containerClassName="h-full"
                />
              </div>
            )}

            {/* Devotional Text (Text Right / Full width if no image) */}
            <div
              className={`${
                coverImg ? 'md:col-span-7' : 'md:col-span-12'
              } p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-4">
                {/* Header Tag + Date */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EA] dark:bg-amber-950/40 border border-[#F0E4D0] dark:border-amber-800/40 text-[#C5A059] text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t('devotional_heading')}</span>
                  </div>
                  {devotional.date && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(devotional.date)}</span>
                    </div>
                  )}
                </div>

                {/* Devotional Title */}
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#11203D] dark:text-white leading-tight">
                  {devotional.title}
                </h3>

                {/* Scripture Verse Quote (Framed / Italic) */}
                {(devotional.verseText || devotional.verseReference) && (
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#0D182E]/60 border border-[#F3E5CD] dark:border-amber-800/30 my-3">
                    <Quote className="w-6 h-6 text-[#C5A059]/30 absolute top-3 left-3" />
                    <blockquote className="pl-6 italic font-serif text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                      "{devotional.verseText || 'Thy word is a lamp unto my feet, and a light unto my path.'}"
                    </blockquote>
                    {devotional.verseReference && (
                      <div className="mt-2 text-right text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                        — {devotional.verseReference}
                      </div>
                    )}
                  </div>
                )}

                {/* Meditation Excerpt */}
                {excerpt && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                    {excerpt}
                  </p>
                )}
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <a
                  href="#devotionals"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group"
                >
                  <span>{t('devotional_read_more')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
