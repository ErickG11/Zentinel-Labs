import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('remote section renders the globe after loading land data', async ({ page }) => {
  await page.goto('/es');
  const section = page.getByRole('region', { name: 'Desde Ecuador, para el mundo' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('canvas')).toBeVisible();
  await expect(section.getByText('Arrastra para rotar · Rueda para zoom')).toBeVisible();
  await expect(section.getByText('No se pudo cargar el mapa')).toHaveCount(0);
});
