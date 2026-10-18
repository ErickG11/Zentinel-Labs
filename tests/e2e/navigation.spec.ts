import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('/es');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('switches locale keeping the page', async ({ page }) => {
  await page.goto('/es');
  await page
    .getByRole('group', { name: 'Cambiar idioma' })
    .getByRole('button', { name: 'en' })
    .click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('mobile menu opens, traps Escape and closes', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/es');
  const toggle = page.getByRole('button', { name: 'Abrir menú' });
  await toggle.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await context.close();
});
