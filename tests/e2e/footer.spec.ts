import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const width of [390, 1440]) {
  test(`footer shows navigation, copyright and no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/es');
    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('navigation', { name: 'Navegación' }).getByRole('link'),
    ).toHaveCount(4);
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Zentinel Labs`);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}
