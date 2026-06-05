import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const WS_BASE = import.meta.env.VITE_SCHOOLS_WS_URL || '';

type Channel = 'overview' | 'attendance' | 'admin' | `capture/${string}`;

interface Options<T> {
  /** Called for every JSON message received. */
  onMessage?: (msg: T) => void;
  /** Disable connection entirely (e.g. while a tab isn't active). */
  enabled?: boolean;
}

/**
 * Live WebSocket connection to /ws/schools/{channel}/?access_token=<jwt>.
 *
 * Close codes:
 *  - 4401 unauthorized → no reconnect, surface toast
 *  - 4403 forbidden     → no reconnect, surface toast
 *  - other              → exponential backoff up to 30s
 */
export function useSchoolsRealtime<T = unknown>(channel: Channel, opts: Options<T> = {}) {
  const { onMessage, enabled = true } = opts;
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<T | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const stopRef = useRef(false);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!enabled || !WS_BASE) {
      setConnected(false);
      return;
    }
    stopRef.current = false;

    let timer: number | undefined;

    const connect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setConnected(false);
        return;
      }
      const url = `${WS_BASE}/schools/${channel}/?access_token=${encodeURIComponent(token)}`;
      let ws: WebSocket;
      try {
        ws = new WebSocket(url);
      } catch {
        setConnected(false);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as T;
          setLastEvent(msg);
          handlerRef.current?.(msg);
        } catch {
          // ignore non-JSON heartbeats
        }
      };
      ws.onerror = () => {
        // onclose will follow; toast is suppressed here to avoid spam during reconnects
      };
      ws.onclose = (ev) => {
        setConnected(false);
        if (stopRef.current) return;
        if (ev.code === 4401) {
          toast({ variant: 'destructive', title: 'Realtime unauthorised', description: 'Sign in again to receive live updates.' });
          return;
        }
        if (ev.code === 4403) {
          toast({ variant: 'destructive', title: 'Realtime forbidden', description: `Channel ${channel} requires elevated access.` });
          return;
        }
        // backoff: 1s, 2s, 4s … cap 30s
        const delay = Math.min(30_000, 1000 * Math.pow(2, retryRef.current++));
        timer = window.setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      stopRef.current = true;
      if (timer) clearTimeout(timer);
      try { wsRef.current?.close(1000); } catch { /* noop */ }
      wsRef.current = null;
    };
  }, [channel, enabled]);

  return { connected, lastEvent, channel };
}
