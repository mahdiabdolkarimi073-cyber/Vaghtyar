import { NextRequest, NextResponse } from 'next/server';
import { getBookingContext } from '@/lib/booking';

export async function GET(request: NextRequest) {
  const rawServiceId = new URL(request.url).searchParams.get('serviceId');
  const serviceId = Number(rawServiceId);
  if (!rawServiceId || !Number.isInteger(serviceId) || serviceId < 1) return NextResponse.json({ error: 'شناسه خدمت معتبر نیست.' }, { status: 400 });

  try {
    const service = await getBookingContext(serviceId);
    if (!service) return NextResponse.json({ error: 'خدمت مورد نظر پیدا نشد.' }, { status: 404 });
    return NextResponse.json({
      employees: [
        { id: 'anyone', name: 'هر کسی که خالی باشد', photo: null, specialization: 'اولین کارمند خالی' },
        ...service.business.staff.map((staff) => ({ id: staff.id, name: staff.name, photo: staff.photo, specialization: staff.role })),
      ],
      service: { id: service.id, name: service.name, durationMin: service.durationMin },
      business: { name: service.business.name, address: service.business.address, slug: service.business.slug },
    });
  } catch {
    return NextResponse.json({ error: 'دریافت فهرست کارمندان با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}
