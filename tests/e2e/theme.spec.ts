import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('theme toggle switches to light and persists across reloads without flashing', async ({
  page,
}) => {
  await page.goto('/es');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/\blight\b/);

  await page.getByRole('button', { name: 'Cambiar tema' }).click();
  await expect(html).toHaveClass(/\blight\b/);

  // La clase debe existir ya en el primer paint, antes de que hidrate React
  await page.reload({ waitUntil: 'commit' });
  await page.waitForFunction(() => document.body !== null);
  expect(await page.evaluate(() => document.documentElement.classList.contains('light'))).toBe(
    true,
  );

  await page.getByRole('button', { name: 'Cambiar tema' }).click();
  await expect(html).not.toHaveClass(/\blight\b/);
});
