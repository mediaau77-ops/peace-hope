import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Check, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { PageHero } from '../PageHero';
import { EmptyState } from '../EmptyState';
import { PublicNotification } from '../../../types/public';
import { fetchPublicNotifications } from '../../../lib/publicQueries';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<PublicNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicNotifications().then((res) => {
      setNotifications(res);
      setLoading(false);
    });
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Sanctuary Notifications & Alerts"
        subtitle="Stay current on livestream broadcasts, event reminders, prayer wall amens, and church alerts."
        badge="Activity Center"
        breadcrumbs={[{ label: 'Notifications' }]}
        action={
          notifications.length > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          ) : undefined
        }
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-4">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              message="No new sanctuary announcements or reminders at this moment."
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  !notif.read ? 'bg-amber-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleDateString()
                        : 'Today'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
