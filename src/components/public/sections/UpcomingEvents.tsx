import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicEvent } from '../../../types/public';
import { PublicImage } from '../shared/PublicImage';
import { EmptyState } from '../shared/EmptyState';

interface UpcomingEventsProps {
  events: PublicEvent[];
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const { t } = useI18n();

  const parseEventDate = (dateStr?: string) => {
    if (!dateStr) return { day: '01', month: 'JAN', year: '2026', full: '' };
    try {
      const d = new Date(dateStr);
      return {
        day: d.toLocaleDateString(undefined, { day: '2-digit' }),
        month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
        year: d.toLocaleDateString(undefined, { year: 'numeric' }),
        full: d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      };
    } catch {
      return { day: '01', month: 'DATE', year: '', full: dateStr };
    }
  };

  return (
    <section
      id="events"
      aria-label="Upcoming Church Events"
      className="py-16 sm:py-24 bg-[#FAF7F2] dark:bg-[#0D182E] border-b border-[#EAE3D9] dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block">
              GATHERING &amp; FELLOWSHIP
            </span>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#11203D] dark:text-white">
              {t('events_heading')}
            </h2>
          </div>
          {events.length > 0 && (
            <a
              href="#events"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C5A059] hover:text-[#A8823E] transition-colors group"
            >
              <span>{t('events_view_all')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>

        {/* Content: Event Cards or Graceful Empty State */}
        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events scheduled"
            description="Check back soon for announcements regarding upcoming camp meetings, weeks of prayer, and community outreach."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {events.map((event) => {
              const { day, month, year } = parseEventDate(event.date);
              const coverImg = event.cover_image_url || event.bannerUrl || event.imageUrl;

              return (
                <article
                  key={event.id}
                  className="rounded-3xl border border-[#EAE3D9] dark:border-slate-800 bg-white dark:bg-[#11203D]/60 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] transition-all duration-300 flex flex-col group"
                >
                  {/* Optional Image */}
                  {coverImg && (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <PublicImage
                        src={coverImg}
                        alt={event.title}
                        aspectRatio="video"
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Card Content with Prominent Date Block */}
                  <div className="p-5 sm:p-6 flex flex-1 items-start gap-4">
                    {/* Date Block */}
                    <div className="shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 h-16 sm:h-18 rounded-2xl bg-[#FAF4EA] dark:bg-amber-950/40 border border-[#F0E4D0] dark:border-amber-800/40 text-center p-1.5">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C5A059]">
                        {month}
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-[#11203D] dark:text-white leading-none">
                        {day}
                      </span>
                      <span className="text-[9px] text-slate-400 leading-tight">{year}</span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-2.5">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#11203D] dark:text-white leading-snug group-hover:text-[#C5A059] transition-colors">
                        {event.title}
                      </h3>

                      {event.theme && (
                        <p className="text-xs text-[#C5A059] font-medium italic">
                          Theme: "{event.theme}"
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      {event.registrationRequired && (
                        <div className="pt-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#11203D] text-white">
                            Registration Required
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
