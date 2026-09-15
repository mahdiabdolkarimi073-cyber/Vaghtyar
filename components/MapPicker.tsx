'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  businessName?: string;
}

export default function MapPicker({ latitude, longitude, onLocationSelect, businessName }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const defaultCenter: [number, number] = latitude && longitude ? [latitude, longitude] : [30.2839, 57.0833];

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (cancelled || !mapRef.current) return;
      const L = (await import('leaflet')).default;

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!(document.querySelector('link[href*="leaflet.css"]'))) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }

      const map = L.map(mapRef.current).setView(defaultCenter, 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Add marker if initial position exists
      if (latitude && longitude) {
        const marker = L.marker([latitude, longitude]).addTo(map);
        if (businessName) marker.bindPopup(businessName).openPopup();
        markerRef.current = marker;
      }

      // Click to set location
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (markerRef.current) {
          (markerRef.current as { remove: () => void }).remove();
        }

        const marker = L.marker([lat, lng]).addTo(map);
        if (businessName) marker.bindPopup(businessName).openPopup();
        markerRef.current = marker;

        onLocationSelect(lat, lng);
      });
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ir`,
        { headers: { 'Accept-Language': 'fa' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        const L = (await import('leaflet')).default;
        const map = mapInstanceRef.current as { setView: (c: [number, number], z: number) => void } | null;
        if (map) {
          map.setView([lat, lng], 16);
          if (markerRef.current) {
            (markerRef.current as { remove: () => void }).remove();
          }
          const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current as never);
          if (businessName) marker.bindPopup(businessName).openPopup();
          markerRef.current = marker;
        }
        onLocationSelect(lat, lng);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="جستجوی آدرس..."
          className="flex-1 h-11 rounded-xl border border-border px-4 text-sm bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 h-11 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {searching ? '...' : 'جستجو'}
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: '400px' }}>
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
      </div>

      {/* Coordinates display */}
      {latitude && longitude ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary bg-muted rounded-lg px-4 py-2">
          <span className="text-primary font-medium">موقعیت انتخاب شده:</span>
          <span dir="ltr">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center">روی نقشه کلیک کنید تا موقعیت کسب‌وکار خود را مشخص کنید</p>
      )}
    </div>
  );
}
