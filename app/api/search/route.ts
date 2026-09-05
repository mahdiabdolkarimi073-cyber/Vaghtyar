import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BusinessRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  priceLevel: number;
  address: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  category: { id: number; name: string; slug: string };
  neighborhood: { id: number; name: string; slug: string } | null;
  city: { id: number; name: string; slug: string };
  services: { id: number; name: string; price: number; durationMin: number }[];
  workingHours: { id: number; dayOfWeek: number; openTime: string; closeTime: string }[];
}

function isCurrentlyOpen(wh: { dayOfWeek: number; openTime: string; closeTime: string }[]): boolean {
  const now = new Date();
  // getDay: 0=Sun..6=Sat. Iran working week: Saturday(6)=0 ... Friday(5)=6
  const jsDay = now.getDay();
  const iranianDayMap = [5, 6, 0, 1, 2, 3, 4]; // Sun→5(Fri), Mon→6(Sat), ... Sat→6
  const today = iranianDayMap[jsDay];

  const todayHours = wh.find((h) => h.dayOfWeek === today);
  if (!todayHours) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = todayHours.openTime.split(':').map(Number);
  const [ch, cm] = todayHours.closeTime.split(':').map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  return currentMinutes >= openMin && currentMinutes < closeMin;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const neighborhood = searchParams.get('neighborhood') || undefined;
  const city = searchParams.get('city') || undefined;
  const openNow = searchParams.get('openNow') === 'true';
  const minRating = parseFloat(searchParams.get('minRating') || '0') || 0;
  const minPrice = parseInt(searchParams.get('minPrice') || '1') || 1;
  const maxPrice = parseInt(searchParams.get('maxPrice') || '3') || 3;
  const sortBy = searchParams.get('sortBy') || 'highest_rating';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12') || 12));

  const where: Record<string, unknown> = {};

  if (category) where.category = { slug: category };
  if (neighborhood) where.neighborhood = { slug: neighborhood };
  if (city) where.city = { slug: city };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (minRating > 0) where.rating = { gte: minRating };
  if (minPrice > 1 || maxPrice < 3) {
    where.AND = [
      { priceLevel: { gte: minPrice } },
      { priceLevel: { lte: maxPrice } },
    ];
  }

  const orderBy: Record<string, string> = { rating: 'desc' };
  if (sortBy === 'newest') orderBy.createdAt = 'desc';
  if (sortBy === 'highest_rating') orderBy.rating = 'desc';
  if (sortBy === 'cheapest') orderBy.priceLevel = 'asc';
  if (sortBy === 'nearest') orderBy.rating = 'desc';

  const allBusinesses = await prisma.business.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      neighborhood: { select: { id: true, name: true, slug: true } },
      city: { select: { id: true, name: true, slug: true } },
      services: { select: { id: true, name: true, price: true, durationMin: true }, take: 3, orderBy: { id: 'asc' } },
      workingHours: { select: { id: true, dayOfWeek: true, openTime: true, closeTime: true } },
    },
    orderBy,
  });

  let filtered = allBusinesses as unknown as BusinessRow[];

  if (openNow) {
    filtered = filtered.filter((b) => isCurrentlyOpen(b.workingHours));
  }

  const featured = filtered.filter((b) => b.isFeatured);
  const regular = filtered.filter((b) => !b.isFeatured);
  const ordered = [...featured, ...regular];

  const total = ordered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paged = ordered.slice(start, start + limit);

  return NextResponse.json({
    businesses: paged,
    total,
    page,
    totalPages,
    limit,
  });
}
