'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, MapPin, Star, Clock, X } from 'lucide-react';
import BusinessCard from '@/components/BusinessCard';
import { apiFetch } from '@/lib/api';
import { toPersianDigits } from '@/lib/constants';
import type { Business, Category, City } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') || '');
  const [isOpen, setIsOpen] = useState(searchParams.get('isOpen') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>('/api/categories').then(r => setCategories(r.categories)).catch(() => {});
    apiFetch<{ cities: City[] }>('/api/cities').then(r => setCities(r.cities)).catch(() => {});
  }, []);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (neighborhood) params.set('neighborhood', neighborhood);
    if (isOpen) params.set('isOpen', 'true');
    if (minRating) params.set('minRating', minRating);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));

    try {
      const data = await apiFetch<{ businesses: Business[]; pagination: typeof pagination }>(`/api/businesses?${params.toString()}`);
      setBusinesses(data.businesses);
      setPagination(data.pagination);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [category, city, neighborhood, isOpen, minRating, maxPrice, sort, page]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (neighborhood) params.set('neighborhood', neighborhood);
    if (isOpen) params.set('isOpen', 'true');
    if (minRating) params.set('minRating', minRating);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort) params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    router.push(`/search?${params.toString()}`);
  };

  const applyFilters = () => {
    setPage(1);
    setShowFilters(false);
    updateUrl();
  };

  const clearFilters = () => {
    setCategory(''); setCity(''); setNeighborhood(''); setIsOpen(false);
    setMinRating(''); setMaxPrice(''); setSort('newest'); setPage(1);
    router.push('/search');
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6">
      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">همه دسته‌ها</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">همه شهرها</option>
          {cities.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <input type="text" placeholder="محله..." value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 flex-1" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500">
          <option value="newest">جدیدترین</option>
          <option value="rating">بالاترین امتیاز</option>
          <option value="price">ارزان‌ترین</option>
        </select>
        <Button onClick={applyFilters} className="bg-teal-600 hover:bg-teal-700 text-white h-11 px-6">جستجو</Button>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-11 gap-2 md:hidden">
          <SlidersHorizontal className="w-4 h-4" /> فیلتر
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">فیلترها</h3>
              <button onClick={clearFilters} className="text-xs text-teal-600 hover:text-teal-700">پاک کردن</button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">باز الان</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} className="w-4 h-4 rounded accent-teal-600" />
                <span className="text-sm text-gray-600">فقط بازها</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">حداقل امتیاز</label>
              <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">همه</option>
                <option value="3">۳ ستاره و بالاتر</option>
                <option value="4">۴ ستاره و بالاتر</option>
                <option value="4.5">۴.۵ ستاره و بالاتر</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">حداکثر قیمت (تومان)</label>
              <input type="number" placeholder="مثلا ۲۰۰۰۰۰" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <Button onClick={applyFilters} className="w-full bg-teal-600 hover:bg-teal-700 text-white">اعمال فیلتر</Button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 text-gray-500 text-sm">
            {loading ? 'در حال جستجو...' : `${toPersianDigits(pagination.total)} کسب‌وکار یافت شد`}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">کسب‌وکاری یافت نشد</h3>
              <p className="text-gray-400 text-sm">فیلترها را تغییر دهید یا دوباره جستجو کنید.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map(b => <BusinessCard key={b.id} business={b} />)}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); updateUrl(); window.scrollTo(0, 0); }}
                      className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                        p === page ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {toPersianDigits(p)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
