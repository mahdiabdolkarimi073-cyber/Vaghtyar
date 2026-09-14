import { MONTH_NAMES_FA, toPersianDigits } from './constants';
import { toJalali } from './jalali';

export type SmsTemplateType =
  | 'APPOINTMENT_CONFIRM'
  | 'APPOINTMENT_REMINDER'
  | 'NEW_BOOKING_NOTIFY'
  | 'APPOINTMENT_CANCEL';

export interface SmsTemplateData {
  salonName?: string;
  service?: string;
  customerName?: string;
  date?: string;
  time?: string;
  code?: string;
}

function formatJalaliDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const monthName = MONTH_NAMES_FA[jm - 1];
  return `${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

export function generateSmsMessage(
  type: SmsTemplateType,
  data: SmsTemplateData
): string {
  const jalaliDate = data.date ? formatJalaliDate(data.date) : '';
  const time = data.time ? toPersianDigits(data.time) : '';

  switch (type) {
    case 'APPOINTMENT_CONFIRM':
      return `«نوبت شما در ${data.salonName || ''} برای ${data.service || ''} در تاریخ ${jalaliDate} ساعت ${time} ثبت شد. کد نوبت: ${data.code || ''}»`;

    case 'APPOINTMENT_REMINDER':
      return `«یادآوری: نوبت شما در ${data.salonName || ''} فردا ساعت ${time} است.»`;

    case 'NEW_BOOKING_NOTIFY':
      return `«نوبت جدید: ${data.customerName || ''} - ${data.service || ''} - ${jalaliDate} ${time}»`;

    case 'APPOINTMENT_CANCEL':
      return `«نوبت شما در ${data.salonName || ''} برای ${jalaliDate} ${time} لغو شد.»`;

    default:
      return '';
  }
}
