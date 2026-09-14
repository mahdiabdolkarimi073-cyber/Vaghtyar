import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import SalonJsonLd from './SalonJsonLd';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let business;
  try {
    business = await prisma.business.findUnique({
      where: { slug: params.slug },
      include: {
        services: { select: { name: true, price: true, durationMinutes: true } },
        reviews: { select: { rating: true } },
      },
    });
  } catch {
    return { title: 'کسب‌وکار' };
  }

  if (!business) {
    return {
      title: 'کسب‌وکار یافت نشد',
      robots: { index: false, follow: false },
    };
  }

  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length
      : 0;

  const title = `${business.name} | رزرو نوبت آنلاین`;
  const description = business.description
    ? `${business.description.slice(0, 150)}`
    : `${business.name} در ${business.city}${business.neighborhood ? `، ${business.neighborhood}` : ''}. رزرو آنلاین نوبت بدون انتظار.`;

  const serviceNames = business.services.map((s) => s.name).join('، ');

  return {
    title,
    description,
    keywords: [business.name, business.category, business.city, 'رزرو نوبت', ...(serviceNames ? [serviceNames] : [])],
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: 'نوبت‌یار',
      title,
      description,
      url: `${SITE_URL}/salon/${business.slug}`,
      ...(business.coverImage && { images: [{ url: business.coverImage, alt: business.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(business.coverImage && { images: [business.coverImage] }),
    },
    alternates: {
      canonical: `${SITE_URL}/salon/${business.slug}`,
    },
  };
}

export default async function SalonLayout({ params, children }: Props) {
  return (
    <>
      <SalonJsonLd slug={params.slug} />
      {children}
    </>
  );
}
