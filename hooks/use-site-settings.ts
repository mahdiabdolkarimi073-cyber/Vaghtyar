'use client';

import { useState, useEffect } from 'react';

type SiteSettings = {
  site_name: string;
  site_tagline: string;
  site_logo: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  booking_fee: string;
};

const DEFAULTS: SiteSettings = {
  site_name: 'نوبت‌یار',
  site_tagline: 'رزرو آنلاین نوبت',
  site_logo: '',
  contact_phone: '',
  contact_email: '',
  contact_address: '',
  booking_fee: '0',
};

let cachedSettings: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

async function fetchSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/settings')
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => {
      cachedSettings = { ...DEFAULTS, ...data };
      return cachedSettings;
    })
    .catch(() => {
      return DEFAULTS;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || DEFAULTS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetchSettings().then((s) => {
      if (active) {
        setSettings(s);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  return { settings, loading };
}

export function getSiteNameSync(): string {
  return cachedSettings?.site_name || DEFAULTS.site_name;
}

export function getSiteLogoSync(): string {
  return cachedSettings?.site_logo || DEFAULTS.site_logo;
}
