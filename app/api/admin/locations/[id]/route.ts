import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const body = await req.json();
    const { type, name } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام الزامی است' }, { status: 400 });
    }

    if (type === 'city') {
      const existing = await prisma.city.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ error: 'شهر یافت نشد' }, { status: 404 });
      }

      const slug = slugify(name);
      const slugConflict = await prisma.city.findFirst({
        where: { slug, NOT: { id: params.id } },
      });
      if (slugConflict) {
        return NextResponse.json({ error: 'این نام قبلاً استفاده شده است' }, { status: 400 });
      }

      const updated = await prisma.city.update({
        where: { id: params.id },
        data: { name, slug },
      });
      return NextResponse.json(updated);
    }

    if (type === 'neighborhood') {
      const existing = await prisma.neighborhood.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ error: 'محله یافت نشد' }, { status: 404 });
      }

      const slug = slugify(name);
      const slugConflict = await prisma.neighborhood.findFirst({
        where: { slug, NOT: { id: params.id } },
      });
      if (slugConflict) {
        return NextResponse.json({ error: 'این نام قبلاً استفاده شده است' }, { status: 400 });
      }

      const updated = await prisma.neighborhood.update({
        where: { id: params.id },
        data: { name, slug },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'نوع نامعتبر است' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'احراز هویت نشده' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'city';

    if (type === 'city') {
      const existing = await prisma.city.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ error: 'شهر یافت نشد' }, { status: 404 });
      }

      const businessCount = await prisma.business.count({
        where: { city: existing.name },
      });
      if (businessCount > 0) {
        return NextResponse.json(
          { error: 'این شهر دارای کسب‌وکار است و قابل حذف نیست' },
          { status: 400 }
        );
      }

      await prisma.city.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'شهر با موفقیت حذف شد' });
    }

    if (type === 'neighborhood') {
      const existing = await prisma.neighborhood.findUnique({ where: { id: params.id } });
      if (!existing) {
        return NextResponse.json({ error: 'محله یافت نشد' }, { status: 404 });
      }

      await prisma.neighborhood.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'محله با موفقیت حذف شد' });
    }

    return NextResponse.json({ error: 'نوع نامعتبر است' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}
