import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BusinessCard from '@/components/BusinessCard';
import { toPersianDigits } from '@/lib/constants';
import type { Metadata } from 'next';

interface Props { params: { citySlug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await prisma.city.findUnique({ where: { slug: params.citySlug } });
  if (!city) return { title: 'شهر یافت نشد | نوبت‌یار' };
  return {
    title: `رزرو نوبت در ${city.name}`,
    description: `لیست سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌های ${city.name}. نوبت خود را آنلاین و بدون انتظار رزرو کنید.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir'}/city/${params.citySlug}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const city = await prisma.city.findUnique({ where: { slug: params.citySlug } });
  if (!city) notFound();

  const businesses = await prisma.business.findMany({
    where: { city: params.citySlug },
    include: { services: { select: { price: true } }, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const categoriesInCity = await prisma.business.findMany({
    where: { city: params.citySlug },
    select: { category: true },
    distinct: ['category'],
  });
  const categories = await prisma.category.findMany({
    where: { slug: { in: categoriesInCity.map(b => b.category) } },
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

  const cityJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `رزرو نوبت در ${city.name}`,
    description: `لیست سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌های ${city.name}`,
    inLanguage: 'fa-IR',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir'}/city/${params.citySlug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'نوبت‌یار',
    },
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd) }}
      />
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">رزرو نوبت در {city.name}</h1>
        <p className="text-primary-foreground/80 text-lg">سالن‌های زیبایی، کلینیک‌ها و آرایشگاه‌های {city.name} را پیدا کنید و آنلاین نوبت رزرو کنید.</p>
      </div>

      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">دسته‌بندی‌ها در {city.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} href={`/${params.citySlug}/${cat.slug}`} className="bg-surface rounded-2xl border border-border p-5 text-center hover:shadow-lg hover:border-primary/30 transition-all hover:-translate-y-1">
                <h3 className="font-medium text-text-secondary">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 text-text-muted text-sm">
        <MapPin className="w-4 h-4" /> {toPersianDigits(businessData.length)} کسب‌وکار در {city.name}
      </div>

      {businessData.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center text-text-muted">
          هنوز کسب‌وکاری در این شهر ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessData.map(b => <BusinessCard key={b.id} business={b} />)}
        </div>
      )}
    </div>
  );
}
