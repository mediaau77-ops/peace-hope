import React, { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Megaphone, Share2 } from 'lucide-react';
import { PageHero } from '../PageHero';
import { RichText } from '../RichText';
import { ShareButtons } from '../ShareButtons';
import { PublicAnnouncement } from '../../../types/public';
import { fetchPublicAnnouncementById } from '../../../lib/publicQueries';

interface AnnouncementDetailPageProps {
  id: string;
  onBack: () => void;
}

export const AnnouncementDetailPage: React.FC<AnnouncementDetailPageProps> = ({
  id,
  onBack,
}) => {
  const [announcement, setAnnouncement] = useState<PublicAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicAnnouncementById(id).then((data) => {
      setAnnouncement(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Announcement Not Found
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Bulletin
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={announcement.title}
        subtitle="Official Church Bulletin"
        badge={announcement.priority === 'urgent' ? 'Urgent Notice' : 'Notice'}
        breadcrumbs={[{ label: 'Announcements', href: '#announcements' }, { label: announcement.title }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Announcements</span>
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              {announcement.created_at
                ? new Date(announcement.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Notice'}
            </span>
            <ShareButtons title={announcement.title} />
          </div>

          <div className="pt-2">
            <RichText content={announcement.content} />
          </div>
        </div>
      </div>
    </article>
  );
};
