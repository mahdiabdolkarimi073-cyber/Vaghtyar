'use client';

import { useEffect, useRef } from 'react';

// We use a dynamic import wrapper in the parent page to avoid SSR issues with Leaflet.
// This component is only loaded client-side.
export default function MapView({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (cancelled || !mapRef.current) return;
      const L = (await import('leaflet')).default;

      // Fix default icon paths for Leaflet in bundlers
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Import CSS
      if (!(document.querySelector('link[href*="leaflet.css"]'))) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
      }

      const map = L.map(mapRef.current).setView([lat, lng], 14);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '350px' }} />;
}
