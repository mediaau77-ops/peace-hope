import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, Locale } from '../../../lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'compact';
}

const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'header' }) => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
          variant === 'footer'
            ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
            : 'bg-white/80 hover:bg-white text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-xs'
        }`}
      >
        <Globe className="w-3.5 h-3.5 opacity-70" />
        <span className="font-semibold tracking-wide uppercase">{currentLang.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-scale-up"
        >
          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Language / Ururimi / Langue
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                role="menuitem"
                type="button"
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
