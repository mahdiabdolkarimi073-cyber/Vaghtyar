import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';
import { checkPlanFeature } from '@/lib/plan-limits';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  // Verify the customer belongs to this business before returning notes
  const customer = await prisma.customer.findFirst({ where: { id: params.id, businessId } });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });

  const feature = await checkPlanFeature(businessId, 'hasCustomerNotes');
  if (!feature.allowed) {
    return NextResponse.json(
      { error: `یادداشت مشتری در پلن ${feature.planName} فعال نیست. برای دسترسی، پلن خود را ارتقا دهید.`, featureLocked: true, feature: 'hasCustomerNotes' },
      { status: 403 }
    );
  }

  const notes = await prisma.customerNote.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const customer = await prisma.customer.findFirst({ where: { id: params.id, businessId } });
  if (!customer) return NextResponse.json({ error: 'مشتری یافت نشد' }, { status: 404 });

  const feature = await checkPlanFeature(businessId, 'hasCustomerNotes');
  if (!feature.allowed) {
    return NextResponse.json(
      { error: `یادداشت مشتری در پلن ${feature.planName} فعال نیست. برای دسترسی، پلن خود را ارتقا دهید.`, featureLocked: true, feature: 'hasCustomerNotes' },
      { status: 403 }
    );
  }

  const { content } = await req.json();
  if (!content || content.trim().length === 0) return NextResponse.json({ error: 'یادداشت الزامی است' }, { status: 400 });

  const note = await prisma.customerNote.create({
    data: { customerId: params.id, content: content.trim() },
  });
  return NextResponse.json(note, { status: 201 });
}
