import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { PageHero } from '../PageHero';
import { RichText } from '../RichText';
import { ShareButtons } from '../ShareButtons';
import { ReactionBar } from '../ReactionBar';
import { PublicTestimony } from '../../../types/public';
import { fetchPublicTestimonyBySlug } from '../../../lib/publicQueries';

interface TestimonyDetailPageProps {
  slug: string;
  onBack: () => void;
}

export const TestimonyDetailPage: React.FC<TestimonyDetailPageProps> = ({ slug, onBack }) => {
  const [testimony, setTestimony] = useState<PublicTestimony | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicTestimonyBySlug(slug).then((data) => {
      if (!isMounted) return;
      setTestimony(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!testimony) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Story Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">The testimony could not be located.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Testimonies
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={testimony.title}
        subtitle={`Story shared by ${testimony.authorName}${testimony.location ? ` • ${testimony.location}` : ''}`}
        badge="Testimony"
        backgroundImage={testimony.cover_image_url}
        breadcrumbs={[{ label: 'Testimonies', href: '#testimonies' }, { label: testimony.title }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Testimonies</span>
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8">
          {/* Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-amber-500" />
                {testimony.authorName}
              </span>
              {testimony.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {testimony.location}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {testimony.created_at ? new Date(testimony.created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            <ShareButtons title={testimony.title} />
          </div>

          {/* Full Story */}
          <div className="pt-2">
            <RichText content={testimony.story} />
          </div>

          {/* Reactions */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 flex items-center justify-between">
            <ReactionBar itemId={testimony.id} itemType="testimony" />
            <ShareButtons title={testimony.title} />
          </div>
        </div>
      </div>
    </article>
  );
};
