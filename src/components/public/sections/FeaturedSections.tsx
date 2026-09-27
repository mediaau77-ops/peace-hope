import React, { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';
import { PublicHomepageSection } from '../../../types/public';
import { PublicImage } from '../shared/PublicImage';
import { VideoModal } from '../shared/VideoModal';

interface FeaturedSectionsProps {
  sections: PublicHomepageSection[];
}

export const FeaturedSections: React.FC<FeaturedSectionsProps> = ({ sections }) => {
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // If no sections exist, hide the section entirely (never show an empty block)
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Featured Ministries"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {sections.map((section, index) => {
          const isReverse = index % 2 !== 0;
          const imageUrl = section.cover_image_url || section.media_url;
          const hasVideo = section.media_url && (section.media_url.includes('youtube') || section.media_url.endsWith('.mp4'));

          return (
            <div
              key={section.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center ${
                isReverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Visual Element (Image or Video Thumbnail) */}
              <div
                className={`lg:col-span-6 ${
                  isReverse ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="relative rounded-3xl overflow-hidden border border-[#EAE3D9] dark:border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.06)] group">
                  <PublicImage
                    src={imageUrl}
                    alt={section.title}
                    aspectRatio="wide"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Video Play Button Overlay */}
                  {hasVideo && section.media_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveVideo({
                          url: section.media_url!,
                          title: section.title,
                        })
                      }
                      aria-label={`Play presentation for ${section.title}`}
                      className="absolute inset-0 bg-black/40 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer group/btn"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#C5A059] hover:bg-[#DFB15B] text-slate-950 flex items-center justify-center shadow-xl group-hover/btn:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Text Narrative */}
              <div
                className={`lg:col-span-6 space-y-4 sm:space-y-6 ${
                  isReverse ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                {section.subtitle && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
                    {section.subtitle}
                  </span>
                )}
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#11203D] dark:text-white leading-tight">
                  {section.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                  {section.description}
                </p>

                {section.link_url && (
                  <div className="pt-2">
                    <a
                      href={section.link_url}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group/link"
                    >
                      <span>Explore this ministry</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeVideo && (
        <VideoModal
          isOpen={Boolean(activeVideo)}
          onClose={() => setActiveVideo(null)}
          videoUrl={activeVideo.url}
          title={activeVideo.title}
        />
      )}
    </section>
  );
};
