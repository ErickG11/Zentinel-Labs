import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('services section lists three services', async ({ page }) => {
  await page.goto('/es');
  const section = page.locator('#services');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText('Lo que construimos');
  await expect(section.locator('[data-service-card]')).toHaveCount(3);
});

test('process section shows five steps', async ({ page }) => {
  await page.goto('/en');
  const section = page.locator('#process');
  await expect(section.getByRole('heading', { level: 3 })).toHaveCount(5);
  await expect(section).toContainText('Discovery');
});

test('stats show final values without animation', async ({ page }) => {
  await page.goto('/es');
  await expect(page.getByText('Proyectos entregados')).toBeVisible();
  await expect(page.locator('[data-counter]').first()).toHaveText('3');
  await expect(page.locator('[data-ring]')).toHaveCount(4);
});
