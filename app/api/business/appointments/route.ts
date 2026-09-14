import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { sanitizeCustomer } from '@/lib/auth/sanitizeCustomer';

/**
 * GET /api/business/appointments
 *
 * دریافت لیست نوبت‌های کسب‌وکار احراز هویت شده.
 * businessId فقط از توکن JWT استخراج می‌شود — هرگز از بدنه درخواست.
 * شماره موبایل مشتری فقط برای مالک کسب‌وکار برگردانده می‌شود.
 */
export async function GET(req: NextRequest) {
  // ─── استخراج businessId از JWT — نه از بدنه درخواست ───
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = { businessId };
  if (staffId) where.staffId = staffId;
  if (status) where.status = status;
  if (date) {
    const d = new Date(date);
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.startTime = { gte: d, lt: dayEnd };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { customer: true, service: true, staff: true },
    orderBy: { startTime: 'asc' },
  });

  // ─── پاکسازی شماره موبایل — فقط مالک کسب‌وکار می‌بیند ───
  const sanitized = appointments.map((a) => ({
    id: a.id,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    status: a.status,
    source: a.source,
    internalNote: a.internalNote,
    cancelReason: a.cancelReason,
    customer: sanitizeCustomer(
      {
        id: a.customer.id,
        name: a.customer.name,
        mobile: a.customer.mobile,
        isBlocked: a.customer.isBlocked,
      },
      businessId,
      a.businessId
    ),
    service: { id: a.service.id, name: a.service.name, durationMinutes: a.service.durationMinutes, price: a.service.price },
    staff: { id: a.staff.id, name: a.staff.name },
  }));

  return NextResponse.json(sanitized);
}
