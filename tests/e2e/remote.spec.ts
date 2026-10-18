import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('remote section renders the globe after loading land data', async ({ page }) => {
  await page.goto('/es');
  const section = page.getByRole('region', { name: 'Desde Ecuador, para el mundo' });
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator('canvas')).toBeVisible();
  await expect(section.getByText('Arrastra para rotar · Ctrl + scroll para zoom')).toBeVisible();
  await expect(section.getByText('No se pudo cargar el mapa')).toHaveCount(0);
});

test('globe is an accessible focusable image and the wheel does not trap page scroll', async ({
  page,
}) => {
  await page.goto('/es');
  const section = page.getByRole('region', { name: 'Desde Ecuador, para el mundo' });
  await section.scrollIntoViewIfNeeded();
  const globe = section.getByRole('img', { name: /Globo terráqueo interactivo/ });
  await expect(globe).toBeVisible();
  await expect(globe).toHaveAttribute('tabindex', '0');

  const prevented = await globe.evaluate((canvas) => {
    const plain = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
    canvas.dispatchEvent(plain);
    const zoom = new WheelEvent('wheel', {
      deltaY: 100,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    canvas.dispatchEvent(zoom);
    return { plain: plain.defaultPrevented, ctrl: zoom.defaultPrevented };
  });
  expect(prevented).toEqual({ plain: false, ctrl: true });

  const box = await globe.boundingBox();
  if (!box) throw new Error('globe without box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
});
