import React from 'react';
import { LucideIcon, Plus, Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  tableName?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No content has been published yet.',
  description = 'Everything comes from Supabase. Use the action button above or below to create your first verified record.',
  actionLabel,
  onAction,
  icon: Icon = Database,
  tableName,
}) => {
  return (
    <div className="py-16 px-6 text-center border-2 border-dashed border-[#ece8df] rounded-2xl bg-white/60 flex flex-col items-center justify-center max-w-xl mx-auto my-6 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-[#fef9ee] border border-[#f5e6c8] flex items-center justify-center text-[#b4832e] mb-4 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h4 className="font-serif text-lg font-medium text-slate-900 mb-1.5">
        {title}
      </h4>

      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {tableName && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono mb-5 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Table: <strong className="text-slate-800">{tableName}</strong>
        </span>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
