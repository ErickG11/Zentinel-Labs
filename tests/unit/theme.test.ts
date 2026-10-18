// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyTheme,
  LIGHT_CLASS,
  readThemeFromDocument,
  resolveTheme,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  themeInitScript,
} from '@/lib/theme';

afterEach(() => {
  document.documentElement.className = '';
  localStorage.clear();
});

describe('resolveTheme', () => {
  it('returns light only for the stored value "light"', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
    expect(resolveTheme(null)).toBe('dark');
    expect(resolveTheme('<script>')).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('toggles the root class, persists the choice and notifies listeners', () => {
    const listener = vi.fn();
    window.addEventListener(THEME_EVENT, listener);

    applyTheme('light');
    expect(document.documentElement.classList.contains(LIGHT_CLASS)).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(readThemeFromDocument()).toBe('light');
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe('light');

    applyTheme('dark');
    expect(document.documentElement.classList.contains(LIGHT_CLASS)).toBe(false);
    expect(readThemeFromDocument()).toBe('dark');

    window.removeEventListener(THEME_EVENT, listener);
  });
});

describe('themeInitScript', () => {
  const runInitScript = (): void => {
    new Function(themeInitScript)();
  };

  it('applies the light class before hydration when stored', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    runInitScript();
    expect(document.documentElement.classList.contains(LIGHT_CLASS)).toBe(true);
  });

  it('keeps the dark default otherwise', () => {
    runInitScript();
    expect(document.documentElement.classList.contains(LIGHT_CLASS)).toBe(false);
  });
});
