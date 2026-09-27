import React from 'react';
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicBibleVerse } from '../../../types/public';

interface VerseOfTheDayProps {
  verse?: PublicBibleVerse | null;
}

export const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({ verse }) => {
  const { t } = useI18n();

  // If no verse is configured or available in Supabase, hide section gracefully
  if (!verse) {
    return null;
  }

  return (
    <section
      id="bible"
      aria-label="Bible Verse of the Day"
      className="relative py-20 sm:py-28 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 overflow-hidden transition-colors"
    >
      {/* Subtle warm illumination */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(197,160,89,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(197,160,89,0.12),rgba(0,0,0,0))]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Kicker */}
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#C5A059] mb-4 block">
          {t('verse_heading')}
        </span>

        {/* Large Centered Typographic Treatment */}
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-[#11203D] dark:text-slate-100 leading-[1.35] tracking-tight text-balance max-w-3xl">
          "{verse.verse_text}"
        </blockquote>

        {/* Reference & Translation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base font-semibold text-[#C5A059]">
          <span>{verse.reference}</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            ({verse.translation_name})
          </span>
        </div>

        {/* Link to Bible */}
        <div className="mt-8">
          <a
            href={`#bible?book=${encodeURIComponent(verse.book_name)}&chapter=${verse.chapter_number}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide bg-[#11203D] hover:bg-[#1A2E56] text-white shadow-xs hover:scale-102 transition-all cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-[#C5A059]" />
            <span>{t('verse_read_in_bible')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
