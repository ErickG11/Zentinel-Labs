export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_EVENT = 'zl:theme-change';
export const LIGHT_CLASS = 'light';

export const resolveTheme = (stored: string | null): Theme =>
  stored === 'light' ? 'light' : 'dark';

export const readThemeFromDocument = (): Theme =>
  document.documentElement.classList.contains(LIGHT_CLASS) ? 'light' : 'dark';

export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle(LIGHT_CLASS, theme === 'light');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Almacenamiento bloqueado (modo privado): el tema dura solo esta sesión
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
};

// Se ejecuta en <head> antes de React para evitar el flash de tema incorrecto
export const themeInitScript = `(function(){try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light'){document.documentElement.classList.add('${LIGHT_CLASS}')}}catch(e){}})();`;
