export const DAY_NAMES_FA = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export const DAY_NAMES_SHORT_FA = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];

export const MONTH_NAMES_FA = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function toPersianDigits(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

export function formatPrice(price: number): string {
  return toPersianDigits(price.toLocaleString('en-US')) + ' تومان';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return toPersianDigits(minutes) + ' دقیقه';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return toPersianDigits(h) + ' ساعت';
  return toPersianDigits(h) + ' ساعت و ' + toPersianDigits(m) + ' دقیقه';
}

export function formatTime(time: string): string {
  return toPersianDigits(time);
}

export function formatDateFA(date: Date): string {
  const { toJalali } = require('date-fns-jalali');
  const jalali = toJalali(date);
  const dayName = DAY_NAMES_FA[date.getDay()];
  return `${dayName} ${toPersianDigits(jalali.day)} ${MONTH_NAMES_FA[jalali.month - 1]} ${toPersianDigits(jalali.year)}`;
}

export function formatDateShortFA(date: Date): string {
  const { toJalali } = require('date-fns-jalali');
  const jalali = toJalali(date);
  return `${toPersianDigits(jalali.day)} ${MONTH_NAMES_FA[jalali.month - 1]} ${toPersianDigits(jalali.year)}`;
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
