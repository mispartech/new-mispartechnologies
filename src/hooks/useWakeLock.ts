import { useEffect, useRef } from 'react';

/**
 * Request a screen wake lock while `active` is true to prevent the device
 * from sleeping during long attendance sessions. Silently no-ops on browsers
 * that don't support the Wake Lock API (e.g., older Safari).
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const request = async () => {
      try {
        const anyNav = navigator as any;
        if (!anyNav.wakeLock?.request) return;
        const sentinel = await anyNav.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release?.();
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener?.('release', () => {
          // released by browser (e.g. tab hidden) — will re-request via visibilitychange
        });
      } catch {
        // user denied or unsupported — non-critical
      }
    };

    const release = () => {
      try {
        sentinelRef.current?.release?.();
      } catch {
        /* noop */
      }
      sentinelRef.current = null;
    };

    const handleVisibility = () => {
      if (active && document.visibilityState === 'visible' && !sentinelRef.current) {
        request();
      }
    };

    if (active) {
      request();
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      release();
    };
  }, [active]);
}
