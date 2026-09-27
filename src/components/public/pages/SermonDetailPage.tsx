import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  BookOpen,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { VideoPlayer } from '../VideoPlayer';
import { ShareButtons } from '../ShareButtons';
import { ReactionBar } from '../ReactionBar';
import { CommentList } from '../CommentList';
import { CommentForm } from '../CommentForm';
import { PublicSermon, PublicComment } from '../../../types/public';
import {
  fetchPublicSermonBySlug,
  fetchPublicComments,
  submitPublicComment,
} from '../../../lib/publicQueries';

interface SermonDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectBibleRef?: (ref: string) => void;
}

export const SermonDetailPage: React.FC<SermonDetailPageProps> = ({
  slug,
  onBack,
  onSelectBibleRef,
}) => {
  const [sermon, setSermon] = useState<PublicSermon | null>(null);
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicSermonBySlug(slug).then((data) => {
      if (!isMounted) return;
      setSermon(data);
      setLoading(false);

      if (data) {
        fetchPublicComments(data.id, 'sermon').then((c) => {
          if (isMounted) setComments(c);
        });
      }
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

  if (!sermon) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Sermon Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">The requested message may be unavailable.</p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Sermons
        </button>
      </div>
    );
  }

  const handleCommentSubmit = async (name: string, content: string) => {
    return await submitPublicComment({
      itemId: sermon.id,
      itemType: 'sermon',
      authorName: name,
      content,
    });
  };

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={sermon.title}
        subtitle={`Message by ${sermon.speaker}`}
        badge={sermon.category || 'Sermon'}
        breadcrumbs={[{ label: 'Sermons', href: '#sermons' }, { label: sermon.title }]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Sermons</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        {/* Video Player Box */}
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          <VideoPlayer
            url={sermon.videoUrl}
            poster={sermon.thumbnailUrl || sermon.cover_image_url}
            title={sermon.title}
          />
        </div>

        {/* Sermon Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-amber-500" />
                {sermon.speaker}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {sermon.date ? new Date(sermon.date).toLocaleDateString() : 'Recent'}
              </span>
              {sermon.duration && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {sermon.duration}
                  </span>
                </>
              )}
            </div>

            <ShareButtons title={sermon.title} />
          </div>

          {/* Scripture references as chips */}
          {sermon.bibleReference && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Scripture:
                </span>
                <button
                  type="button"
                  onClick={() => onSelectBibleRef?.(sermon.bibleReference!)}
                  className="px-3 py-1 rounded-full text-xs font-serif bg-white dark:bg-slate-900 border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                >
                  {sermon.bibleReference}
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Transcript */}
          {sermon.transcript && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Sermon Notes & Transcript</span>
                </span>
                {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTranscript && (
                <div className="p-6 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed whitespace-pre-wrap">
                  {sermon.transcript}
                </div>
              )}
            </div>
          )}

          {/* Reactions */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 flex items-center justify-between">
            <ReactionBar itemId={sermon.id} itemType="sermon" />
            <ShareButtons title={sermon.title} />
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-2">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Reflections & Comments ({comments.length})
            </h3>
            <CommentList comments={comments} />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Share a Blessing
              </h4>
              <CommentForm
                itemId={sermon.id}
                itemType="sermon"
                onSubmit={handleCommentSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
