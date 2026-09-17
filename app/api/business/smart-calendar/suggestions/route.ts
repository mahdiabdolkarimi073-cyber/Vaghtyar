import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBusinessId, unauthorizedResponse } from '@/lib/auth/getBusinessId';

export async function GET(req: NextRequest) {
  const businessId = getBusinessId(req);
  if (!businessId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const date = new Date(dateParam);
  const dayOfWeek = (date.getDay() + 1) % 7;

  const workingHours = await prisma.workingHours.findFirst({
    where: { businessId, dayOfWeek },
  });

  if (!workingHours || workingHours.isClosed || !workingHours.startTime || !workingHours.endTime) {
    return NextResponse.json([]);
  }

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  const [appointments, staff] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId, startTime: { gte: dayStart, lt: dayEnd }, status: { notIn: ['CANCELLED'] } },
      include: { staff: true },
    }),
    prisma.staff.findMany({ where: { businessId, isActive: true }, include: { staffServices: { include: { service: true } } } }),
  ]);

  const slots: { startTime: string; endTime: string; staffId: string; staffName: string; availableServices: string[] }[] = [];
  const [openHour, openMin] = workingHours.startTime.split(':').map(Number);
  const [closeHour, closeMin] = workingHours.endTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  for (const s of staff) {
    const staffApps = appointments.filter(a => a.staffId === s.id).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    let cursor = openMinutes;

    for (const app of staffApps) {
      const appStart = app.startTime.getHours() * 60 + app.startTime.getMinutes();
      if (appStart - cursor >= 30) {
        slots.push({
          startTime: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
          endTime: `${String(Math.floor(appStart / 60)).padStart(2, '0')}:${String(appStart % 60).padStart(2, '0')}`,
          staffId: s.id,
          staffName: s.name,
          availableServices: s.staffServices.map(ss => ss.service.name),
        });
      }
      const appEnd = app.endTime.getHours() * 60 + app.endTime.getMinutes();
      cursor = Math.max(cursor, appEnd);
    }

    if (closeMinutes - cursor >= 30) {
      slots.push({
        startTime: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor(closeMinutes / 60)).padStart(2, '0')}:${String(closeMinutes % 60).padStart(2, '0')}`,
        staffId: s.id,
        staffName: s.name,
        availableServices: s.staffServices.map(ss => ss.service.name),
      });
    }
  }

  slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return NextResponse.json(slots.slice(0, 5));
}
