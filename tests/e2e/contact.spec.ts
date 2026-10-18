import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('shows localized validation errors on an empty submit', async ({ page }) => {
  await page.goto('/es#contact');
  const form = page.locator('#contact form');
  await form.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(form.getByText('Ingresa tu nombre')).toBeVisible();
  await expect(form.getByText('Ingresa un email válido')).toBeVisible();
  await expect(form.getByText('Elige un tipo de proyecto')).toBeVisible();
});

test('submits through the server action and offers WhatsApp when email is not configured', async ({
  page,
}) => {
  const violations: string[] = [];
  page.on('console', (message) => {
    if (/content security policy/i.test(message.text())) violations.push(message.text());
  });
  await page.goto('/es#contact');
  const form = page.locator('#contact form');
  await form.getByLabel('Nombre').fill('Ana Pérez');
  await form.getByLabel('Email').fill('ana@empresa.com');
  await form.getByText('App web a medida').click();
  await form.getByText('Aún no lo sé').click();
  await form
    .getByLabel('Cuéntanos sobre tu proyecto')
    .fill('Necesitamos un sistema de reservas para la clínica.');
  // La clave de prueba de Turnstile resuelve sola
  await form.scrollIntoViewIfNeeded();
  await expect(form.locator('input[name="turnstileToken"]')).toHaveValue(/.+/, { timeout: 20_000 });
  await form.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(form.getByRole('status')).toContainText('no está disponible');
  await expect(form.getByRole('link', { name: 'Escríbenos por WhatsApp' })).toHaveAttribute(
    'href',
    /wa\.me\/593000000000/,
  );
  expect(violations).toEqual([]);
});

test('faq accordion toggles with the keyboard', async ({ page }) => {
  await page.goto('/en#faq');
  const question = page.getByRole('button', { name: 'How much does it cost?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Every project is quoted individually')).toBeVisible();
});
