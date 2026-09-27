import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { PublicAnnouncement } from '../../../types/public';
import { fetchPublicAnnouncement, subscribeToPublicRealtime } from '../../../lib/publicQueries';

export const AnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<PublicAnnouncement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchPublicAnnouncement().then((data) => {
      if (isMounted && data) {
        // Check if previously dismissed in this session
        const dismissedId = sessionStorage.getItem('ph_dismissed_announcement');
        if (dismissedId === data.id) {
          setIsDismissed(true);
        } else {
          setAnnouncement(data);
        }
      }
    });

    const unsubscribe = subscribeToPublicRealtime({
      onAnnouncementChange: (updated) => {
        if (isMounted) {
          setAnnouncement(updated);
          setIsDismissed(false);
        }
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      sessionStorage.setItem('ph_dismissed_announcement', announcement.id);
    }
    setIsDismissed(true);
  };

  if (!announcement || isDismissed) return null;

  const isUrgent = announcement.priority === 'Urgent';
  const isHigh = announcement.priority === 'High';

  return (
    <div
      role="banner"
      aria-label="Church Announcement"
      className={`relative w-full z-40 transition-all ${
        isUrgent
          ? 'bg-rose-950 text-rose-100 border-b border-rose-900/60'
          : isHigh
          ? 'bg-amber-950 text-amber-100 border-b border-amber-900/60'
          : 'bg-slate-900 text-slate-100 border-b border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isUrgent
                ? 'bg-rose-600 text-white'
                : isHigh
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-amber-300'
            }`}
          >
            <Megaphone className="w-3 h-3 shrink-0" />
            <span>Notice</span>
          </span>
          <div className="truncate font-medium flex items-center gap-2">
            <span className="font-semibold text-white truncate">{announcement.title}:</span>
            <span className="text-slate-300 dark:text-slate-300 truncate font-light">
              {announcement.content}
            </span>
          </div>
          {announcement.link_url && (
            <a
              href={announcement.link_url}
              className="hidden md:inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 ml-2"
            >
              <span>{announcement.link_text || 'Learn more'}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
