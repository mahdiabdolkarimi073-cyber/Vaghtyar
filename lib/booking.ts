import { prisma } from '@/lib/prisma';

export interface BookingEmployee {
  id: number | 'anyone';
  name: string;
  photo: string | null;
  specialization: string;
}

export interface AvailableSlotsResponse {
  date: string;
  duration: number;
  slots: string[];
}

export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function getIranianDay(date: Date): number {
  return (date.getDay() + 1) % 7;
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function overlaps(start: number, duration: number, bookedStart: number, bookedDuration: number): boolean {
  return start < bookedStart + bookedDuration && start + duration > bookedStart;
}

export async function getBookingContext(serviceId: number) {
  return prisma.service.findUnique({
    where: { id: serviceId },
    include: { business: { include: { staff: true, workingHours: true } } },
  });
}
