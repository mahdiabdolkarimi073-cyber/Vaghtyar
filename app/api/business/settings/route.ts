import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, address: true, phone: true, description: true, neighborhood: true, category: true, photos: true, city: true },
  });
  return NextResponse.json(business);
}

export async function PUT(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

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
