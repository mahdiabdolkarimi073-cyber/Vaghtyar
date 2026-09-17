import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const type = searchParams.get('type');
  const status = searchParams.get('status');

  const where: Record<string, unknown> = { businessId };
  if (type) where.smsType = type;
  if (status) where.status = status;

  const total = await prisma.smsLog.count({ where });
  const logs = await prisma.smsLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({
    logs: logs.map(l => ({
      id: l.id,
      appointmentId: l.appointmentId,
      recipientPhone: l.recipientPhone,
      recipientType: l.recipientType,
      smsType: l.smsType,
      messageBody: l.messageBody,
      status: l.status,
      sentAt: l.sentAt?.toISOString() || null,
      createdAt: l.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
