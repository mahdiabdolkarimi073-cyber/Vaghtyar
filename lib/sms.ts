import { prisma } from './prisma';

export async function sendSms(phone: string, message: string): Promise<void> {
  console.log(`[SMS Simulation] To: ${phone} | Message: ${message}`);
  try {
    await prisma.smsLog.create({
      data: {
        phone,
        message,
      },
    });
  } catch (e) {
    console.error('Failed to log SMS:', e);
  }
}
