import React from 'react';

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full min-h-[560px] sm:min-h-[640px] bg-slate-900 animate-pulse flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl w-full mx-auto px-6 py-20 text-center flex flex-col items-center space-y-6">
        <div className="h-4 w-32 bg-slate-800 rounded-full" />
        <div className="h-12 sm:h-16 w-3/4 bg-slate-800 rounded-2xl" />
        <div className="h-5 sm:h-6 w-1/2 bg-slate-800/80 rounded-lg" />
        <div className="flex gap-4 pt-4">
          <div className="h-11 w-40 bg-slate-800 rounded-xl" />
          <div className="h-11 w-36 bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number; cols?: string }> = ({
  count = 3,
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}) => {
  return (
    <div className={`grid ${cols} gap-6 sm:gap-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-5 flex flex-col space-y-4 animate-pulse"
        >
          <div className="w-full aspect-video rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="pt-2 flex justify-between items-center">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const QuoteSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-stone-50/50 dark:bg-slate-900/40 animate-pulse space-y-6 text-center flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="h-7 sm:h-9 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-7 sm:h-9 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded-full" />
    </div>
  );
};

export const FeatureSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="aspect-16/10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-4">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl pt-2" />
        </div>
      </div>
    </div>
  );
};
