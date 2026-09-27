import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  BookOpen,
  FileText,
  Download,
  Share2,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { RichText } from '../RichText';
import { VideoPlayer } from '../VideoPlayer';
import { AudioPlayer } from '../AudioPlayer';
import { ShareButtons } from '../ShareButtons';
import { ReactionBar } from '../ReactionBar';
import { CommentList } from '../CommentList';
import { CommentForm } from '../CommentForm';
import { Card } from '../Card';
import { CardGrid } from '../CardGrid';
import { PublicTeaching, PublicComment } from '../../../types/public';
import {
  fetchPublicTeachingBySlug,
  fetchRelatedTeachings,
  fetchPublicComments,
  submitPublicComment,
} from '../../../lib/publicQueries';

interface TeachingDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectTeaching: (slug: string) => void;
  onSelectBibleRef?: (ref: string) => void;
}

export const TeachingDetailPage: React.FC<TeachingDetailPageProps> = ({
  slug,
  onBack,
  onSelectTeaching,
  onSelectBibleRef,
}) => {
  const [teaching, setTeaching] = useState<PublicTeaching | null>(null);
  const [related, setRelated] = useState<PublicTeaching[]>([]);
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchPublicTeachingBySlug(slug).then((data) => {
      if (!isMounted) return;
      setTeaching(data);
      setLoading(false);

      if (data) {
        // Fetch related teachings & comments
        fetchRelatedTeachings(data.category, data.id, 3).then((rel) => {
          if (isMounted) setRelated(rel);
        });
        fetchPublicComments(data.id, 'teaching').then((c) => {
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

  if (!teaching) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-2">
          Teaching Not Found
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          The requested study may have been unpublished or removed.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Teachings
        </button>
      </div>
    );
  }

  const handleCommentSubmit = async (name: string, content: string) => {
    return await submitPublicComment({
      itemId: teaching.id,
      itemType: 'teaching',
      authorName: name,
      content,
    });
  };

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title={teaching.title}
        subtitle={`By ${teaching.author || 'Pastor'} • ${teaching.read_time || '5 min read'}`}
        badge={teaching.category}
        backgroundImage={teaching.cover_image_url}
        breadcrumbs={[
          { label: 'Teachings', href: '#teachings' },
          { label: teaching.title },
        ]}
        action={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Teachings</span>
          </button>
        }
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-8">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                <User className="w-4 h-4 text-amber-500" />
                {teaching.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {teaching.published_at
                  ? new Date(teaching.published_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Published'}
              </span>
            </div>

            <ShareButtons title={teaching.title} />
          </div>

          {/* Scripture references as clickable chips */}
          {teaching.bible_references && teaching.bible_references.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mr-2">
                <BookOpen className="w-4 h-4" />
                <span>Scripture Focus:</span>
              </span>
              {teaching.bible_references.map((ref, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectBibleRef?.(ref)}
                  className="px-3 py-1 rounded-full text-xs font-serif bg-white dark:bg-slate-900 border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                >
                  {ref}
                </button>
              ))}
            </div>
          )}

          {/* Video or Audio Embed if available */}
          {teaching.video_url && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-semibold text-slate-900 dark:text-white">
                Video Presentation
              </h3>
              <VideoPlayer url={teaching.video_url} poster={teaching.cover_image_url} />
            </div>
          )}

          {teaching.audio_url && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-semibold text-slate-900 dark:text-white">
                Audio Recording
              </h3>
              <AudioPlayer src={teaching.audio_url} title={teaching.title} artist={teaching.author} />
            </div>
          )}

          {/* Main Body */}
          <div className="pt-2">
            <RichText content={teaching.body} />
          </div>

          {/* Attachments / Study Guide Downloads */}
          {teaching.attachments && teaching.attachments.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Study Handouts & Documents</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teaching.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors group"
                  >
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                      {att.name}
                    </span>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-amber-500 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reactions */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 flex items-center justify-between">
            <ReactionBar itemId={teaching.id} itemType="teaching" />
            <ShareButtons title={teaching.title} />
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                Discussion & Reflections ({comments.length})
              </h3>
            </div>
            <CommentList comments={comments} />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Leave a Thought
              </h4>
              <CommentForm
                itemId={teaching.id}
                itemType="teaching"
                onSubmit={handleCommentSubmit}
              />
            </div>
          </div>
        </div>

        {/* Related Teachings */}
        {related.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
              Related Studies
            </h3>
            <CardGrid columns={3}>
              {related.map((rel) => (
                <Card key={rel.id} onClick={() => onSelectTeaching(rel.slug || rel.id)}>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {rel.category}
                    </span>
                    <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{rel.excerpt}</p>
                  </div>
                </Card>
              ))}
            </CardGrid>
          </div>
        )}
      </div>
    </article>
  );
};
