import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const advertisements = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            profileImage: true,
            coverImage: true,
            neighborhood: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({ advertisements });
  } catch {
    return NextResponse.json({ advertisements: [] }, { status: 200 });
  }
}
