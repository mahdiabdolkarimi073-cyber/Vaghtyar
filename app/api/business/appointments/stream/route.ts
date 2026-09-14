import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const businessId = req.headers.get('x-business-id');
  if (!businessId) return new Response(JSON.stringify({ error: 'احراز هویت نشده' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const encoder = new TextEncoder();
  let lastCheck = new Date();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: 'connected' });

      const interval = setInterval(async () => {
        try {
          const newApps = await prisma.appointment.findMany({
            where: { businessId, createdAt: { gt: lastCheck } },
            include: { customer: true, service: true, staff: true },
            take: 10,
          });
          lastCheck = new Date();
          for (const app of newApps) {
            send({
              type: 'appointment_created',
              data: {
                id: app.id,
                startTime: app.startTime.toISOString(),
                customerName: app.customer.name,
                serviceName: app.service.name,
                staffName: app.staff.name,
                status: app.status,
              },
            });
          }
          send({ type: 'heartbeat' });
        } catch {
          // ignore errors
        }
      }, 5000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
