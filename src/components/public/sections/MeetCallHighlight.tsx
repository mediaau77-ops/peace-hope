import React from 'react';
import { Video, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useI18n } from '../../../lib/i18n';
import { PublicMeeting } from '../../../types/public';

interface MeetCallHighlightProps {
  meeting?: PublicMeeting | null;
}

export const MeetCallHighlight: React.FC<MeetCallHighlightProps> = ({ meeting }) => {
  const { t } = useI18n();

  // If no upcoming public meeting call, hide section gracefully
  if (!meeting) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      aria-label="Online Fellowship Gathering"
      className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-stone-50/60 dark:bg-slate-950/60 p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Video className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Online Sacred Gathering
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {meeting.title}
              </h3>
              {meeting.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-light max-w-xl">
                  {meeting.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(meeting.date || meeting.scheduled_at || '')}</span>
                </div>
                {meeting.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.time}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={meeting.join_url || '#'}
              target={meeting.join_url?.startsWith('http') ? '_blank' : undefined}
              rel={meeting.join_url?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-slate-950 transition-all shadow-xs cursor-pointer"
            >
              <span>{t('meeting_join')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
