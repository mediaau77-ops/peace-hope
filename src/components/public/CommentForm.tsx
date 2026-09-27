import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface CommentFormProps {
  itemId: string;
  itemType: 'teaching' | 'sermon' | 'devotional' | 'event' | 'testimony' | 'announcement';
  onSubmit: (name: string, content: string) => Promise<boolean>;
  className?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  itemId,
  itemType,
  onSubmit,
  className = '',
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(name.trim(), content.trim());
      if (success) {
        setSubmitted(true);
        setName('');
        setContent('');
      } else {
        setError('Unable to post comment at this moment. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error submitting comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="font-semibold">Thank you for your comment!</p>
          <p className="text-emerald-700/80 dark:text-emerald-400 font-light">
            Your comment has been submitted and will appear after brief moderation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="comment-author" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Your Name
        </label>
        <input
          id="comment-author"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Bosco"
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label htmlFor="comment-content" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Add to the discussion
        </label>
        <textarea
          id="comment-content"
          required
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share reflections, blessings, or questions..."
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          Comments are reviewed for kindness and reverence.
        </span>
        <button
          type="submit"
          disabled={submitting || !name.trim() || !content.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
        </button>
      </div>
    </form>
  );
};
