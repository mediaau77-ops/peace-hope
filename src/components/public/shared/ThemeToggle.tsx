import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  variant?: 'header' | 'footer' | 'minimal';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
          isDark
            ? 'bg-slate-900/60 border-slate-700 text-amber-300 hover:bg-slate-800'
            : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-[#DFB15B]" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-slate-300" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-hidden ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#DFB15B] transition-transform duration-200 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
};
