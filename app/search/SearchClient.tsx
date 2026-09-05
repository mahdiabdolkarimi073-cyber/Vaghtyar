'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Map as MapIcon, X, Search } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { BusinessCard, BusinessCardSkeleton, type BusinessResult } from '@/components/search/BusinessCard';
import { Pagination } from '@/components/search/Pagination';
import { MapView } from '@/components/search/MapView';

type SortOption = 'nearest' | 'highest_rating' | 'cheapest' | 'newest';

interface MetaCategory { id: number; name: string; slug: string; }
interface MetaNeighborhood { id: number; name: string; slug: string; }

interface FilterState {
  q: string;
  category: string;
  neighborhood: string;
  openNow: boolean;
  minRating: number;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  page: number;
}

const DEFAULT_FILTERS: FilterState = {
  q: '',
  category: '',
  neighborhood: '',
  openNow: false,
  minRating: 0,
  minPrice: 1,
  maxPrice: 3,
  sortBy: 'highest_rating',
  page: 1,
};

function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.category) n++;
  if (f.neighborhood) n++;
  if (f.openNow) n++;
  if (f.minRating > 0) n++;
  if (f.minPrice > 1 || f.maxPrice < 3) n++;
  return n;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<MetaCategory[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<MetaNeighborhood[]>([]);
  const [, setCities] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [businesses, setBusinesses] = useState<BusinessResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    openNow: searchParams.get('openNow') === 'true',
    minRating: parseFloat(searchParams.get('minRating') || '0') || 0,
    minPrice: parseInt(searchParams.get('minPrice') || '1') || 1,
    maxPrice: parseInt(searchParams.get('maxPrice') || '3') || 3,
    sortBy: (searchParams.get('sortBy') as SortOption) || 'highest_rating',
    page: parseInt(searchParams.get('page') || '1') || 1,
  });

  // Fetch meta data
  useEffect(() => {
    fetch('/api/meta')
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setCities(d.cities || []);
        setNeighborhoods(d.neighborhoods || []);
      })
      .catch(() => {});
  }, []);

  // Update URL when filters change
  const updateUrl = useCallback((f: FilterState) => {
    const params = new URLSearchParams();
    if (f.q) params.set('q', f.q);
    if (f.category) params.set('category', f.category);
    if (f.neighborhood) params.set('neighborhood', f.neighborhood);
    if (f.openNow) params.set('openNow', 'true');
    if (f.minRating > 0) params.set('minRating', String(f.minRating));
    if (f.minPrice > 1) params.set('minPrice', String(f.minPrice));
    if (f.maxPrice < 3) params.set('maxPrice', String(f.maxPrice));
    if (f.sortBy !== 'highest_rating') params.set('sortBy', f.sortBy);
    if (f.page > 1) params.set('page', String(f.page));
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [router]);

  // Debounced fetch
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.category) params.set('category', filters.category);
      if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
      if (filters.openNow) params.set('openNow', 'true');
      if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
      if (filters.minPrice > 1) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice < 3) params.set('maxPrice', String(filters.maxPrice));
      params.set('sortBy', filters.sortBy);
      params.set('page', String(filters.page));
      params.set('limit', '12');

      fetch(`/api/search?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setBusinesses(d.businesses || []);
          setTotal(d.total || 0);
          setTotalPages(d.totalPages || 1);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update URL on filter change (without refetch, the effect above handles that)
  useEffect(() => {
    updateUrl(filters);
  }, [filters, updateUrl]);

  const handleFilterChange = (key: string, value: string | boolean | number | number[]) => {
    setFilters((prev) => {
      const next = { ...prev, page: 1 } as FilterState;
      if (key === 'price') {
        const [min, max] = value as number[];
        next.minPrice = min;
        next.maxPrice = max;
      } else if (key === 'openNow') {
        next.openNow = value as boolean;
      } else if (key === 'minRating') {
        next.minRating = value as unknown as number;
      } else {
        (next as unknown as Record<string, unknown>)[key] = value;
      }
      return next;
    });
  };

  const handleQueryChange = (q: string) => {
    setFilters((prev) => ({ ...prev, q, page: 1 }));
  };

  const handleSortChange = (sortBy: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy, page: 1 }));
  };

  const handleClear = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount = countActiveFilters(filters);

  return (
    <main className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header />

      {/* Sticky search bar */}
      <SearchBar
        query={filters.q}
        sortBy={filters.sortBy}
        onQueryChange={handleQueryChange}
        onSortChange={handleSortChange}
      />

      {/* Mobile filter toggle bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <SlidersHorizontal className="h-4 w-4" />
          فیلترها
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
        >
          <MapIcon className="h-4 w-4" />
          {showMap ? 'لیست' : 'نقشه'}
        </button>
      </div>

      {/* Main layout: sidebar + results */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-4 sm:p-6 lg:p-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20">
            <FilterSidebar
              categories={categories}
              neighborhoods={neighborhoods}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClear}
              activeCount={activeCount}
            />
          </div>
        </aside>

        {/* Results area */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600" dir="rtl">
              {loading ? 'در حال جستجو...' : `${total.toLocaleString('fa-IR')} نتیجه`}
            </span>
            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 lg:flex"
            >
              <MapIcon className="h-4 w-4" />
              {showMap ? 'بستن نقشه' : 'نمایش نقشه'}
            </button>
          </div>

          {/* Content: grid or grid+map */}
          {showMap ? (
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
                {loading
                  ? [1, 2, 3, 4].map((i) => <BusinessCardSkeleton key={i} />)
                  : businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
              </div>
              <div className="h-96 lg:h-auto lg:w-[400px]">
                <MapView businesses={businesses} onClose={() => setShowMap(false)} />
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => <BusinessCardSkeleton key={i} />)}
                </div>
              ) : businesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-900" dir="rtl">نتیجه‌ای یافت نشد</h3>
                  <p className="mt-2 text-sm text-slate-600" dir="rtl">فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.</p>
                  <button
                    onClick={handleClear}
                    className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
                    dir="rtl"
                  >
                    پاک کردن فیلترها
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {!loading && businesses.length > 0 && (
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              total={total}
              limit={12}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-xl" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">فیلترها</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              categories={categories}
              neighborhoods={neighborhoods}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClear}
              activeCount={activeCount}
            />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-lg bg-indigo-500 py-3 text-sm font-bold text-white"
            >
              نمایش نتایج
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
