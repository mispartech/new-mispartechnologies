import { useEffect } from 'react';

type Handler = (e: KeyboardEvent) => void;
type ShortcutMap = Record<string, Handler>;

/**
 * Register keyboard shortcuts. Keys are case-insensitive single characters
 * (e.g. 'f', 's', '?'). Shortcuts are skipped while the user is typing in
 * an input/textarea/contenteditable element.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }
      const key = e.key.toLowerCase();
      const fn = shortcuts[key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
