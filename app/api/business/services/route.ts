import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPlanLimit } from '@/lib/plan-limits';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { createServiceSchema } from '@/lib/validations/schemas';

/**
 * GET /api/business/services
 * دریافت لیست خدمات — businessId از JWT
 */
export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const services = await prisma.service.findMany({
    where: { businessId },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(services);
}

/**
 * POST /api/business/services
 * ایجاد خدمت جدید — businessId از JWT، اعتبارسنجی با zod (strict)
 */
export async function POST(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();
  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'ورودی نامعتبر' },
      { status: 400 }
    );
  }

  const limit = await checkPlanLimit(businessId, 'maxServices');
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `شما به حداکثر تعداد خدمات در پلن ${limit.planName} رسیده‌اید. برای افزایش محدودیت، پلن خود را ارتقا دهید.`, limitReached: true, limitType: 'maxServices' },
      { status: 403 }
    );
  }

  const count = await prisma.service.count({ where: { businessId } });
  const service = await prisma.service.create({
    data: {
      ...parsed.data,
      businessId,
      sortOrder: count,
    },
  });
  return NextResponse.json(service, { status: 201 });
}
