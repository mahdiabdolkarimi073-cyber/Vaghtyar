import { prisma } from './prisma';
import { activateSubscription } from './subscription-service';

const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json';

export interface InitiatePaymentParams {
  businessId: string;
  planId: string;
  amount: number;
  callbackUrl: string;
}

export interface InitiatePaymentResult {
  paymentId: string;
  redirectUrl?: string;
  authority?: string;
  isMock: boolean;
}

export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<InitiatePaymentResult> {
  const { businessId, planId, amount, callbackUrl } = params;

  const payment = await prisma.payment.create({
    data: {
      businessId,
      planId,
      amount,
      status: 'PENDING',
      paymentMethod: 'zarinpal',
    },
  });

  const merchantId = process.env.ZARINPAL_MERCHANT_ID;

  if (!merchantId) {
    return { paymentId: payment.id, isMock: true };
  }

  try {
    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount * 10,
        callback_url: callbackUrl,
        description: `ارتقا اشتراک نوبت‌یار`,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.authority) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { authority: data.data.authority },
      });

      return {
        paymentId: payment.id,
        authority: data.data.authority,
        redirectUrl: `https://www.zarinpal.com/pg/StartPay/${data.data.authority}`,
        isMock: false,
      };
    }

    return { paymentId: payment.id, isMock: true };
  } catch {
    return { paymentId: payment.id, isMock: true };
  }
}

export interface VerifyPaymentParams {
  paymentId: string;
  authority?: string;
  status?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  refId?: string;
  error?: string;
}

export async function verifyPayment(
  params: VerifyPaymentParams
): Promise<VerifyPaymentResult> {
  const { paymentId, authority, status } = params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  include: { plan: true },
  });

  if (!payment) {
    return { success: false, error: 'پرداخت یافت نشد' };
  }

  if (payment.status === 'SUCCESS') {
    return { success: false, error: 'این پرداخت قبلاً تأیید شده است' };
  }

  if (status === 'NOK') {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });
    return { success: false, error: 'پرداخت توسط کاربر لغو شد' };
  }

  const merchantId = process.env.ZARINPAL_MERCHANT_ID;

  if (!merchantId || !authority) {
    const refId = 'MOCK-' + Date.now();
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        refId,
        paidAt: new Date(),
      },
    });

    await activateSubscription({
      businessId: payment.businessId,
      planId: payment.planId,
      paymentId: payment.id,
    });

    return { success: true, refId };
  }

  try {
    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        authority,
        amount: payment.amount * 10,
      }),
    });

    const data = await response.json();

    if (data.data && data.data.code === 100) {
      const refId = String(data.data.ref_id || data.data.authority);
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'SUCCESS',
          refId,
          transactionId: String(data.data.transaction_id || ''),
          paidAt: new Date(),
        },
      });

      await activateSubscription({
        businessId: payment.businessId,
        planId: payment.planId,
        paymentId: payment.id,
      });

      return { success: true, refId };
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });

    return { success: false, error: 'تأیید پرداخت ناموفق بود' };
  } catch {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });
    return { success: false, error: 'خطای اتصال به درگاه پرداخت' };
  }
}
