import { prisma } from '@/lib/prisma';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { Stats } from '@/components/home/stats';
import { Categories } from '@/components/home/categories';
import { Featured } from '@/components/home/featured';
import { NewBusinesses } from '@/components/home/new-businesses';
import { WhyCustomer } from '@/components/home/why';
import { WhyBusiness } from '@/components/home/why-business';
import { Reviews } from '@/components/home/reviews';
import { Faq } from '@/components/home/faq';

export const dynamic = 'force-dynamic';

const COVER_IMAGES: Record<string, string> = {
  'salamat-clinic': 'https://images.pexels.com/photos/5355863/pexels-photo-5355863.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'dorakhshan-dental': 'https://images.pexels.com/photos/4269268/pexels-photo-4269268.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'artin-beauty-salon': 'https://images.pexels.com/photos/26832816/pexels-photo-26832816.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'aramesh-spa': 'https://images.pexels.com/photos/6187418/pexels-photo-6187418.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'parsian-gold-gym': 'https://images.pexels.com/photos/6628962/pexels-photo-6628962.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'farvardin-restaurant': 'https://images.pexels.com/photos/39047893/pexels-photo-39047893.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'lahzeh-studio': 'https://images.pexels.com/photos/6502543/pexels-photo-6502543.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'novin-counseling': 'https://images.pexels.com/photos/7156125/pexels-photo-7156125.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'mehregan-dental': 'https://images.pexels.com/photos/4269277/pexels-photo-4269277.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'golestan-beauty': 'https://images.pexels.com/photos/3037215/pexels-photo-3037215.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  'asia-sport-club': 'https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
};

export default async function HomePage() {
  const [categories, cities, featuredBusinesses, newBusinesses, reviews, faqs, stats] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.city.findMany({ orderBy: { id: 'asc' } }),
    prisma.business.findMany({
      where: { isFeatured: true },
      include: { category: true, neighborhood: true, city: true },
      take: 4,
      orderBy: { rating: 'desc' },
    }),
    prisma.business.findMany({
      include: { category: true, neighborhood: true, city: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({ orderBy: { id: 'desc' } }),
    prisma.faq.findMany({ orderBy: { order: 'asc' } }),
    Promise.all([
      prisma.business.count(),
      prisma.business.aggregate({ _sum: { appointmentCount: true } }),
      prisma.city.count(),
    ]),
  ]);

  const totalAppointments = stats[1]._sum.appointmentCount || 0;
  const totalCustomers = Math.floor(totalAppointments * 0.7);

  const featuredWithImages = featuredBusinesses.map((b) => ({
    ...b,
    coverImage: COVER_IMAGES[b.slug] || 'https://images.pexels.com/photos/26832816/pexels-photo-26832816.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  }));

  const newWithImages = newBusinesses.map((b) => ({
    ...b,
    coverImage: COVER_IMAGES[b.slug] || 'https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&w=940&h=500',
  }));

  return (
    <main className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <Header />
      <Hero categories={categories} cities={cities} />
      <Stats
        businessCount={12548}
        appointmentCount={356287}
        cityCount={87}
        customerCount={248376}
      />
      <Categories categories={categories} />
      <Featured businesses={featuredWithImages} />
      <NewBusinesses businesses={newWithImages} />
      <WhyCustomer />
      <WhyBusiness />
      <Reviews reviews={reviews} />
      <Faq faqs={faqs} />
      <Footer />
    </main>
  );
}
