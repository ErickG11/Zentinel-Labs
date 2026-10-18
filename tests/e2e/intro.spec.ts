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

test.describe('custom cursor', () => {
  test('follows the pointer and grows over interactive elements', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'done', { timeout: 8000 });
    await page.mouse.move(300, 300);
    await page.mouse.move(320, 320);

    const cursor = page.locator('[data-custom-cursor]');
    await expect(page.locator('html')).toHaveClass(/has-custom-cursor/);
    await expect(cursor).toBeVisible();
    await expect(cursor).toHaveCSS('opacity', '1');

    const ring = cursor.locator('> div').first();
    const before = await ring.boundingBox();
    await page.getByRole('button', { name: 'Cambiar tema' }).hover();
    await expect
      .poll(async () => (await ring.boundingBox())?.width ?? 0, { timeout: 5000 })
      .toBeGreaterThanOrEqual(60);
    expect(before?.width ?? 0).toBeLessThan(60);
    await context.close();
  });

  test('is absent with reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/es');
    await page.mouse.move(200, 200);
    await expect(page.locator('[data-custom-cursor]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveClass(/has-custom-cursor/);
    await context.close();
  });

  test('is absent on touch devices', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('/es');
    await expect(page.locator('[data-custom-cursor]')).toHaveCount(0);
    await context.close();
  });
});
