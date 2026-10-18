'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { applyTheme, readThemeFromDocument, THEME_EVENT, type Theme } from '@/lib/theme';

interface UseThemeResult {
  theme: Theme;
  toggleTheme: () => void;
}

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

const getServerSnapshot = (): Theme => 'dark';

export const useTheme = (): UseThemeResult => {
  const theme = useSyncExternalStore(subscribe, readThemeFromDocument, getServerSnapshot);
  const toggleTheme = useCallback(() => applyTheme(theme === 'dark' ? 'light' : 'dark'), [theme]);
  return { theme, toggleTheme };
};
