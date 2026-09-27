import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-xs"
      />
      {localValue && (
        <button
          type="button"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
