import { expect, test } from '@playwright/test';

test('plays the preloader once per session and then reveals the page', async ({ page }) => {
  await page.goto('/es');
  const preloader = page.locator('[data-preloader]');
  await expect(preloader).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 6000 });
  await expect(preloader).toBeHidden();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-intro', /skip|done/);
  await expect(preloader).toBeHidden();
});

test('skips the preloader with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/es');
  await expect(page.locator('[data-preloader]')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('shows the custom cursor only with a fine pointer', async ({ page }) => {
  await page.goto('/es');
  await page.mouse.move(200, 200);
  await expect(page.locator('[data-custom-cursor]')).toHaveCount(1);
});
