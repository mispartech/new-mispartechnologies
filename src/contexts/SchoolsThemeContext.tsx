import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import '@/styles/schools-tokens.css';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface SchoolsThemeContextValue {
  brand: 'schools';
  productName: string;
  theme: ThemeMode;
  resolved: ResolvedTheme;
  setTheme: (t: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'schools.theme';

const SchoolsThemeContext = createContext<SchoolsThemeContextValue>({
  brand: 'schools',
  productName: 'Mispar Schools',
  theme: 'system',
  resolved: 'light',
  setTheme: () => {},
  toggle: () => {},
});

const readInitial = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
};

const resolve = (mode: ThemeMode): ResolvedTheme => {
  if (mode !== 'system') return mode;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const SchoolsThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(readInitial);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readInitial()));

  // Track system preference when in 'system' mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setResolved(mq.matches ? 'dark' : 'light');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [theme]);

  useEffect(() => {
    setResolved(resolve(theme));
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  return (
    <SchoolsThemeContext.Provider value={{ brand: 'schools', productName: 'Mispar Schools', theme, resolved, setTheme, toggle }}>
      {children}
    </SchoolsThemeContext.Provider>
  );
};

export const useSchoolsTheme = () => useContext(SchoolsThemeContext);
