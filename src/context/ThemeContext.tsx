import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemePreference;
  /** Thème réellement appliqué à l'écran (résout "system" via prefers-color-scheme). */
  resolvedTheme: 'light' | 'dark';
  setThemePreference: (pref: ThemePreference) => void;
  /** Fait tourner system → light → dark → system, pour un bouton à icône unique. */
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('crm_theme');
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  });
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Suit le réglage clair/sombre de l'appareil en direct, pour le mode "system".
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setThemePreference = (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    localStorage.setItem('crm_theme', pref);
  };

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(themePreference) + 1) % order.length];
    setThemePreference(next);
  };

  return (
    <ThemeContext.Provider value={{ themePreference, resolvedTheme, setThemePreference, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
