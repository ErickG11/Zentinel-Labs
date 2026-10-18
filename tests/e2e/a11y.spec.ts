import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const PAGES = [
  '/es',
  '/en',
  '/es/proyectos/pan-de-vida',
  '/en/work/gas-solutions',
  '/es/no-existe',
] as const;
const THEMES = ['dark', 'light'] as const;

for (const theme of THEMES) {
  for (const path of PAGES) {
    test(`axe: ${path} (${theme}) sin violaciones serias o criticas`, async ({ page }) => {
      if (theme === 'light') {
        await page.addInitScript(() => localStorage.setItem('theme', 'light'));
      }
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      const report = serious
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n` +
            v.nodes
              .slice(0, 8)
              .map(
                (n) => `   - ${n.target.join(' ')}\n     ${n.failureSummary?.split('\n')[1] ?? ''}`,
              )
              .join('\n'),
        )
        .join('\n');
      expect(report, report).toBe('');
    });
  }
}

test('con movimiento reducido todos los h2 de la home son visibles al hacer scroll', async ({
  page,
}) => {
  await page.goto('/es');
  const headings = page.locator('main h2');
  const count = await headings.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const h = headings.nth(i);
    await h.scrollIntoViewIfNeeded();
    await expect(h).toBeVisible();
    await expect(h).toHaveCSS('opacity', '1');
  }
});

for (const width of [390, 1440]) {
  test(`sin desbordamiento horizontal a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/es');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
