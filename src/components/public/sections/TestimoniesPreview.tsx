import React from 'react';
import { Quote, User, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicTestimony } from '../../../types/public';
import { PublicImage } from '../shared/PublicImage';

interface TestimoniesPreviewProps {
  testimonies: PublicTestimony[];
}

export const TestimoniesPreview: React.FC<TestimoniesPreviewProps> = ({ testimonies }) => {
  const { t } = useI18n();

  // If empty, hide the section gracefully
  if (!testimonies || testimonies.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Testimonies and Stories of Hope"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
              GRACE IN ACTION
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#11203D] dark:text-white">
              {t('testimonies_heading')}
            </h2>
          </div>
          <a
            href="#testimonies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group"
          >
            <span>{t('testimonies_view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Testimonies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonies.map((item) => {
            const photoUrl = item.cover_image_url || item.mediaUrl;
            const storyText = item.story || '';
            const truncatedStory =
              storyText.length > 200 ? storyText.slice(0, 200).trim() + '...' : storyText;

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-[#11203D]/60 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] transition-all duration-300"
              >
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-[#C5A059]/40 shrink-0" />
                  <h3 className="font-serif text-lg font-bold text-[#11203D] dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed italic">
                    "{truncatedStory}"
                  </p>
                </div>

                {/* Author Details with Optional Photo */}
                <div className="pt-4 border-t border-[#EAE3D9]/60 dark:border-slate-800/80 flex items-center gap-3">
                  {photoUrl ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#C5A059]">
                      <PublicImage
                        src={photoUrl}
                        alt={item.authorName || 'Testimony Author'}
                        aspectRatio="square"
                        containerClassName="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FAF4EA] text-[#C5A059] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-semibold text-[#11203D] dark:text-white">
                      {item.authorName}
                    </h4>
                    {item.location && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
