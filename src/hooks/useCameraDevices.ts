import { useEffect, useState } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

/**
 * Enumerate available video input devices. Re-queries when devices are
 * plugged/unplugged. Labels are only populated after the user has granted
 * camera permission at least once in this origin.
 */
export function useCameraDevices() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        const cams = all
          .filter(d => d.kind === 'videoinput')
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${i + 1}`,
          }));
        setDevices(cams);
      } catch {
        // permission not yet granted or unsupported
      }
    };

    refresh();
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener?.('devicechange', refresh);
    };
  }, []);

  return devices;
}
