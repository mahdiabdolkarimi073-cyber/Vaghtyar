import { z } from 'zod';

// ─── شماره موبایل ایرانی ───
// فرمت معتبر: 09XXXXXXXXX (دقیقاً ۱۱ رقم، شروع با 09)
export const mobileSchema = z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست');

// ─── قیمت ───
// عدد مثبت، حداکثر ۱۰۰ میلیون تومان
export const priceSchema = z.number().positive().max(100_000_000, 'مبلغ غیرمعتبر است');

// ─── تاریخ و زمان نوبت ───
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'فرمت تاریخ نامعتبر است (YYYY-MM-DD)');

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'فرمت زمان نامعتبر است (HH:MM)');

export const appointmentTimeSchema = z.object({
  date: dateSchema,
  startTime: timeSchema,
});

// ─── اسکمای رزرو عمومی (بدون احراز هویت) ───
// قیمت، پلن اشتراک، تخفیف و هزینه رزرو هرگز از کلاینت قبول نمی‌شوند — فقط از دیتابیس
export const publicBookingSchema = z.object({
  businessId: z.string().min(1, 'شناسه کسب‌وکار الزامی است'),
  serviceId: z.string().min(1, 'شناسه خدمت الزامی است'),
  staffId: z.string().optional().nullable(),
  customerName: z.string().min(2, 'نام مشتری حداقل ۲ کاراکتر باشد').max(50, 'نام مشتری حداکثر ۵۰ کاراکتر'),
  customerPhone: mobileSchema,
  customerNote: z.string().max(500, 'یادداشت حداکثر ۵۰۰ کاراکتر').optional().nullable(),
  date: dateSchema,
  startTime: timeSchema,
  // این فیلدها عمداً strip می‌شوند — هرگز از کلاینت قبول نمی‌شوند
  price: z.never().optional(),
  subscriptionPlan: z.never().optional(),
  discount: z.never().optional(),
  bookingFee: z.never().optional(),
}).strip();

// ─── اسکمای ایجاد خدمت ───
export const createServiceSchema = z.object({
  name: z.string().min(1, 'نام خدمت الزامی است').max(100, 'نام خدمت حداکثر ۱۰۰ کاراکتر'),
  durationMinutes: z.number().int().min(5, 'حداقل مدت ۵ دقیقه').max(480, 'حداکثر مدت ۸ ساعت'),
  price: z.number().int().min(0, 'قیمت نمی‌تواند منفی باشد').max(100_000_000, 'قیمت غیرمعتبر'),
  description: z.string().max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر').optional(),
}).strict();

// ─── اسکمای تغییر وضعیت نوبت ───
export const appointmentStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'], {
    errorMap: () => ({ message: 'وضعیت نامعتبر' }),
  }),
  internalNote: z.string().max(500).optional(),
  cancelReason: z.string().max(500).optional(),
}).strict();

// ─── تایپ‌های استخراج‌شده ───
export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type AppointmentStatusInput = z.infer<typeof appointmentStatusSchema>;
