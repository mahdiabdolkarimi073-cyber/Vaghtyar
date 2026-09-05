'use client';

import { MapPin, X } from 'lucide-react';
import type { BusinessResult } from './BusinessCard';

interface MapViewProps {
  businesses: BusinessResult[];
  onClose: () => void;
}

export function MapView({ businesses, onClose }: MapViewProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100" dir="rtl">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow transition-colors hover:bg-slate-50"
        aria-label="بستن نقشه"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Placeholder map surface */}
      <div
        className="h-full w-full"
        style={{
          backgroundImage: `linear-gradient(135deg, #e2e8f0 25%, #f1f5f9 25%, #f1f5f9 50%, #e2e8f0 50%, #e2e8f0 75%, #f1f5f9 75%, #f1f5f9 100%)`,
          backgroundSize: '40px 40px',
        }}
      >
        {/* Faux roads */}
        <div className="absolute right-0 top-1/3 h-1 w-full bg-white/70" />
        <div className="absolute left-1/4 top-0 h-full w-1 bg-white/70" />
        <div className="absolute right-1/3 top-0 h-full w-0.5 bg-white/50" />
        <div className="absolute right-0 bottom-1/4 h-0.5 w-full bg-white/50" />
      </div>

      {/* Markers */}
      {businesses.slice(0, 12).map((biz, i) => {
        const top = 15 + ((i * 37) % 60);
        const left = 10 + ((i * 53) % 70);
        return (
          <div
            key={biz.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
                {biz.name}
              </div>
              <MapPin className="h-6 w-6 text-indigo-500 drop-shadow" fill="white" />
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow backdrop-blur">
        {businesses.length} کسب‌وکار روی نقشه
      </div>
    </div>
  );
}
