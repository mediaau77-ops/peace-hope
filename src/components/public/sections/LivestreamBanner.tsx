import React from 'react';
import { Radio, Users, Play, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicLivestream } from '../../../types/public';

interface LivestreamBannerProps {
  livestream?: PublicLivestream | null;
}

export const LivestreamBanner: React.FC<LivestreamBannerProps> = ({ livestream }) => {
  const { t } = useI18n();

  // If no stream is live, do not show this section at all
  if (!livestream || livestream.status !== 'live') {
    return null;
  }

  return (
    <section
      id="livestream"
      aria-label="Live Broadcast"
      className="relative w-full bg-linear-to-r from-rose-950 via-slate-950 to-slate-900 border-y border-rose-900/40 text-white py-6 sm:py-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Pulsing Live Indicator and Title */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative flex h-4 w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600" />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-black uppercase tracking-wider text-white">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>LIVE BROADCAST</span>
                </span>

                {(livestream.viewersCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-300 font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{livestream.viewersCount} watching</span>
                  </span>
                )}
              </div>

              <h2 className="mt-1.5 font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                {livestream.title}
              </h2>
              <p className="text-xs text-slate-300 font-light mt-0.5">
                {t('live_banner_subtitle')}
              </p>
            </div>
          </div>

          {/* Right: Join / Watch CTA */}
          <div className="shrink-0 w-full md:w-auto">
            <a
              href="#livestream"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-950 hover:bg-amber-300 transition-all shadow-lg hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
              <span>{t('live_banner_join')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
