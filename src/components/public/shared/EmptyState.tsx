import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-stone-50/50 dark:bg-slate-900/40 max-w-xl mx-auto ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4 shadow-xs">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
      )}
      <h4 className="font-serif text-lg font-medium text-slate-800 dark:text-slate-200 tracking-tight mb-1.5">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md font-sans leading-relaxed">
          {description}
        </p>
      )}
      {actionText && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-amber-100 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-slate-950 transition-colors shadow-xs"
            >
              {actionText}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-amber-100 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-slate-950 transition-colors shadow-xs cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
