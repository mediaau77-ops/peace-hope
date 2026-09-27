import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, BookOpen, Quote, Mail, CheckCircle2 } from 'lucide-react';
import { PageHero } from '../PageHero';
import { RichText } from '../RichText';
import { ShareButtons } from '../ShareButtons';
import { ReactionBar } from '../ReactionBar';
import { PublicDevotional } from '../../../types/public';
import {
  fetchPublicDevotionalBySlug,
  submitPublicNewsletterSubscriber,
} from '../../../lib/publicQueries';

interface DevotionalDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectBibleRef?: (ref: string) => void;
}

export const DevotionalDetailPage: React.FC<DevotionalDetailPageProps> = ({
  slug,
  onBack,
  onSelectBibleRef,
}) => {
  const [devotional, setDevotional] = useState<PublicDevotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicDevotionalBySlug(slug).then((data) => {
      if (!isMounted) return;
      setDevotional(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    const success = await submitPublicNewsletterSubscriber(email.trim());
    setSubscribing(false);
    if (success) {
      setSubscribed(true);
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!devotional) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Devotional Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">The meditation could not be located.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Devotionals
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={devotional.title}
        subtitle={
          devotional.date
            ? new Date(devotional.date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'Daily Devotion'
        }
        badge={devotional.verseReference || 'Devotional'}
        backgroundImage={devotional.cover_image_url}
        breadcrumbs={[{ label: 'Devotionals', href: '#devotionals' }, { label: devotional.title }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Devotionals</span>
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8">
          {/* Daily Verse Callout */}
          {devotional.verseText && (
            <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-4 relative overflow-hidden">
              <Quote className="w-8 h-8 text-amber-500/40 mx-auto" />
              <blockquote className="font-serif text-xl sm:text-2xl text-slate-900 dark:text-amber-100 italic leading-relaxed">
                "{devotional.verseText}"
              </blockquote>
              {devotional.verseReference && (
                <button
                  type="button"
                  onClick={() => onSelectBibleRef?.(devotional.verseReference!)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{devotional.verseReference}</span>
                </button>
              )}
            </div>
          )}

          {/* Meditation Content */}
          <div className="pt-2">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-4">
              Meditation
            </h3>
            <RichText content={devotional.meditation} />
          </div>

          {/* Guided Prayer Block */}
          {devotional.prayer && (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Today's Prayer Focus
              </span>
              <p className="font-serif italic text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                "{devotional.prayer}"
              </p>
            </div>
          )}

          {/* Reactions & Sharing */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 flex items-center justify-between">
            <ReactionBar itemId={devotional.id} itemType="devotional" />
            <ShareButtons title={devotional.title} />
          </div>

          {/* Newsletter Subscribe Banner */}
          <div className="p-6 rounded-2xl bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-white">
                  Receive Morning Devotionals in Your Inbox
                </h4>
                <p className="text-xs text-slate-300">
                  Begin each day inspired with scripture and prayer.
                </p>
              </div>
            </div>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You're subscribed! May God bless your quiet time daily.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
