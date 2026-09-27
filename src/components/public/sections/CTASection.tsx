import React from 'react';
import { Heart, Compass, Video } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';

export const CTASection: React.FC = () => {
  const { t } = useI18n();

  return (
    <section
      id="about"
      aria-label="Invitation and Fellowship Call to Action"
      className="relative py-20 sm:py-28 bg-slate-900 text-white overflow-hidden border-t border-slate-800 transition-colors"
    >
      {/* Warm ambient background aura */}
      <div className="absolute inset-0 bg-radial-to-t from-amber-950/40 via-transparent to-transparent opacity-80" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
          <Heart className="w-6 h-6 stroke-[1.5]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight max-w-2xl">
          {t('cta_title')}
        </h2>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-300 font-light max-w-2xl leading-relaxed">
          {t('cta_subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-amber-600 hover:bg-amber-500 text-slate-950 transition-all duration-200 shadow-lg shadow-amber-950/40 hover:scale-[1.02] cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{t('cta_plan_visit')}</span>
          </a>

          <a
            href="#sermons"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all duration-200 hover:scale-[1.02]"
          >
            <Video className="w-4 h-4" />
            <span>{t('cta_watch_sermons')}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
