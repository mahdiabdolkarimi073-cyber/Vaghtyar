import { prisma } from './prisma';

export async function sendSms(phone: string, message: string): Promise<void> {
  console.log(`[SMS Simulation] To: ${phone} | Message: ${message}`);
  try {
    await prisma.smsLog.create({
      data: {
        businessId: '000000000000000000000000',
        recipientPhone: phone,
        smsType: 'APPOINTMENT_CONFIRM',
        messageBody: message,
        status: 'SIMULATED',
      },
    });
  } catch (e) {
    console.error('Failed to log SMS:', e);
  }
}
