import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('opens a case study from the projects list', async ({ page }) => {
  await page.goto('/es');
  await page
    .locator('#work')
    .getByRole('link', { name: /Pan de Vida/ })
    .click();
  await expect(page).toHaveURL(/\/es\/proyectos\/pan-de-vida$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pan de Vida');
  await expect(page.getByText('El reto')).toBeVisible();
});

test('serves the english localized path', async ({ page }) => {
  await page.goto('/en/work/gas-solutions');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gas Solutions');
  await expect(page).toHaveTitle(/Gas Solutions — Case study/);
});

test('switching locale on a case keeps the project', async ({ page }) => {
  await page.goto('/es/proyectos/gas-solutions');
  await page
    .getByRole('group', { name: 'Cambiar idioma' })
    .getByRole('button', { name: 'en' })
    .click();
  await expect(page).toHaveURL(/\/en\/work\/gas-solutions$/);
});

test('unknown case returns 404', async ({ request }) => {
  const response = await request.get('/es/proyectos/no-existe');
  expect(response.status()).toBe(404);
});

test('next project link navigates to the other case', async ({ page }) => {
  await page.goto('/es/proyectos/pan-de-vida');
  await page.getByRole('link', { name: /Siguiente proyecto/ }).click();
  await expect(page).toHaveURL(/\/es\/proyectos\/gas-solutions$/);
});
