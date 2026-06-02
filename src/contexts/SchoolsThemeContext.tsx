import { createContext, useContext, useEffect, ReactNode } from 'react';

interface SchoolsThemeContextValue {
  brand: 'schools';
  productName: string;
}

const SchoolsThemeContext = createContext<SchoolsThemeContextValue>({
  brand: 'schools',
  productName: 'Mispar Smart School Ecosystem',
});

/**
 * Applies the Schools brand palette (deep intelligent blue + electric cyan + glass)
 * by injecting CSS variables onto :root while mounted. Restores on unmount.
 */
export const SchoolsThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const root = document.documentElement;
    const prev: Record<string, string> = {};
    const tokens: Record<string, string> = {
      '--schools-bg': '222 47% 6%',
      '--schools-surface': '222 40% 10%',
      '--schools-surface-2': '222 36% 14%',
      '--schools-border': '210 30% 22%',
      '--schools-primary': '212 95% 56%',
      '--schools-accent': '189 96% 56%',
      '--schools-text': '210 40% 96%',
      '--schools-muted': '215 20% 70%',
      '--schools-glass': '222 40% 14% / 0.6',
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
    <SchoolsThemeContext.Provider value={{ brand: 'schools', productName: 'Mispar Smart School Ecosystem' }}>
      {children}
    </SchoolsThemeContext.Provider>
  );
};

export const useSchoolsTheme = () => useContext(SchoolsThemeContext);
