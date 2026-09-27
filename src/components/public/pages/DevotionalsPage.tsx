import React, { useState, useEffect } from 'react';
import { Sun, Calendar, BookOpen, ArrowRight, Quote } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { PublicDevotional } from '../../../types/public';
import { fetchPublicDevotionalsList } from '../../../lib/publicQueries';

interface DevotionalsPageProps {
  onSelectDevotional: (slug: string) => void;
}

export const DevotionalsPage: React.FC<DevotionalsPageProps> = ({ onSelectDevotional }) => {
  const [devotionals, setDevotionals] = useState<PublicDevotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicDevotionalsList({
      page,
      limit: 9,
    }).then((res) => {
      if (!isMounted) return;
      setDevotionals(res.data);
      setTotal(res.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [page]);

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Daily Devotionals"
        subtitle="Start your morning grounded in God's promises with thoughtful meditations, scripture verses, and guided prayers."
        badge="Morning Manna"
        breadcrumbs={[{ label: 'Devotionals' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {loading ? (
          <CardGrid columns={3}>
            <CardSkeleton count={6} />
          </CardGrid>
        ) : devotionals.length === 0 ? (
          <EmptyState
            icon={Sun}
            title="No devotionals published"
            message="No daily meditations have been published yet. Please check back tomorrow morning."
          />
        ) : (
          <>
            <CardGrid columns={3}>
              {devotionals.map((devotional) => (
                <Card
                  key={devotional.id}
                  onClick={() => onSelectDevotional(devotional.id)}
                >
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {devotional.date
                            ? new Date(devotional.date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Today'}
                        </span>
                        <span className="font-mono text-[11px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {devotional.verseReference || 'Scripture'}
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
                        {devotional.title}
                      </h3>

                      {devotional.verseText && (
                        <blockquote className="border-l-2 border-amber-500 pl-3 italic text-xs font-serif text-slate-600 dark:text-slate-300 line-clamp-2">
                          "{devotional.verseText}"
                        </blockquote>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-3 leading-relaxed">
                        {devotional.meditation}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Read Meditation</span>
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
  );
};
