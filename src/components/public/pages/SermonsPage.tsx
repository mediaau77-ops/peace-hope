import React, { useState, useEffect } from 'react';
import { PlayCircle, Calendar, User, Clock, Search, ArrowRight, Video } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { SearchBar } from '../SearchBar';
import { FilterBar } from '../FilterBar';
import { PublicSermon } from '../../../types/public';
import { fetchPublicSermonsList } from '../../../lib/publicQueries';

interface SermonsPageProps {
  onSelectSermon: (slug: string) => void;
}

export const SermonsPage: React.FC<SermonsPageProps> = ({ onSelectSermon }) => {
  const [sermons, setSermons] = useState<PublicSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [speaker, setSpeaker] = useState('all');

  const speakerOptions = [
    { label: 'All Preachers', value: 'all' },
    { label: 'Senior Pastor', value: 'Senior Pastor' },
    { label: 'Associate Pastor', value: 'Associate Pastor' },
    { label: 'Guest Speaker', value: 'Guest Speaker' },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicSermonsList({
      page,
      limit: 9,
      speaker,
      search,
    }).then((res) => {
      if (!isMounted) return;
      setSermons(res.data);
      setTotal(res.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [page, speaker, search]);

  const totalPages = Math.ceil(total / 9) || 1;

  // Top featured sermon is the first sermon
  const featured = sermons.length > 0 && page === 1 && !search ? sermons[0] : null;
  const listItems = featured ? sermons.slice(1) : sermons;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Sermons & Messages"
        subtitle="Watch and listen to uplifting Christ-centered messages, prophetic truth, and practical Christian wisdom."
        badge="Worship & Word"
        breadcrumbs={[{ label: 'Sermons' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search sermons by title, scripture, or preacher..."
            />
          </div>

          <FilterBar
            categories={speakerOptions}
            selectedCategory={speaker}
            onSelectCategory={(s) => {
              setSpeaker(s);
              setPage(1);
            }}
          />
        </div>

        {/* Featured Sermon Hero Card */}
        {featured && (
          <div
            onClick={() => onSelectSermon(featured.id)}
            className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl cursor-pointer grid grid-cols-1 lg:grid-cols-12 hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto min-h-[280px] bg-slate-950 overflow-hidden">
              {featured.thumbnailUrl || featured.cover_image_url ? (
                <img
                  src={featured.thumbnailUrl || featured.cover_image_url}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center text-amber-500/40">
                  <Video className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 fill-current" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Latest Message
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {featured.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    {featured.speaker}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {featured.date ? new Date(featured.date).toLocaleDateString() : 'Recent'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {featured.duration || '45m'}
                  </span>
                </div>

                {featured.bibleReference && (
                  <p className="text-xs font-serif text-amber-400/90 italic">
                    Scripture: {featured.bibleReference}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>Watch Full Sermon</span>
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* Sermon Grid */}
        <div className="space-y-6">
          {loading ? (
            <CardGrid columns={3}>
              <CardSkeleton count={6} />
            </CardGrid>
          ) : sermons.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No sermons found"
              message={
                search
                  ? `No sermons matching "${search}". Please try another keyword.`
                  : 'No sermons have been published yet. Please check back later.'
              }
              actionText={search ? 'Clear Search' : undefined}
              onAction={() => setSearch('')}
            />
          ) : (
            <>
              <CardGrid columns={3}>
                {listItems.map((sermon) => (
                  <Card key={sermon.id} onClick={() => onSelectSermon(sermon.id)}>
                    <div className="relative aspect-16/10 bg-slate-900 overflow-hidden group/thumb">
                      {sermon.thumbnailUrl || sermon.cover_image_url ? (
                        <img
                          src={sermon.thumbnailUrl || sermon.cover_image_url}
                          alt={sermon.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-amber-500/30">
                          <Video className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                      {sermon.duration && (
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950/80 text-white backdrop-blur-xs">
                          {sermon.duration}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            {sermon.speaker}
                          </span>
                          <span>
                            {sermon.date ? new Date(sermon.date).toLocaleDateString() : ''}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 transition-colors">
                          {sermon.title}
                        </h4>

                        {sermon.bibleReference && (
                          <span className="inline-block text-xs font-serif text-amber-700 dark:text-amber-300/90 italic">
                            {sermon.bibleReference}
                          </span>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <span>Watch Message</span>
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
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
