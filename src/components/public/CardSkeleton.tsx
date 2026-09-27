import React from 'react';

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col"
        >
          <div className="w-full aspect-16/10 bg-slate-200 dark:bg-slate-800" />
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-full h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-3/4 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5 pt-2">
                <div className="w-full h-3.5 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="w-5/6 h-3.5 rounded-md bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
              <div className="w-24 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
