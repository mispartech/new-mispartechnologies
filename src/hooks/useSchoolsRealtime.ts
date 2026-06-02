import { useEffect, useState } from 'react';

/**
 * Placeholder realtime hook for MSSE modules.
 * Will later connect to Django Channels at /ws/msse/{channel}/.
 * For now returns a no-op connection state so UIs can render the "Realtime" affordance.
 */
export function useMsseRealtime(channel: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Backend pending — simulate idle channel.
    setConnected(false);
    return () => setConnected(false);
  }, [channel]);

  return { connected, channel };
}
