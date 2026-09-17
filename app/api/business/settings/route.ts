import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, address: true, phone: true, description: true, neighborhood: true, category: true, photos: true, city: true },
  });
  return NextResponse.json(business);
}

export async function PUT(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const body = await req.json();
  const business = await prisma.business.update({
    where: { id: businessId },
    data: {
      name: body.name,
      address: body.address,
      phone: body.phone,
      description: body.description,
      neighborhood: body.neighborhood,
      category: body.category,
      photos: body.photos,
    },
  });
  return NextResponse.json(business);
}
