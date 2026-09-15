import { prisma } from './prisma';
import type { Category, City, Advertisement } from './types';

export interface HomeData {
  categories: Category[];
  featured: HomeBusiness[];
  recent: HomeBusiness[];
  banners: Advertisement[];
  featuredAds: Advertisement[];
  cities: City[];
}

export interface HomeBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  neighborhood?: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  autoConfirm: boolean;
  minAdvanceBookingHours: number;
  createdAt: string;
  ownerId: string;
  avgRating: number;
  reviewCount: number;
  minPrice: number;
  isOpenNow?: boolean;
}

export async function getHomeData(): Promise<HomeData> {
  try {
    const [categories, featuredRaw, recentRaw, ads] = await Promise.all([
      prisma.category.findMany().catch(() => []),
      prisma.business.findMany({
        where: { isFeatured: true, status: 'APPROVED' },
        include: { services: { select: { price: true } }, reviews: { select: { rating: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.business.findMany({
        where: { status: 'APPROVED' },
        include: { services: { select: { price: true } }, reviews: { select: { rating: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }).catch(() => []),
      prisma.advertisement.findMany({
        where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
        include: {
          business: {
            select: {
              id: true, name: true, slug: true, profileImage: true,
              coverImage: true, neighborhood: true, city: true,
            },
          },
        },
      }).catch(() => []),
    ]);

    const cities = await prisma.city.findMany().catch(() => []);

    const mapBusiness = (b: typeof featuredRaw[number]): HomeBusiness => {
      const avgRating = b.reviews.length > 0
        ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
        : 0;
      const minPrice = b.services.length > 0
        ? Math.min(...b.services.map((s) => s.price))
        : 0;
      return {
        id: b.id, slug: b.slug, name: b.name, category: b.category,
        city: b.city, neighborhood: b.neighborhood, coverImage: b.coverImage,
        profileImage: b.profileImage, isFeatured: b.isFeatured, isVerified: b.isVerified,
        autoConfirm: b.autoConfirm, minAdvanceBookingHours: b.minAdvanceBookingHours,
        createdAt: b.createdAt.toISOString(), ownerId: b.ownerId,
        avgRating: Math.round(avgRating * 10) / 10, reviewCount: b.reviews.length, minPrice,
      };
    };

    return {
      categories: categories as Category[],
      featured: featuredRaw.map(mapBusiness),
      recent: recentRaw.map(mapBusiness),
      banners: (ads as Advertisement[]).filter((a) => a.type === 'BANNER'),
      featuredAds: (ads as Advertisement[]).filter((a) => a.type === 'FEATURED'),
      cities: cities as City[],
    };
  } catch {
    return { categories: [], featured: [], recent: [], banners: [], featuredAds: [], cities: [] };
  }
}
