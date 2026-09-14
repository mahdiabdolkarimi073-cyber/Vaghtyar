import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nobetyar.ir';

interface Props {
  slug: string;
}

export default async function SalonJsonLd({ slug }: Props) {
  let business;
  try {
    business = await prisma.business.findUnique({
      where: { slug },
      include: {
        services: { select: { name: true, price: true, durationMinutes: true } },
        reviews: { select: { rating: true, comment: true, customerName: true, createdAt: true } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
  } catch {
    return null;
  }

  if (!business) return null;

  const avgRating =
    business.reviews.length > 0
      ? business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length
      : 0;

  const dayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const openingHours = business.hours
    .filter((h) => !h.isClosed)
    .map((h) => {
      const day = dayNames[h.dayOfWeek] || '';
      return `${day} ${h.openTime}-${h.closeTime}`;
    });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    '@id': `${SITE_URL}/salon/${business.slug}`,
    name: business.name,
    description: business.description || undefined,
    image: business.coverImage || undefined,
    url: `${SITE_URL}/salon/${business.slug}`,
    telephone: business.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: business.city,
      addressRegion: business.neighborhood || undefined,
      streetAddress: business.address || undefined,
      addressCountry: 'IR',
    },
    ...(avgRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: business.reviews.length,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(business.services.length > 0 && {
      makesOffer: business.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.name,
        },
        price: s.price,
        priceCurrency: 'IRR',
      })),
    }),
    ...(openingHours.length > 0 && { openingHours }),
    ...(business.reviews.length > 0 && {
      review: business.reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.customerName },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: '5' },
        ...(r.comment && { reviewBody: r.comment }),
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
