'use client';

import React, { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundaryPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.debug('[AppErrorBoundary] Handled top-level public error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-[#faf9f6] text-slate-900">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-serif text-xl font-bold">
          ✝
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Peace &amp; Hope
          </h1>
          <p className="text-sm text-slate-600 font-light">
            We encountered a temporary interruption loading this page. Please refresh or try again in a moment.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
