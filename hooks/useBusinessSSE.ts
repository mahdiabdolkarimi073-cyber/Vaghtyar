'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface SSEEvent {
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 'heartbeat';
  data?: Record<string, unknown>;
}

export function useBusinessSSE(onEvent: (event: SSEEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/business/appointments/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      retryCountRef.current = 0;
    };

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        onEvent(event);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;
      retryCountRef.current += 1;
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
      retryTimerRef.current = setTimeout(connect, delay);
    };
  }, [onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [connect]);

  return { isConnected };
}
