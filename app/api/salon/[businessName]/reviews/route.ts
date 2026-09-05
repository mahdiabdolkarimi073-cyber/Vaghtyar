import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { businessName: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: decodeURIComponent(params.businessName) },
      select: { id: true },
    });
    if (!business) return NextResponse.json({ error: 'سالن مورد نظر پیدا نشد.' }, { status: 404 });

    const reviews = await prisma.review.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: 'دریافت نظرات با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { businessName: string } }
) {
  try {
    const body = reviewSchema.parse(await request.json());
    const business = await prisma.business.findUnique({
      where: { slug: decodeURIComponent(params.businessName) },
      select: { id: true, rating: true, reviewCount: true },
    });
    if (!business) return NextResponse.json({ error: 'سالن مورد نظر پیدا نشد.' }, { status: 404 });

    const review = await prisma.review.create({
      data: { businessId: business.id, name: body.name, rating: body.rating, comment: body.comment },
    });

    const newCount = business.reviewCount + 1;
    const newRating = ((business.rating * business.reviewCount) + body.rating) / newCount;
    await prisma.business.update({
      where: { id: business.id },
      data: { reviewCount: newCount, rating: Math.round(newRating * 10) / 10 },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'اطلاعات نظر را کامل و صحیح وارد کنید.' }, { status: 400 });
    return NextResponse.json({ error: 'ثبت نظر با مشکل روبه‌رو شد.' }, { status: 500 });
  }
}
