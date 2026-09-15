import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BusinessCard from '@/components/BusinessCard';
import { toPersianDigits } from '@/lib/constants';
import type { Metadata } from 'next';

interface Props { params: { citySlug: string; categorySlug: string } }

async function getSiteName() {
  try {
    const s = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    return s?.value || 'نوبت‌یار';
  } catch { return 'نوبت‌یار'; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await prisma.city.findUnique({ where: { slug: params.citySlug } });
  const category = await prisma.category.findUnique({ where: { slug: params.categorySlug } });
  const siteName = await getSiteName();
  if (!city || !category) return { title: `یافت نشد | ${siteName}` };
  return {
    title: `${category.name} در ${city.name}`,
    description: `لیست ${category.name}های ${city.name}. نوبت خود را آنلاین و بدون انتظار رزرو کنید.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir'}/${params.citySlug}/${params.categorySlug}`,
    },
  };
}

export default async function CityCategoryPage({ params }: Props) {
  const city = await prisma.city.findUnique({ where: { slug: params.citySlug } });
  const category = await prisma.category.findUnique({ where: { slug: params.categorySlug } });
  if (!city || !category) notFound();
  const siteName = await getSiteName();

  const businesses = await prisma.business.findMany({
    where: { city: params.citySlug, category: params.categorySlug },
    include: { services: { select: { price: true } }, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const businessData = businesses.map(b => {
    const avgRating = b.reviews.length > 0 ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 0;
    const minPrice = b.services.length > 0 ? Math.min(...b.services.map(s => s.price)) : 0;
    return {
      id: b.id, slug: b.slug, name: b.name, category: b.category, city: b.city,
      neighborhood: b.neighborhood, coverImage: b.coverImage, profileImage: b.profileImage,
      isVerified: b.isVerified, isFeatured: b.isFeatured, autoConfirm: b.autoConfirm,
      minAdvanceBookingHours: b.minAdvanceBookingHours, createdAt: b.createdAt.toISOString(),
      ownerId: b.ownerId,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: b.reviews.length,
      minPrice,
    };
  });

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} در ${city.name}`,
    description: `لیست ${category.name}های ${city.name}. نوبت خود را آنلاین رزرو کنید.`,
    inLanguage: 'fa-IR',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir'}/${params.citySlug}/${params.categorySlug}`,
    isPartOf: { '@type': 'WebSite', name: siteName },
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <nav className="text-sm text-text-muted mb-4 flex items-center gap-2">
        <Link href="/" className="hover:text-primary">خانه</Link>
        <span>/</span>
        <Link href={`/city/${params.citySlug}`} className="hover:text-primary">{city.name}</Link>
        <span>/</span>
        <span className="text-text-secondary">{category.name}</span>
      </nav>

      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{category.name} در {city.name}</h1>
        <p className="text-primary-foreground/80 text-lg">بهترین {category.name}های {city.name} را پیدا کنید و بدون انتظار نوبت رزرو کنید.</p>
      </div>

      <div className="mb-4 flex items-center gap-2 text-text-muted text-sm">
        <MapPin className="w-4 h-4" /> {toPersianDigits(businessData.length)} {category.name} در {city.name}
      </div>

      {businessData.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center text-text-muted">
          هنوز {category.name}ای در {city.name} ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessData.map(b => <BusinessCard key={b.id} business={b} />)}
        </div>
      )}
    </div>
  );
}
