import { prisma } from './prisma';

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_logo: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'نوبت‌یار',
  site_tagline: 'رزرو آنلاین نوبت',
  site_logo: '',
  contact_phone: '',
  contact_email: '',
  contact_address: '',
};

let cachedSettings: SiteSettings | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cachedSettings && Date.now() - cacheTime < CACHE_TTL) {
    return cachedSettings;
  }

  try {
    const PUBLIC_KEYS = ['site_name', 'site_tagline', 'site_logo', 'contact_phone', 'contact_email', 'contact_address'];
    const settings = await prisma.setting.findMany({ where: { key: { in: PUBLIC_KEYS } } });
    const result: Record<string, string> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    cachedSettings = { ...DEFAULT_SETTINGS, ...result };
    cacheTime = Date.now();
    return cachedSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
