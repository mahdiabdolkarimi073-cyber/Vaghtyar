import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  let plans = await prisma.plan.findMany();
  if (plans.length === 0) {
    plans = await Promise.all([
      prisma.plan.create({ data: { name: 'رایگان', price: 0, maxStaff: 2, maxServices: 5, hasSms: false, hasReports: false, hasCustomSms: false, hasApi: false, hasPriority: false } }),
      prisma.plan.create({ data: { name: 'نقره', price: 99000, maxStaff: 5, maxServices: 20, hasSms: true, hasReports: true, hasCustomSms: false, hasApi: false, hasPriority: false } }),
      prisma.plan.create({ data: { name: 'طلایی', price: 199000, maxStaff: 15, maxServices: 50, hasSms: true, hasReports: true, hasCustomSms: true, hasApi: true, hasPriority: true } }),
      prisma.plan.create({ data: { name: 'پلاتین', price: 399000, maxStaff: 50, maxServices: 200, hasSms: true, hasReports: true, hasCustomSms: true, hasApi: true, hasPriority: true } }),
    ]);
  }
  return NextResponse.json(plans);
}
