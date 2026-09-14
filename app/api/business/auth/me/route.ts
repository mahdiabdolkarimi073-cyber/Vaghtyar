import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true, name: true, email: true, status: true, slug: true,
      ownerFirstName: true, ownerLastName: true, category: true, city: true,
      phone: true, address: true, neighborhood: true, description: true,
      photos: true, autoApprove: true, minAdvanceHours: true, maxAdvanceDays: true,
      allowCustomerCancel: true, reminderHoursBefore: true,
      confirmationSmsTemplate: true, reminderSmsTemplate: true,
    },
  });
  if (!business) return NextResponse.json({ error: 'کسب‌وکار یافت نشد' }, { status: 404 });
  return NextResponse.json({ business });
}
