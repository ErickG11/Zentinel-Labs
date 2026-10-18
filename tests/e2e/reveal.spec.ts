import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// Extrae la regla fail-safe real de globals.css para probarla de forma determinista
const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const rule = /html:not\(\[data-motion='ok'\]\) \[data-reveal\][^{]*\{[^}]*\}/.exec(css)?.[0] ?? '';

const page_ = (htmlAttrs: string): string =>
  `<html ${htmlAttrs}><body><div data-reveal style="opacity:0;transform:translateY(30px)">x</div></body></html>`;

test.describe('Reveal fail-safe CSS', () => {
  test('la regla existe en globals.css', () => {
    expect(rule).not.toBe('');
  });

  for (const [name, attrs, visible] of [
    ['sin JS (sin data-motion)', '', true],
    ['reduced motion', 'data-motion="reduce"', true],
    ['failsafe sin hidratar', 'data-motion="ok" data-failsafe', true],
    ['failsafe con app montada', 'data-motion="ok" data-failsafe data-hydrated', false],
    ['movimiento normal', 'data-motion="ok"', false],
  ] as const) {
    test(name, async ({ page }) => {
      await page.setContent(page_(attrs));
      await page.addStyleTag({ content: rule });
      const el = page.locator('[data-reveal]');
      if (visible) await expect(el).toHaveCSS('opacity', '1');
      else await expect(el).toHaveCSS('opacity', '0');
    });
  }
});
