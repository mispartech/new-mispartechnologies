import { createContext, useContext, useEffect, ReactNode } from 'react';

interface MsseThemeContextValue {
  brand: 'msse';
  productName: string;
}

const MsseThemeContext = createContext<MsseThemeContextValue>({
  brand: 'msse',
  productName: 'Mispar Smart School Ecosystem',
});

/**
 * Applies the MSSE brand palette (deep intelligent blue + electric cyan + glass)
 * by injecting CSS variables onto :root while mounted. Restores on unmount.
 */
export const MsseThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const root = document.documentElement;
    const prev: Record<string, string> = {};
    const tokens: Record<string, string> = {
      '--msse-bg': '222 47% 6%',
      '--msse-surface': '222 40% 10%',
      '--msse-surface-2': '222 36% 14%',
      '--msse-border': '210 30% 22%',
      '--msse-primary': '212 95% 56%',
      '--msse-accent': '189 96% 56%',
      '--msse-text': '210 40% 96%',
      '--msse-muted': '215 20% 70%',
      '--msse-glass': '222 40% 14% / 0.6',
    };
    Object.entries(tokens).forEach(([k, v]) => {
      prev[k] = root.style.getPropertyValue(k);
      root.style.setProperty(k, v);
    });
    return () => {
      Object.entries(prev).forEach(([k, v]) => {
        if (v) root.style.setProperty(k, v);
        else root.style.removeProperty(k);
      });
    };
  }, []);

  return (
    <MsseThemeContext.Provider value={{ brand: 'msse', productName: 'Mispar Smart School Ecosystem' }}>
      {children}
    </MsseThemeContext.Provider>
  );
};

export const useMsseTheme = () => useContext(MsseThemeContext);
