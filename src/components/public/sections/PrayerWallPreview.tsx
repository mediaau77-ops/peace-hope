import React, { useState, useEffect } from 'react';
import { Flame, Heart, ArrowRight, PlusCircle, Check } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicPrayerRequest } from '../../../types/public';
import { incrementPrayerAmen } from '../../../lib/publicQueries';
import { EmptyState } from '../shared/EmptyState';

interface PrayerWallPreviewProps {
  prayers: PublicPrayerRequest[];
}

export const PrayerWallPreview: React.FC<PrayerWallPreviewProps> = ({ prayers }) => {
  const { t } = useI18n();
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [localAmenCounts, setLocalAmenCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ph_prayed_requests');
      if (stored) {
        setPrayedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handlePrayForThis = async (prayerId: string, currentCount: number) => {
    if (prayedIds.has(prayerId)) return;

    // Optimistic Update
    const newPrayed = new Set(prayedIds);
    newPrayed.add(prayerId);
    setPrayedIds(newPrayed);
    localStorage.setItem('ph_prayed_requests', JSON.stringify(Array.from(newPrayed)));

    const updatedCount = (localAmenCounts[prayerId] ?? currentCount) + 1;
    setLocalAmenCounts((prev) => ({ ...prev, [prayerId]: updatedCount }));

    // Supabase RPC or Direct update
    await incrementPrayerAmen(prayerId);
  };

  return (
    <section
      id="prayer"
      aria-label="Prayer Wall Preview"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
              INTERCESSORY MINISTRY
            </span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#11203D] dark:text-white">
              {t('prayer_heading')}
            </h2>
          </div>
          {prayers.length > 0 && (
            <a
              href="#prayer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group"
            >
              <span>{t('prayer_pray_for_others')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>

        {/* Content: Cards Grid or Graceful Empty State */}
        {prayers.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No prayer requests shared yet"
            description={t('prayer_empty')}
            actionText={t('prayer_submit_yours')}
            actionHref="#prayer"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {prayers.map((prayer) => {
              const hasPrayed = prayedIds.has(prayer.id);
              const totalAmens =
                localAmenCounts[prayer.id] ?? (prayer.amenCount || prayer.candleCount || 0);

              const text = prayer.requestText || '';
              const truncatedText =
                text.length > 150 ? text.slice(0, 150).trim() + '...' : text;

              return (
                <div
                  key={prayer.id}
                  className="rounded-3xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-[#11203D]/60 p-6 flex flex-col justify-between space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Header with candle/amen badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#11203D] dark:text-slate-200 truncate">
                        {prayer.isAnonymous ? 'Anonymous' : prayer.authorName || 'Church Family'}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-[#C5A059]">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{totalAmens}</span>
                      </div>
                    </div>

                    {/* Prayer text quote */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed italic">
                      "{truncatedText}"
                    </p>
                  </div>

                  {/* Interactive Pray for this Button */}
                  <div className="pt-3 border-t border-[#EAE3D9]/60 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handlePrayForThis(prayer.id, prayer.amenCount || 0)}
                      disabled={hasPrayed}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        hasPrayed
                          ? 'bg-[#FAF4EA] text-[#C5A059] border border-[#F0E4D0]'
                          : 'bg-[#11203D] hover:bg-[#1A2E56] text-white shadow-xs hover:scale-[1.02]'
                      }`}
                    >
                      {hasPrayed ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>{t('prayer_amen_voiced')}</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-3.5 h-3.5 text-[#DFB15B]" />
                          <span>I'm Praying (Amen)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
