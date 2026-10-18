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

test('mobile menu is a modal dialog: focus moves in, Escape closes and refocuses the toggle', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/es');
  const toggle = page.getByRole('button', { name: 'Abrir menú' });
  await toggle.click();

  const dialog = page.getByRole('dialog', { name: 'Menú de navegación' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByRole('link').first()).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.locator('footer')).toHaveAttribute('inert', '');

  // Tab no escapa del dialogo
  for (let i = 0; i < 12; i += 1) await page.keyboard.press('Tab');
  const focusInside = await page.evaluate(
    () =>
      Boolean(document.activeElement?.closest('#mobile-menu')) ||
      document.activeElement?.getAttribute('aria-controls') === 'mobile-menu',
  );
  expect(focusInside).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await context.close();
});

test('mobile navbar shows a compact quote button without horizontal overflow', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/es');
  await expect(
    page.locator('header').getByRole('link', { name: 'Cotizar', exact: true }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await context.close();
});

test('keyboard focus keeps the navbar visible after scrolling down', async ({ page }) => {
  await page.goto('/es');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.evaluate(() => window.scrollTo(0, 900));
  const header = page.locator('header');
  await expect.poll(async () => (await header.boundingBox())?.y ?? 0).toBeLessThan(-20);
  await page.getByRole('button', { name: 'Cambiar a modo claro' }).focus();
  await expect.poll(async () => (await header.boundingBox())?.y ?? -999).toBeGreaterThanOrEqual(0);
});
