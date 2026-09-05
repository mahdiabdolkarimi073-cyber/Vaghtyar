import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingFlowClient } from './BookingFlowClient';
import type { SalonApiResponse } from '@/lib/salon-types';

export const revalidate = 0;

async function getSalon(businessName: string): Promise<SalonApiResponse | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/salon/${encodeURIComponent(businessName)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as SalonApiResponse;
  } catch {
    return null;
  }
}

export default async function BookingPage({ params }: { params: { businessName: string } }) {
  const data = await getSalon(params.businessName);
  if (!data) notFound();

  return (
    <main className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header />
      <BookingFlowClient data={data} />
      <Footer />
    </main>
  );
}
