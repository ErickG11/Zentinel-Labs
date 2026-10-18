import { expect, test } from '@playwright/test';

const redirects = [
  ['es-EC', 'es'],
  ['en-US', 'en'],
  ['fr-FR', 'es'],
] as const;

for (const [browserLocale, expected] of redirects) {
  test(`root redirects a ${browserLocale} browser to /${expected}`, async ({ browser }) => {
    const context = await browser.newContext({ locale: browserLocale });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`/${expected}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', expected);
    await context.close();
  });
}

test('renders localized copy for each locale', async ({ page }) => {
  await page.goto('/es');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Software a medida');
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Custom software');
});

test('responds with security headers', async ({ request }) => {
  const response = await request.get('/es');
  const headers = response.headers();
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['strict-transport-security']).toContain('max-age=63072000');
  expect(headers['x-powered-by']).toBeUndefined();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
});

// Los scripts inline son la superficie de XSS: todos deben llevar el nonce.
// Los chunks externos cargados después los autoriza 'strict-dynamic'.
test('uses a fresh nonce per request and applies it to every inline script', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });

  const first = await page.goto('/es');
  const csp = first?.headers()['content-security-policy'] ?? '';
  const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
  expect(nonce).toBeTruthy();

  const scriptsWithoutNonce = await page.evaluate(
    (expected) =>
      Array.from(document.scripts).filter((script) => !script.src && script.nonce !== expected)
        .length,
    nonce,
  );
  expect(scriptsWithoutNonce).toBe(0);

  const second = await page.reload();
  expect(second?.headers()['content-security-policy']).not.toContain(`'nonce-${nonce}'`);

  await page.waitForLoadState('networkidle');
  expect(violations).toEqual([]);
});
