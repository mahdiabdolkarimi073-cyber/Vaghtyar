'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import type { Category, City } from '@/lib/types';

export default function SearchBar() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch<{ categories: Category[] }>('/api/categories'),
      apiFetch<{ cities: City[] }>('/api/cities'),
    ]).then(([catRes, cityRes]) => {
      setCategories(catRes.categories);
      setCities(cityRes.cities);
    }).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (neighborhood) params.set('neighborhood', neighborhood);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card-hover p-4 md:p-6 flex flex-col md:flex-row gap-3 border border-border">
      <div className="flex-1">
        <label className="text-xs text-text-secondary mb-1 block">دسته‌بندی</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-12 rounded-xl border border-border px-4 text-text-primary bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        >
          <option value="">همه دسته‌ها</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="text-xs text-text-secondary mb-1 block">شهر</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full h-12 rounded-xl border border-border px-4 text-text-primary bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        >
          <option value="">همه شهرها</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="text-xs text-text-secondary mb-1 block">محله</label>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="نام محله..."
            className="w-full h-12 rounded-xl border border-border pr-10 px-4 text-text-primary bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-end">
        <Button
          onClick={handleSearch}
          className="h-12 px-8 gap-2 w-full md:w-auto"
        >
          <Search className="w-5 h-5" />
          جستجو
        </Button>
      </div>
    </div>
  );
}
