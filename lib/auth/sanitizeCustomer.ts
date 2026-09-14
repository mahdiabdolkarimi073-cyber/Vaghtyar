/**
 * پاکسازی داده‌های مشتری — حذف شماره موبایل زمانی که درخواست‌کننده مالک کسب‌وکار نیست.
 *
 * شماره موبایل فقط زمانی در پاسخ برگردانده می‌شود که businessId از توکن JWT
 * با businessId نوبت/مشتری مطابقت داشته باشد.
 */

export interface CustomerData {
  id?: string;
  name?: string;
  mobile?: string;
  isBlocked?: boolean;
  createdAt?: string | Date;
  [key: string]: unknown;
}

/**
 * شماره موبایل را از شیء مشتری حذف می‌کند اگر درخواست‌کننده مالک نباشد.
 *
 * @param customer — شیء مشتری (می‌تواند شامل mobile باشد)
 * @param requesterBusinessId — businessId استخراج‌شده از JWT
 * @param ownerBusinessId — businessId صاحب نوبت/مشتری
 * @returns شیء مشتری بدون فیلد mobile اگر درخواست‌کننده مالک نباشد
 */
export function sanitizeCustomer<T extends CustomerData>(
  customer: T,
  requesterBusinessId: string | null,
  ownerBusinessId: string | null
): T {
  if (!requesterBusinessId || !ownerBusinessId || requesterBusinessId !== ownerBusinessId) {
    const { mobile: _removed, ...rest } = customer;
    return rest as T;
  }
  return customer;
}

/**
 * نسخه آرایه‌ای — شماره موبایل را از هر مشتری در لیست حذف می‌کند
 * اگر درخواست‌کننده مالک آن کسب‌وکار نباشد.
 */
export function sanitizeCustomers<T extends CustomerData>(
  customers: T[],
  requesterBusinessId: string | null,
  ownerBusinessId: string | null
): T[] {
  return customers.map((c) => sanitizeCustomer(c, requesterBusinessId, ownerBusinessId));
}
