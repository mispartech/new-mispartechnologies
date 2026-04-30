import { useCallback, useRef } from 'react';

/**
 * Distinct attendance audio cues using WebAudio (no asset dependency) +
 * optional voice announcements via the Web Speech API.
 *
 * - Member chime: bright two-note (E5 -> A5)
 * - Visitor chime: warm single-note (C5)
 *
 * Falls back gracefully when AudioContext or speechSynthesis aren't available.
 */
export function useAttendanceAudio() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
      if (!Ctor) return null;
      try { ctxRef.current = new Ctor(); } catch { return null; }
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  };

  const tone = useCallback((freq: number, startOffset: number, duration: number, volume: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }, []);

  const playMember = useCallback((volume = 0.6) => {
    tone(659.25, 0, 0.18, volume);   // E5
    tone(880.00, 0.14, 0.22, volume); // A5
  }, [tone]);

  const playVisitor = useCallback((volume = 0.5) => {
    tone(523.25, 0, 0.32, volume);   // C5
  }, [tone]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = 1.0;
      u.volume = 0.9;
      synth.speak(u);
    } catch {
      // ignore
    }
  }, []);

  return { playMember, playVisitor, speak };
}
