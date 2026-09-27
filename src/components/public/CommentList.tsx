import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { PublicComment } from '../../types/public';

interface CommentListProps {
  comments: PublicComment[];
  className?: string;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, className = '' }) => {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
        <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-400 opacity-60" />
        <p>No comments yet. Share your thoughts or testimony below.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {comment.author_avatar ? (
                <img
                  src={comment.author_avatar}
                  alt={comment.author_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-center text-[10px]">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {comment.author_name}
              </span>
            </div>
            {comment.created_at && (
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-light pl-8">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
};
