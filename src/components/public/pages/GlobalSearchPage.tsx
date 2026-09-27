import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, Sun, Calendar, ArrowRight } from 'lucide-react';
import { PageHero } from '../PageHero';
import { SearchBar } from '../SearchBar';
import { EmptyState } from '../EmptyState';
import { executeGlobalPublicSearch } from '../../../lib/publicQueries';
import { GlobalSearchResult } from '../../../types/public';

interface GlobalSearchPageProps {
  initialQuery?: string;
  onNavigateItem: (type: string, id: string) => void;
}

export const GlobalSearchPage: React.FC<GlobalSearchPageProps> = ({
  initialQuery = '',
  onNavigateItem,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const runSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const data = await executeGlobalPublicSearch(term.trim());
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const filteredResults =
    filterType === 'all' ? results : results.filter((r) => r.type === filterType);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'teaching':
        return BookOpen;
      case 'sermon':
        return Video;
      case 'devotional':
        return Sun;
      case 'event':
        return Calendar;
      case 'bible':
        return BookOpen;
      default:
        return Search;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <PageHero
        title="Sanctuary Search"
        subtitle="Search across teachings, sermons, devotionals, upcoming events, and the Holy Scriptures."
        badge="Universal Search"
        breadcrumbs={[{ label: 'Search' }]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20 space-y-6">
        {/* Search Input Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search by topic, keyword, title, speaker, or scripture..."
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {results.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 mr-2">Filter by:</span>
              {['all', 'teaching', 'sermon', 'devotional', 'event', 'bible'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize cursor-pointer transition-colors ${
                    filterType === t
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : query && filteredResults.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No results found for "${query}"`}
            message="Try searching with different keywords or check spelling."
          />
        ) : (
          <div className="space-y-3">
            {filteredResults.map((item) => {
              const IconComp = getIconForType(item.type);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => onNavigateItem(item.type, item.slug || item.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 transition-all cursor-pointer group shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{item.type}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>

                  {item.snippet && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-light line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
