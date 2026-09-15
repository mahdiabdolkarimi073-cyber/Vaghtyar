import { prisma } from './prisma';

export interface TimeSlot {
  time: string;
  available: boolean;
}

export async function getAvailableSlots(
  businessId: string,
  date: Date,
  serviceDurationMinutes: number,
  staffId?: string
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  let workingHours = await prisma.workingHours.findFirst({
    where: {
      businessId,
      dayOfWeek,
    },
  });

  // Fallback to BusinessHours if WorkingHours not yet populated
  if (!workingHours) {
    const businessHours = await prisma.businessHours.findFirst({
      where: { businessId, dayOfWeek },
    });
    if (businessHours) {
      workingHours = {
        id: businessHours.id,
        businessId: businessHours.businessId,
        dayOfWeek: businessHours.dayOfWeek,
        isClosed: businessHours.isClosed,
        startTime: businessHours.openTime,
        endTime: businessHours.closeTime,
      };
    }
  }

  if (!workingHours || workingHours.isClosed || !workingHours.startTime || !workingHours.endTime) {
    return [];
  }

  const openHour = parseInt(workingHours.startTime.split(':')[0]);
  const openMinute = parseInt(workingHours.startTime.split(':')[1]);
  const closeHour = parseInt(workingHours.endTime.split(':')[0]);
  const closeMinute = parseInt(workingHours.endTime.split(':')[1]);

  const slots: TimeSlot[] = [];
  const slotInterval = 30;

  let currentHour = openHour;
  let currentMinute = openMinute;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMinute < closeMinute)
  ) {
    const slotEndHour = currentHour + Math.floor((currentMinute + serviceDurationMinutes) / 60);
    const slotEndMinute = (currentMinute + serviceDurationMinutes) % 60;

    // Check if slot end exceeds closing time
    if (
      slotEndHour > closeHour ||
      (slotEndHour === closeHour && slotEndMinute > closeMinute)
    ) {
      break;
    }

    const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    // Check for existing bookings
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        ...(staffId ? { staffId } : {}),
      },
    });

    let isAvailable = true;

    for (const booking of existingBookings) {
      const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
      const [bEndH, bEndM] = booking.endTime.split(':').map(Number);

      const slotStartMin = currentHour * 60 + currentMinute;
      const slotEndMin = slotEndHour * 60 + slotEndMinute;
      const bookingStartMin = bStartH * 60 + bStartM;
      const bookingEndMin = bEndH * 60 + bEndM;

      if (slotStartMin < bookingEndMin && slotEndMin > bookingStartMin) {
        isAvailable = false;
        break;
      }
    }

    slots.push({ time: timeStr, available: isAvailable });

    currentMinute += slotInterval;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}
