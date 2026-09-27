import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { SearchBar } from '../SearchBar';
import { FilterBar } from '../FilterBar';
import { PublicTeaching } from '../../../types/public';
import { fetchPublicTeachings } from '../../../lib/publicQueries';

interface TeachingsPageProps {
  onSelectTeaching: (slug: string) => void;
}

export const TeachingsPage: React.FC<TeachingsPageProps> = ({ onSelectTeaching }) => {
  const [teachings, setTeachings] = useState<PublicTeaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  const categories = [
    { label: 'All Teachings', value: 'all' },
    { label: 'Biblical Study', value: 'Biblical Study' },
    { label: 'Doctrine & Prophecy', value: 'Doctrine & Prophecy' },
    { label: 'Christian Living', value: 'Christian Living' },
    { label: 'Family & Youth', value: 'Family & Youth' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicTeachings({
      page,
      limit: 9,
      category,
      search,
      sort,
    }).then((res) => {
      if (!isMounted) return;
      setTeachings(res.data);
      setTotal(res.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [page, category, search, sort]);

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <PageHero
        title="Biblical Teachings & Studies"
        subtitle="Deep dive into scripture, Adventist heritage, prophecy, and practical Christian truth for daily walk with Christ."
        badge="Discipleship"
        breadcrumbs={[{ label: 'Teachings' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search teachings by title, author, or keyword..."
            />
          </div>

          <FilterBar
            categories={categories}
            selectedCategory={category}
            onSelectCategory={(cat) => {
              setCategory(cat);
              setPage(1);
            }}
            sortOptions={sortOptions}
            selectedSort={sort}
            onSelectSort={(s) => setSort(s)}
          />
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {loading ? (
            <CardGrid columns={3}>
              <CardSkeleton count={6} />
            </CardGrid>
          ) : teachings.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No teachings found"
              message={
                search || category !== 'all'
                  ? 'Try adjusting your search criteria or category filter.'
                  : 'No teachings have been published yet. Please check back soon.'
              }
              actionText={search || category !== 'all' ? 'Reset Filters' : undefined}
              onAction={() => {
                setSearch('');
                setCategory('all');
                setPage(1);
              }}
            />
          ) : (
            <>
              <CardGrid columns={3}>
                {teachings.map((teaching) => (
                  <Card
                    key={teaching.id}
                    onClick={() => onSelectTeaching(teaching.slug || teaching.id)}
                  >
                    <div className="relative aspect-16/10 bg-slate-800 overflow-hidden">
                      {teaching.cover_image_url ? (
                        <img
                          src={teaching.cover_image_url}
                          alt={teaching.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-amber-500/30">
                          <BookOpen className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/80 text-amber-300 backdrop-blur-xs border border-amber-500/20">
                          {teaching.category || 'Teaching'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {teaching.author || 'Pastor'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {teaching.read_time || '5 min read'}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
                          {teaching.title}
                        </h3>

                        {teaching.excerpt && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 font-light leading-relaxed">
                            {teaching.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold group-hover:text-amber-500">
                        <span>Read Study</span>
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
