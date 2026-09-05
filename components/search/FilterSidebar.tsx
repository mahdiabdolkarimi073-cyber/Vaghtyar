'use client';

import { useState } from 'react';
import { ChevronDown, Star, X, Search } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface MetaCategory { id: number; name: string; slug: string; }
interface MetaNeighborhood { id: number; name: string; slug: string; }

interface FilterSidebarProps {
  categories: MetaCategory[];
  neighborhoods: MetaNeighborhood[];
  filters: {
    category: string;
    neighborhood: string;
    openNow: boolean;
    minRating: number;
    minPrice: number;
    maxPrice: number;
  };
  onFilterChange: (key: string, value: string | boolean | number | number[]) => void;
  onClear: () => void;
  activeCount: number;
}

export function FilterSidebar({
  categories,
  neighborhoods,
  filters,
  onFilterChange,
  onClear,
  activeCount,
}: FilterSidebarProps) {
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [sectionStates, setSectionStates] = useState<Record<string, boolean>>({
    category: true,
    neighborhood: true,
    openNow: true,
    rating: true,
    price: true,
  });

  const toggleSection = (key: string) =>
    setSectionStates((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.includes(neighborhoodSearch)
  );

  const ratingOptions = [
    { value: 0, label: 'همه' },
    { value: 3, label: '۳ به بالا' },
    { value: 4, label: '۴ به بالا' },
    { value: 4.5, label: '۴.۵ به بالا' },
  ];

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4" dir="rtl">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">فیلترها</h3>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:opacity-70"
          >
            <X className="h-3.5 w-3.5" />
            پاک کردن ({activeCount})
          </button>
        )}
      </div>

      <Separator className="mb-3" />

      {/* Category */}
      <Collapsible open={sectionStates.category} onOpenChange={() => toggleSection('category')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${sectionStates.category ? '' : '-rotate-90'}`} />
          <span className="text-sm font-bold text-slate-900">دسته‌بندی</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2 pb-3 pt-1">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={filters.category === ''}
                onCheckedChange={() => onFilterChange('category', '')}
              />
              <span className="text-sm text-slate-600">همه دسته‌ها</span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={filters.category === cat.slug}
                  onCheckedChange={() => onFilterChange('category', cat.slug)}
                />
                <span className="text-sm text-slate-600">{cat.name}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Neighborhood */}
      <Collapsible open={sectionStates.neighborhood} onOpenChange={() => toggleSection('neighborhood')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${sectionStates.neighborhood ? '' : '-rotate-90'}`} />
          <span className="text-sm font-bold text-slate-900">محله</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2 pb-3 pt-1">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={neighborhoodSearch}
                onChange={(e) => setNeighborhoodSearch(e.target.value)}
                placeholder="جستجوی محله..."
                className="h-9 pr-8 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              <label className="flex cursor-pointer items-center gap-2 py-1">
                <Checkbox
                  checked={filters.neighborhood === ''}
                  onCheckedChange={() => onFilterChange('neighborhood', '')}
                />
                <span className="text-sm text-slate-600">همه محله‌ها</span>
              </label>
              {filteredNeighborhoods.map((n) => (
                <label key={n.id} className="flex cursor-pointer items-center gap-2 py-1">
                  <Checkbox
                    checked={filters.neighborhood === n.slug}
                    onCheckedChange={() => onFilterChange('neighborhood', n.slug)}
                  />
                  <span className="text-sm text-slate-600">{n.name}</span>
                </label>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Open Now */}
      <Collapsible open={sectionStates.openNow} onOpenChange={() => toggleSection('openNow')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${sectionStates.openNow ? '' : '-rotate-90'}`} />
          <span className="text-sm font-bold text-slate-900">باز بودن الان</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex items-center justify-between pb-3 pt-1">
            <span className="text-sm text-slate-600">فقط باز الان</span>
            <Switch
              checked={filters.openNow}
              onCheckedChange={(checked) => onFilterChange('openNow', checked)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Min Rating */}
      <Collapsible open={sectionStates.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${sectionStates.rating ? '' : '-rotate-90'}`} />
          <span className="text-sm font-bold text-slate-900">امتیاز حداقل</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-1.5 pb-3 pt-1">
            {ratingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange('minRating', opt.value)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  filters.minRating === opt.value
                    ? 'bg-indigo-50 font-bold text-indigo-500'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.value > 0 && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                {opt.label}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range */}
      <Collapsible open={sectionStates.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${sectionStates.price ? '' : '-rotate-90'}`} />
          <span className="text-sm font-bold text-slate-900">محدوده قیمت</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-3 pb-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{'₮'.repeat(filters.maxPrice)}</span>
              <span>{'₮'.repeat(filters.minPrice)}</span>
            </div>
            <Slider
              min={1}
              max={3}
              step={1}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={(val) => onFilterChange('price', val)}
              className="py-2"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">گران‌ترین</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">ارزان‌ترین</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
