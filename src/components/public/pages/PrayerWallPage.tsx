import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Send, CheckCircle2, User, Clock, ShieldCheck, Flame } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { FilterBar } from '../FilterBar';
import { PublicPrayerRequest } from '../../../types/public';
import {
  fetchPublicPrayerWall,
  submitPublicPrayerRequest,
  incrementPrayerAmen,
} from '../../../lib/publicQueries';
import { useDuplicateClickGuard } from '../../../hooks/useDuplicateClickGuard';
import { useRealtimeChannel } from '../../../hooks/useRealtimeChannel';

export const PrayerWallPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'submit'>('requests');
  const [requests, setRequests] = useState<PublicPrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'recent' | 'most_prayed' | 'answered'>('recent');

  // Submit Form State
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { hasActed, executeGuarded } = useDuplicateClickGuard('prayer_wall');

  const loadRequests = () => {
    fetchPublicPrayerWall({ page, limit: 9, filter }).then((res) => {
      setRequests(res.data);
      setTotal(res.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    setLoading(true);
    loadRequests();
  }, [page, filter]);

  // Safe singleton realtime subscription
  useRealtimeChannel({
    table: 'prayer_requests',
    event: '*',
    onPayload: () => {
      loadRequests();
    },
  });

  const handleAmen = async (id: string) => {
    await executeGuarded(id, 'amen', async () => {
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, amenCount: (r.amenCount || 0) + 1 } : r))
      );
      await incrementPrayerAmen(id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    setSubmitting(true);
    const success = await submitPublicPrayerRequest({
      authorName: authorName.trim() || undefined,
      location: location.trim() || undefined,
      requestText: requestText.trim(),
      isAnonymous,
      isPublic,
    });

    setSubmitting(false);
    if (success) {
      setSubmitted(true);
      setRequestText('');
      setAuthorName('');
      setLocation('');
    }
  };

  const filterOptions = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Most Prayed', value: 'most_prayed' },
    { label: 'Praise & Answered', value: 'answered' },
  ];

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Prayer Wall & Intercession"
        subtitle="Bear one another’s burdens, and so fulfill the law of Christ. Share your petition or stand in faith for brothers and sisters."
        badge="Intercessory Ministry"
        breadcrumbs={[{ label: 'Prayer Wall' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Public Requests ({total})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('submit');
                setSubmitted(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Submit a Prayer Request
            </button>
          </div>

          {activeTab === 'requests' && (
            <FilterBar
              categories={filterOptions}
              selectedCategory={filter}
              onSelectCategory={(val) => {
                setFilter(val as any);
                setPage(1);
              }}
            />
          )}
        </div>

        {/* Tab 1: Prayer Requests List */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {loading ? (
              <CardGrid columns={3}>
                <CardSkeleton count={6} />
              </CardGrid>
            ) : requests.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="Be the first to share a prayer request"
                message="Bring your burdens, thanksgiving, or intercession before God and our loving community."
                actionText="Submit Prayer Request"
                onAction={() => setActiveTab('submit')}
              />
            ) : (
              <>
                <CardGrid columns={3}>
                  {requests.map((prayer) => {
                    const hasVotedAmen = hasActed(prayer.id, 'amen');
                    return (
                      <Card key={prayer.id} hoverEffect={false}>
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                                <User className="w-3.5 h-3.5 text-amber-500" />
                                {prayer.isAnonymous ? 'Confidential Request' : prayer.authorName}
                              </span>
                              <span>
                                {prayer.created_at
                                  ? new Date(prayer.created_at).toLocaleDateString()
                                  : 'Today'}
                              </span>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed italic">
                              "{prayer.requestText}"
                            </p>
                          </div>

                          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono">
                              <Flame className="w-3.5 h-3.5 fill-amber-500" />
                              <span>{prayer.candleCount || 1} praying</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAmen(prayer.id)}
                              disabled={hasVotedAmen}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                hasVotedAmen
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-500/30'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
                              }`}
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${hasVotedAmen ? 'text-amber-600 fill-current' : ''}`} />
                              <span>{hasVotedAmen ? 'Amen prayed' : 'Voice Amen'}</span>
                              <span className="font-mono text-[11px] ml-0.5">{prayer.amenCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
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
        )}

        {/* Tab 2: Submit Prayer Form */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Share Your Prayer Request
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Our prayer team and pastoral intercessors lift each petition up before the throne of grace.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-lg font-bold">Prayer Request Received</h4>
                <p className="text-xs font-light max-w-md mx-auto">
                  Thank you for entrusting us with your request. It has been delivered to our prayer team and will be placed on the wall following pastoral review.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setActiveTab('requests');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    View Prayer Wall
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Prayer Request or Intercession *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="Write what is on your heart (e.g. healing for a loved one, spiritual guidance, peace in trials)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name {!isAnonymous && '(optional)'}
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={isAnonymous ? 'Anonymous' : authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Daniel K."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location / City (optional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kigali, Rwanda"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Post anonymously (do not show my name on the public wall)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded-md border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Publish on the Prayer Wall (uncheck if pastoral team only)</span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Confidential & prayerfully held</span>
                  </span>

                  <button
                    type="submit"
                    disabled={submitting || !requestText.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Prayer'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
