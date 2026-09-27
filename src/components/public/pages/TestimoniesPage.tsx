import React, { useState, useEffect } from 'react';
import { Heart, User, Calendar, ArrowRight, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { PageHero } from '../PageHero';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { CardSkeleton } from '../CardSkeleton';
import { EmptyState } from '../EmptyState';
import { Pagination } from '../Pagination';
import { SearchBar } from '../SearchBar';
import { PublicTestimony } from '../../../types/public';
import {
  fetchPublicTestimoniesList,
  submitPublicTestimony,
} from '../../../lib/publicQueries';

interface TestimoniesPageProps {
  onSelectTestimony: (slug: string) => void;
}

export const TestimoniesPage: React.FC<TestimoniesPageProps> = ({ onSelectTestimony }) => {
  const [tab, setTab] = useState<'stories' | 'submit'>('stories');
  const [testimonies, setTestimonies] = useState<PublicTestimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Submit Testimony State
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicTestimoniesList({
      page,
      limit: 9,
      search,
    }).then((res) => {
      if (!isMounted) return;
      setTestimonies(res.data);
      setTotal(res.total);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim() || !authorName.trim()) return;

    setSubmitting(true);
    const success = await submitPublicTestimony({
      authorName: authorName.trim(),
      location: location.trim(),
      title: title.trim(),
      story: story.trim(),
    });

    setSubmitting(false);
    if (success) {
      setSubmitted(true);
      setTitle('');
      setStory('');
      setAuthorName('');
      setLocation('');
    }
  };

  const totalPages = Math.ceil(total / 9) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Stories of Hope & Faith"
        subtitle="And they overcame him by the blood of the Lamb, and by the word of their testimony. Discover how God is transforming lives."
        badge="Testimonies"
        breadcrumbs={[{ label: 'Testimonies' }]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setTab('stories')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'stories'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Member Stories ({total})
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('submit');
                setSubmitted(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                tab === 'submit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Share Your Story
            </button>
          </div>

          {tab === 'stories' && (
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search testimonies by keyword or name..."
            />
          )}
        </div>

        {tab === 'stories' && (
          <div className="space-y-6">
            {loading ? (
              <CardGrid columns={3}>
                <CardSkeleton count={6} />
              </CardGrid>
            ) : testimonies.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No testimonies yet"
                message="Be the first to share how the Lord has worked a miracle in your life."
                actionText="Share Your Testimony"
                onAction={() => setTab('submit')}
              />
            ) : (
              <>
                <CardGrid columns={3}>
                  {testimonies.map((testimony) => (
                    <Card
                      key={testimony.id}
                      onClick={() => onSelectTestimony(testimony.id)}
                    >
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                              <User className="w-3.5 h-3.5 text-amber-500" />
                              {testimony.authorName}
                            </span>
                            <span>
                              {testimony.created_at
                                ? new Date(testimony.created_at).toLocaleDateString()
                                : 'Recent'}
                            </span>
                          </div>

                          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-600 transition-colors">
                            {testimony.title}
                          </h3>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-3 leading-relaxed">
                            {testimony.story}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                          <span>Read Full Story</span>
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
        )}

        {/* Tab 2: Submit Testimony Form */}
        {tab === 'submit' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Share Your Testimony of God's Faithfulness
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Your story will encourage others and give glory to Jesus Christ.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-serif text-lg font-bold">Praise God for Your Story!</h4>
                <p className="text-xs font-light max-w-md mx-auto">
                  Your testimony has been submitted for pastoral review and will appear on the wall soon.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setTab('stories');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    View Stories
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title of Your Testimony *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Delivered from Illness and Restored in Peace"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Grace Mukamana"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Location / Branch (optional)
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Story *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Describe how God showed His mercy, answered prayer, or sustained you..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Stories are reviewed with reverence before publication.
                  </span>

                  <button
                    type="submit"
                    disabled={submitting || !title.trim() || !story.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Testimony'}</span>
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
