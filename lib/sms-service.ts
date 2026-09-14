import { prisma } from './prisma';
import { generateSmsMessage, SmsTemplateType, SmsTemplateData } from './sms-templates';
import { checkPlanLimit, getBusinessPlan } from './plan-limits';

export interface SendSmsParams {
  businessId: string;
  appointmentId?: string;
  recipientPhone: string;
  recipientType: 'CUSTOMER' | 'BUSINESS';
  smsType: SmsTemplateType;
  templateData: SmsTemplateData;
}

export interface SendSmsResult {
  success: boolean;
  status: 'SIMULATED' | 'SENT' | 'FAILED';
  message: string;
  error?: string;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const { businessId, appointmentId, recipientPhone, recipientType, smsType, templateData } = params;

  const messageBody = generateSmsMessage(smsType, templateData);

  if (!messageBody) {
    return { success: false, status: 'FAILED', message: 'قالب پیامک نامعتبر است', error: 'Invalid template type' };
  }

  const { plan } = await getBusinessPlan(businessId);

  if (smsType === 'APPOINTMENT_CONFIRM') {
    const quota = await checkPlanLimit(businessId, 'smsConfirmQuota');
    if (!quota.allowed) {
      await prisma.smsLog.create({
        data: {
          businessId,
          appointmentId: appointmentId || null,
          recipientPhone,
          recipientType,
          smsType,
          messageBody,
          status: 'FAILED',
        },
      });
      return {
        success: false,
        status: 'FAILED',
        message: `سهمیه پیامک تأیید در پلن ${quota.planName} تکمیل شده است. برای ارسال پیامک، پلن خود را ارتقا دهید.`,
        error: 'Quota exceeded',
      };
    }
  }

  if (smsType === 'APPOINTMENT_REMINDER' && plan) {
    if (!plan.hasSmsReminder) {
      return {
        success: false,
        status: 'FAILED',
        message: 'یادآوری پیامکی در پلن فعلی شما فعال نیست.',
        error: 'Reminder not available',
      };
    }
  }

  const smsApiKey = process.env.SMS_API_KEY;
  const smsProvider = process.env.SMS_PROVIDER;

  if (!smsApiKey || !smsProvider) {
    await prisma.smsLog.create({
      data: {
        businessId,
        appointmentId: appointmentId || null,
        recipientPhone,
        recipientType,
        smsType,
        messageBody,
        status: 'SIMULATED',
        sentAt: new Date(),
      },
    });
    return { success: true, status: 'SIMULATED', message: 'پیامک در حالت شبیه‌سازی ارسال شد' };
  }

  try {
    const response = await fetch(`https://${smsProvider}.com/v1/Send/SendSMS`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: smsApiKey,
        message: messageBody,
        receptor: recipientPhone,
      }),
    });

    const data = await response.json();

    if (response.ok && (data.status === 200 || data.code === 200)) {
      await prisma.smsLog.create({
        data: {
          businessId,
          appointmentId: appointmentId || null,
          recipientPhone,
          recipientType,
          smsType,
          messageBody,
          status: 'SENT',
          sentAt: new Date(),
        },
      });
      return { success: true, status: 'SENT', message: 'پیامک با موفقیت ارسال شد' };
    } else {
      await prisma.smsLog.create({
        data: {
          businessId,
          appointmentId: appointmentId || null,
          recipientPhone,
          recipientType,
          smsType,
          messageBody,
          status: 'FAILED',
        },
      });
      return { success: false, status: 'FAILED', message: 'خطا در ارسال پیامک', error: JSON.stringify(data) };
    }
  } catch (error) {
    await prisma.smsLog.create({
      data: {
        businessId,
        appointmentId: appointmentId || null,
        recipientPhone,
        recipientType,
        smsType,
        messageBody,
        status: 'FAILED',
      },
    });
    return { success: false, status: 'FAILED', message: 'خطای اتصال به سرویس پیامک', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
