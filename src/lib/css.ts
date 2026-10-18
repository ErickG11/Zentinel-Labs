export const readCssVariable = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();
