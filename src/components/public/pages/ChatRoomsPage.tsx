import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Lock, ArrowRight, ShieldCheck, Hash } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { PublicChatRoom } from '../../../types/public';
import { fetchPublicChatRooms } from '../../../lib/publicQueries';

interface ChatRoomsPageProps {
  onSelectRoom: (roomId: string) => void;
}

export const ChatRoomsPage: React.FC<ChatRoomsPageProps> = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState<PublicChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicChatRooms().then((list) => {
      setRooms(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Community Fellowship Circles"
        subtitle="Connect with small study groups, youth ministries, prayer warriors, and ministry departments."
        badge="Community Chat"
        breadcrumbs={[{ label: 'Chat Circles' }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                Reverent & Christ-Centered Fellowship
              </h4>
              <p className="text-xs text-slate-500 font-light">
                Please maintain love, humility, and encouragement in all discussions.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <CardGrid columns={3}>
            <CardSkeleton count={4} />
          </CardGrid>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No community chat rooms active"
            message="Chat rooms will be opened for ministries soon."
          />
        ) : (
          <CardGrid columns={3}>
            {rooms.map((room) => (
              <Card key={room.id} onClick={() => onSelectRoom(room.id)}>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-bold">
                        <Hash className="w-3.5 h-3.5" />
                        {room.name.toLowerCase().replace(/\s+/g, '-')}
                      </span>
                      {(room.type === 'private' || room.is_private) && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="w-3 h-3" />
                          Private
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                      {room.name}
                    </h3>

                    {room.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-2">
                        {room.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    <span>Enter Discussion</span>
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
};
