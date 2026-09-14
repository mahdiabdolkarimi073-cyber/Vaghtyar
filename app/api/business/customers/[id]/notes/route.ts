import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const notes = await prisma.customerNote.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  const { content } = await req.json();
  if (!content || content.trim().length === 0) return NextResponse.json({ error: 'یادداشت الزامی است' }, { status: 400 });

  const note = await prisma.customerNote.create({
    data: { customerId: params.id, content: content.trim() },
  });
  return NextResponse.json(note, { status: 201 });
}
