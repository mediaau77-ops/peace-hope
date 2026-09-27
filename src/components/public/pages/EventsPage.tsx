import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { SearchBar } from '../SearchBar';
import { PublicEvent } from '../../../types/public';
import { fetchPublicEventsList } from '../../../lib/publicQueries';

interface EventsPageProps {
  onSelectEvent: (slug: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onSelectEvent }) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicEventsList({
      tab,
      search,
      page,
      limit: 9,
    }).then((res) => {
      if (!isMounted) return;
      setEvents(res.data);
      setTotal(res.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [tab, search, page]);

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Church Events & Gatherings"
        subtitle="Join our fellowship for divine worship, prayer vigils, youth conferences, and community outreach."
        badge="Community Life"
        breadcrumbs={[{ label: 'Events' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => {
                setTab('upcoming');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'upcoming'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('past');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'past'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Past Archives
            </button>
          </div>

          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search events by name, location..."
          />
        </div>

        {/* Events Grid */}
        <div className="space-y-6">
          {loading ? (
            <CardGrid columns={3}>
              <CardSkeleton count={6} />
            </CardGrid>
          ) : events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={tab === 'upcoming' ? 'No upcoming events scheduled' : 'No past events found'}
              message={
                tab === 'upcoming'
                  ? 'There are currently no scheduled events. Check back soon for announcements!'
                  : 'No archived events found.'
              }
            />
          ) : (
            <>
              <CardGrid columns={3}>
                {events.map((event) => (
                  <Card key={event.id} onClick={() => onSelectEvent(event.id)}>
                    <div className="relative aspect-16/10 bg-slate-800 overflow-hidden">
                      {event.cover_image_url ? (
                        <img
                          src={event.cover_image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-amber-500/30">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}
                      {event.date && (
                        <div className="absolute top-3 left-3 bg-slate-900/90 text-white backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-center">
                          <span className="block text-[10px] uppercase font-bold text-amber-400">
                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                          <span className="block text-base font-bold font-mono">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{event.time || '10:00 AM'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="truncate">{event.location || 'Peace & Hope Sanctuary'}</span>
                          </div>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
                          {event.title}
                        </h3>

                        {event.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <span>{event.registrationRequired ? 'Register to Attend' : 'View Details'}</span>
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardGrid>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
