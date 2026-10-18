import { expect, test } from '@playwright/test';

test('home declares canonical, hreflang and structured data', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en$/);
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    'href',
    /\/es$/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    /\/es$/,
  );
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? '{}')['@graph'][0]['@type']).toBe('ProfessionalService');
});

test('sitemap lists every localized page', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/es', '/en', '/es/proyectos/pan-de-vida', '/en/work/gas-solutions']) {
    expect(body).toContain(path);
  }
});

test('robots allows crawling and links the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Allow: /');
  expect(body).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test('open graph image renders', async ({ request }) => {
  const response = await request.get('/es/opengraph-image');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
});

test('unknown routes show the localized 404 page', async ({ page }) => {
  const response = await page.goto('/en/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
});

test('case pages point hreflang to the localized path', async ({ page }) => {
  await page.goto('/es/proyectos/gas-solutions');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    /\/en\/work\/gas-solutions$/,
  );
});
