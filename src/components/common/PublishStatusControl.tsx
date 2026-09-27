import React from 'react';
import { ContentStatus } from '../../types';
import { CheckCircle2, Clock, FileEdit, Archive } from 'lucide-react';

interface PublishStatusControlProps {
  status: ContentStatus | string;
  onChange?: (newStatus: ContentStatus) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const PublishStatusBadge: React.FC<{ status: ContentStatus | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const norm = (status || 'draft').toLowerCase();

  if (norm === 'published') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        Published
      </span>
    );
  }

  if (norm === 'scheduled') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock className="w-3 h-3 text-amber-500" />
        Scheduled
      </span>
    );
  }

  if (norm === 'archived') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Archive className="w-3 h-3 text-slate-400" />
        Archived
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <FileEdit className="w-3 h-3 text-slate-500" />
      Draft
    </span>
  );
};

export const PublishStatusSelect: React.FC<PublishStatusControlProps> = ({
  status,
  onChange,
  size = 'sm',
  disabled = false,
}) => {
  const norm = (status || 'draft').toLowerCase() as ContentStatus;

  return (
    <div className="relative inline-flex items-center">
      <select
        disabled={disabled}
        value={norm}
        onChange={(e) => onChange && onChange(e.target.value as ContentStatus)}
        className={`rounded-lg font-medium border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${
          size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-sm px-3 py-1.5'
        } ${
          norm === 'published'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            : norm === 'scheduled'
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            : norm === 'archived'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        }`}
      >
        <option value="draft">Draft (Admin Only)</option>
        <option value="published">Published (Live)</option>
        <option value="scheduled">Scheduled Auto-Publish</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  );
};
