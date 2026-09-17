import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const staff = await prisma.staff.findFirst({
    where: { id: params.id, businessId },
    include: {
      staffServices: { include: { service: true } },
      workingHours: true,
    },
  });
  if (!staff) return NextResponse.json({ error: 'کارکن یافت نشد' }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();
  const staff = await prisma.staff.update({
    where: { id: params.id, businessId },
    data: {
      name: body.name,
      photo: body.photo,
      specialty: body.specialty,
      bio: body.bio,
    },
  });
  return NextResponse.json(staff);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  await prisma.staff.delete({ where: { id: params.id, businessId } });
  return NextResponse.json({ success: true });
}
