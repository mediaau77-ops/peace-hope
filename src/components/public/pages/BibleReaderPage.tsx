import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Share2,
  Bookmark,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { PageHero } from '../PageHero';
import { EmptyState } from '../EmptyState';
import { useI18n } from '../../../lib/i18n';
import {
  fetchBibleTranslations,
  fetchBibleBooks,
  fetchBibleVersesByChapter,
  searchBibleVerses,
} from '../../../lib/publicQueries';
import {
  PublicBibleBook,
  PublicBibleTranslation,
  PublicBibleVerse,
} from '../../../types/public';

interface BibleReaderPageProps {
  initialBook?: string;
  initialChapter?: number;
}

export const BibleReaderPage: React.FC<BibleReaderPageProps> = ({
  initialBook = 'Genesis',
  initialChapter = 1,
}) => {
  const { locale } = useI18n();
  const [translations, setTranslations] = useState<PublicBibleTranslation[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('');
  const [hasManualTranslationOverride, setHasManualTranslationOverride] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [books, setBooks] = useState<PublicBibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>(initialBook);
  const [selectedChapter, setSelectedChapter] = useState<number>(initialChapter);
  const [verses, setVerses] = useState<PublicBibleVerse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PublicBibleVerse[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Verse highlighting & copy
  const [selectedVerseIds, setSelectedVerseIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  // Load Translations and Books with locale-aware selection
  useEffect(() => {
    let isMounted = true;
    fetchBibleTranslations().then((trList) => {
      if (!isMounted) return;
      setTranslations(trList);
    });

    fetchBibleBooks().then((bookList) => {
      if (!isMounted) return;
      setBooks(bookList);
      if (bookList.length > 0 && !bookList.some((b) => b.name === selectedBook)) {
        setSelectedBook(bookList[0].name);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync translation with active locale when translations load or locale changes (unless manual override)
  useEffect(() => {
    if (translations.length === 0) return;
    if (hasManualTranslationOverride) return;

    // Search for translation matching active locale
    const matching = translations.find((tr) => {
      const code = (tr.code || '').toLowerCase();
      const lang = (tr.language || '').toLowerCase();
      if (locale === 'rw') {
        return code.includes('rw') || lang.includes('kinya') || code.includes('by');
      }
      if (locale === 'fr') {
        return code.includes('fr') || lang.includes('french') || code.includes('lsg');
      }
      return code.includes('en') || lang.includes('eng') || code.includes('kjv') || code.includes('nkjv');
    });

    if (matching) {
      setSelectedTranslation(matching.id);
      setFallbackNotice(null);
    } else {
      // Graceful fallback to English
      const enTranslation =
        translations.find((tr) => {
          const code = (tr.code || '').toLowerCase();
          const lang = (tr.language || '').toLowerCase();
          return code.includes('en') || lang.includes('eng') || code.includes('kjv');
        }) || translations[0];

      if (enTranslation) {
        setSelectedTranslation(enTranslation.id);
        if (locale !== 'en') {
          const langLabel = locale === 'rw' ? 'Kinyarwanda' : locale === 'fr' ? 'Français' : locale;
          setFallbackNotice(
            `Bible translation in ${langLabel} is being prepared. Currently displaying ${enTranslation.name} (${enTranslation.code}).`
          );
        } else {
          setFallbackNotice(null);
        }
      }
    }
  }, [translations, locale, hasManualTranslationOverride]);

  // Load verses for current Book and Chapter
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchBibleVersesByChapter({
      bookName: selectedBook,
      chapterNumber: selectedChapter,
      translationId: selectedTranslation || undefined,
    }).then((vList) => {
      if (!isMounted) return;
      setVerses(vList);
      setLoading(false);
      setSelectedVerseIds(new Set());
    });

    return () => {
      isMounted = false;
    };
  }, [selectedBook, selectedChapter, selectedTranslation]);

  // Keyboard navigation for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const currentBookObj = books.find((b) => b.name === selectedBook);
      const maxChapters = currentBookObj?.chapters_count || 50;

      if (e.key === 'ArrowRight' && selectedChapter < maxChapters) {
        setSelectedChapter((c) => c + 1);
      } else if (e.key === 'ArrowLeft' && selectedChapter > 1) {
        setSelectedChapter((c) => c - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [books, selectedBook, selectedChapter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchBibleVerses(searchQuery.trim());
    setSearchResults(results);
  };

  const toggleVerseSelection = (id: string) => {
    const next = new Set(selectedVerseIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedVerseIds(next);
  };

  const copySelectedVerses = () => {
    const selected = verses.filter((v) => selectedVerseIds.has(v.id));
    if (selected.length === 0) return;

    const text = selected
      .map((v) => `[${v.reference}] ${v.verse_text}`)
      .join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const currentBookObj = books.find((b) => b.name === selectedBook);
  const totalChapters = currentBookObj?.chapters_count || 1;

  // Group books by testament
  const otBooks = books.filter((b) => b.testament === 'OT');
  const ntBooks = books.filter((b) => b.testament === 'NT');

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#FAF6EE] text-[#433422] border-[#EADFCB]',
    dark: 'bg-slate-900 text-slate-100 border-slate-800',
  }[readerTheme];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Holy Scriptures Reader"
        subtitle="Thy word is a lamp unto my feet, and a light unto my path. Explore the Old and New Testaments with cross-references and quiet contemplation."
        badge="Holy Bible"
        breadcrumbs={[{ label: 'Bible', href: '#bible' }, { label: `${selectedBook} ${selectedChapter}` }]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-6">
        {/* Navigation & Selector Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Book Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Book:</span>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  <optgroup label="Old Testament">
                    {otBooks.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="New Testament">
                    {ntBooks.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Chapter Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Chapter:</span>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                >
                  {Array.from({ length: totalChapters }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Translation Select */}
              {translations.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Version:</span>
                  <select
                    value={selectedTranslation}
                    onChange={(e) => {
                      setSelectedTranslation(e.target.value);
                      setHasManualTranslationOverride(true);
                      setFallbackNotice(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {translations.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} ({tr.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Reading Mode Theme Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setReaderTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  readerTheme === 'light' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('sepia')}
                className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  readerTheme === 'sepia'
                    ? 'bg-[#FAF6EE] shadow-xs text-[#433422]'
                    : 'text-slate-500'
                }`}
                title="Sepia Paper Mode"
              >
                <span className="w-4 h-4 rounded-full bg-[#EADFCB] inline-block" />
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  readerTheme === 'dark' ? 'bg-slate-900 shadow-xs text-white' : 'text-slate-500'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Search across Verses */}
          <form onSubmit={handleSearch} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scriptures (e.g. 'grace', 'Sabbath', 'faith')..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 cursor-pointer"
              >
                Back to Reader
              </button>
            )}
          </form>
        </div>

        {/* Gentle Language Fallback Notice */}
        {fallbackNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 text-[#DFB15B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{fallbackNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setFallbackNotice(null)}
              className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Results View */}
        {isSearching ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h3>

            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No verses found matching that query.
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedBook(v.book_name);
                      setSelectedChapter(v.chapter_number);
                      setIsSearching(false);
                    }}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-amber-500 transition-colors space-y-1"
                  >
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {v.reference}
                    </span>
                    <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200">
                      "{v.verse_text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Scripture Reader Main Container */
          <div
            className={`rounded-3xl p-6 sm:p-12 shadow-sm border transition-colors duration-300 space-y-8 ${themeClasses}`}
          >
            {/* Header: Book Title & Quick Navigation */}
            <div className="flex items-center justify-between border-b border-inherit pb-6">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                  {selectedBook} {selectedChapter}
                </h2>
                <span className="text-xs opacity-70">
                  Use left/right arrows to switch chapters
                </span>
              </div>

              {/* Chapter Prev / Next Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedChapter <= 1}
                  onClick={() => setSelectedChapter((c) => c - 1)}
                  className="p-2 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono font-semibold px-2">
                  {selectedChapter} / {totalChapters}
                </span>
                <button
                  type="button"
                  disabled={selectedChapter >= totalChapters}
                  onClick={() => setSelectedChapter((c) => c + 1)}
                  className="p-2 rounded-xl border border-inherit hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Verses Selection Actions Bar */}
            {selectedVerseIds.size > 0 && (
              <div className="sticky top-4 z-30 p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-lg flex items-center justify-between text-xs font-semibold animate-in fade-in">
                <span>{selectedVerseIds.size} verse(s) selected</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copySelectedVerses}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 text-white flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Verses'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVerseIds(new Set())}
                    className="px-2 py-1.5 text-slate-900 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Verse List */}
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              </div>
            ) : verses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Bible data not yet imported"
                message="Verses for this chapter will be available shortly after initial import."
              />
            ) : (
              <div className="font-serif text-lg sm:text-xl leading-relaxed space-y-4">
                {verses.map((verse) => {
                  const isSelected = selectedVerseIds.has(verse.id);
                  return (
                    <p
                      key={verse.id}
                      onClick={() => toggleVerseSelection(verse.id)}
                      className={`relative p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-500/20 ring-1 ring-amber-500/40'
                          : 'hover:bg-amber-500/5'
                      }`}
                    >
                      <sup className="text-xs font-sans font-bold text-amber-600 dark:text-amber-400 mr-2 select-none">
                        {verse.verse_number}
                      </sup>
                      <span>{verse.verse_text}</span>
                    </p>
                  );
                })}
              </div>
            )}

            {/* Chapter Footer Navigation */}
            <div className="flex items-center justify-between border-t border-inherit pt-6">
              <button
                type="button"
                disabled={selectedChapter <= 1}
                onClick={() => {
                  setSelectedChapter((c) => c - 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl border border-inherit text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <button
                type="button"
                disabled={selectedChapter >= totalChapters}
                onClick={() => {
                  setSelectedChapter((c) => c + 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl border border-inherit text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
