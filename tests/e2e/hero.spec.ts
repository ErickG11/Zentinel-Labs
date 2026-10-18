import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('hero shows headline, status and both calls to action', async ({ page }) => {
  await page.goto('/es');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('que impulsa tu negocio.');
  await expect(page.getByText('Disponibles para nuevos proyectos')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cotizar proyecto' }).first()).toHaveAttribute(
    'href',
    '#contact',
  );
  await expect(page.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute('href', '#work');
});

test('hero renders a visual (3D or fallback)', async ({ page }) => {
  await page.goto('/es');
  await expect(page.locator('[data-hero-visual]')).toBeAttached();
  await expect(page.locator('[data-sentinel-fallback]')).toBeVisible();
});

test('ticker lists the technologies', async ({ page }) => {
  await page.goto('/en');
  const ticker = page.getByRole('region', { name: 'Technologies we work with' });
  await expect(ticker).toContainText('Next.js');
  await expect(ticker).toContainText('TypeScript');
});
