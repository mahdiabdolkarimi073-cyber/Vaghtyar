import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { sanitizeCustomer } from '@/lib/auth/sanitizeCustomer';
import { appointmentStatusSchema } from '@/lib/validations/schemas';

/**
 * GET /api/business/appointments/[id]
 *
 * دریافت یک نوبت — businessId از JWT، فیلتر روی businessId در کوئری.
 * شماره موبایل فقط برای مالک کسب‌وکار.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  // ─── فیلتر با businessId از JWT — جلوگیری از دسترسی به داده‌های سایر کسب‌وکارها ───
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
    include: { customer: true, service: true, staff: true },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  // ─── پاکسازی شماره موبایل ───
  const sanitized = {
    ...appointment,
    customer: sanitizeCustomer(
      {
        id: appointment.customer.id,
        name: appointment.customer.name,
        mobile: appointment.customer.mobile,
        isBlocked: appointment.customer.isBlocked,
      },
      businessId,
      appointment.businessId
    ),
  };

  return NextResponse.json(sanitized);
}

/**
 * PUT /api/business/appointments/[id]
 *
 * به‌روزرسانی نوبت — اعتبارسنجی با zod، فیلتر با businessId از JWT.
 * قیمت و پلن از بدنه درخواست قبول نمی‌شوند (strict schema).
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();

  // ─── اعتبارسنجی ورودی با zod — فیلدهای ممنوعه reject می‌شوند ───
  const parsed = appointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'ورودی نامعتبر' },
      { status: 400 }
    );
  }

  // ─── بررسی مالکیت نوبت با businessId از JWT ───
  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, businessId },
  });
  if (!appointment) return NextResponse.json({ error: 'نوبت یافت نشد' }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      status: parsed.data.status,
      internalNote: parsed.data.internalNote,
      cancelReason: parsed.data.cancelReason,
    },
  });
  return NextResponse.json(updated);
}
