'use client';

import { Search, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SortOption = 'nearest' | 'highest_rating' | 'cheapest' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  nearest: 'نزدیک‌ترین',
  highest_rating: 'بالاترین امتیاز',
  cheapest: 'ارزان‌ترین',
  newest: 'جدیدترین',
};

interface SearchBarProps {
  query: string;
  sortBy: SortOption;
  onQueryChange: (q: string) => void;
  onSortChange: (s: SortOption) => void;
}

export function SearchBar({ query, sortBy, onQueryChange, onSortChange }: SearchBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 lg:px-8">
      {/* Search input */}
      <div className="relative flex flex-1 items-center">
        <Search className="absolute right-3 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="جستجوی کسب‌وکار، خدمت..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-11 pl-10 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
          dir="rtl"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute left-3 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort dropdown */}
      <div ref={sortRef} className="relative">
        <button
          onClick={() => setSortOpen(!sortOpen)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          dir="rtl"
        >
          <span className="hidden sm:inline text-slate-400">مرتب‌سازی:</span>
          <span>{SORT_LABELS[sortBy]}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
        </button>
        {sortOpen && (
          <div className="absolute left-0 top-full mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSortChange(opt);
                  setSortOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                  sortBy === opt ? 'font-bold text-indigo-500' : 'text-slate-700'
                }`}
                dir="rtl"
              >
                {SORT_LABELS[opt]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
