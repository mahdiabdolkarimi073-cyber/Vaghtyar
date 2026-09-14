import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/register-business`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  ];

  try {
    const [cities, categories, businesses] = await Promise.all([
      prisma.city.findMany(),
      prisma.category.findMany(),
      prisma.business.findMany({
        where: { status: 'APPROVED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
      url: `${SITE_URL}/city/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const cityCategoryPages: MetadataRoute.Sitemap = [];
    for (const city of cities) {
      for (const cat of categories) {
        cityCategoryPages.push({
          url: `${SITE_URL}/${city.slug}/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    const businessPages: MetadataRoute.Sitemap = businesses.map((b) => ({
      url: `${SITE_URL}/salon/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...cityPages, ...cityCategoryPages, ...businessPages];
  } catch {
    return staticPages;
  }
}
