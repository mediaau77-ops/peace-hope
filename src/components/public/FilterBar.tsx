import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  categories?: FilterOption[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  sortOptions?: FilterOption[];
  selectedSort?: string;
  onSelectSort?: (sort: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  sortOptions = [],
  selectedSort,
  onSelectSort,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 py-3 border-b border-slate-200/80 dark:border-slate-800 ${className}`}
    >
      {/* Category Pills */}
      {categories.length > 0 && onSelectCategory && (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onSelectCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Sort Dropdown */}
      {sortOptions.length > 0 && onSelectSort && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </span>
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="text-xs py-1.5 pl-2.5 pr-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
