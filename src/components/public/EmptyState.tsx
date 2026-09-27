import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`py-16 px-6 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
          {message}
        </p>
      </div>

      {(actionText && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-slate-950 transition-colors shadow-xs"
            >
              {actionText}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 dark:text-slate-950 transition-colors shadow-xs cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
