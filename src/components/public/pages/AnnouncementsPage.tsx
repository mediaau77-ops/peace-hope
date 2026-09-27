import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, ArrowRight, AlertCircle, Pin } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { PublicAnnouncement } from '../../../types/public';
import { fetchPublicAnnouncementsList } from '../../../lib/publicQueries';

interface AnnouncementsPageProps {
  onSelectAnnouncement: (id: string) => void;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  onSelectAnnouncement,
}) => {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPublicAnnouncementsList({ page, limit: 9 }).then((res) => {
      setAnnouncements(res.data);
      setTotal(res.total);
      setLoading(false);
    });
  }, [page]);

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Church Bulletin & Announcements"
        subtitle="Stay updated with vital church news, ministry schedules, community notices, and official pastoral pastoral communications."
        badge="Official Bulletin"
        breadcrumbs={[{ label: 'Announcements' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {loading ? (
          <CardGrid columns={3}>
            <CardSkeleton count={6} />
          </CardGrid>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements at this time"
            message="Check back soon for church notices and updates."
          />
        ) : (
          <>
            <CardGrid columns={3}>
              {announcements.map((item) => (
                <Card key={item.id} onClick={() => onSelectAnnouncement(item.id)}>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString()
                            : 'Notice'}
                        </span>
                        {item.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Urgent
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Read Bulletin</span>
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
