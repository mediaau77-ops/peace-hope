import React, { useState, useEffect } from 'react';
import {
  Video,
  Users,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { PublicMeeting } from '../../../types/public';
import { fetchPublicMeetings } from '../../../lib/publicQueries';

interface MeetLandingPageProps {
  onJoinMeeting: (meetingId: string) => void;
}

export const MeetLandingPage: React.FC<MeetLandingPageProps> = ({ onJoinMeeting }) => {
  const [meetings, setMeetings] = useState<PublicMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [customRoomCode, setCustomRoomCode] = useState('');

  useEffect(() => {
    fetchPublicMeetings().then((list) => {
      setMeetings(list);
      setLoading(false);
    });
  }, []);

  const handleJoinCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomCode.trim()) return;
    onJoinMeeting(customRoomCode.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Virtual Fellowship & Prayer Rooms"
        subtitle="Where two or three are gathered together in my name, there am I in the midst of them. Join online Bible study, committee sessions, and prayer circles."
        badge="Peace & Hope Meet"
        breadcrumbs={[{ label: 'Meet' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {/* Join by Code Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Have a Meeting Link or Code?
            </h3>
            <p className="text-xs text-slate-500 font-light">
              Enter the room ID provided by your group leader to join immediately.
            </p>
          </div>

          <form onSubmit={handleJoinCustom} className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              required
              value={customRoomCode}
              onChange={(e) => setCustomRoomCode(e.target.value)}
              placeholder="e.g. sabbath-school-kigali"
              className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white flex-1 md:w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              Join Room
            </button>
          </form>
        </div>

        {/* Public Fellowship Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Open Fellowship Circles
            </h3>
            <span className="text-xs text-slate-500">Live or Scheduled</span>
          </div>

          {loading ? (
            <CardGrid columns={3}>
              <CardSkeleton count={3} />
            </CardGrid>
          ) : meetings.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No open video rooms currently scheduled"
              message="Check back during Sabbath School, Wednesday night prayer meeting, or youth vespers."
            />
          ) : (
            <CardGrid columns={3}>
              {meetings.map((m) => {
                const meetingDate = (m as any).scheduled_at || m.date;
                const roomId = (m as any).room_id || m.id;
                return (
                  <Card key={m.id} onClick={() => onJoinMeeting(roomId)}>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            {m.status === 'live' ? '● In Session' : 'Scheduled'}
                          </span>
                          <span className="text-slate-400">
                            {meetingDate ? new Date(meetingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Open'}
                          </span>
                        </div>

                      <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                        {m.title}
                      </h4>

                      {m.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-light">
                          {m.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Join Room</span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardGrid>
          )}
        </div>
      </div>
    </div>
  );
};
