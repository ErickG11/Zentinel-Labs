import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContactSuccess } from '@/components/contact/contact-success';
import { FieldError } from '@/components/contact/field-error';
import { getCounterState } from '@/components/contact/message-counter';

describe('getCounterState', () => {
  it('moves through the thresholds', () => {
    expect(getCounterState(0)).toBe('empty');
    expect(getCounterState(5)).toBe('below-min');
    expect(getCounterState(20)).toBe('ok');
    expect(getCounterState(1799)).toBe('ok');
    expect(getCounterState(1800)).toBe('near-max');
    expect(getCounterState(2000)).toBe('at-max');
  });
});

describe('ContactSuccess', () => {
  it('renders the next steps, reply time and reset button as a status region', () => {
    const html = renderToStaticMarkup(
      <ContactSuccess
        title="Mensaje enviado"
        next="Revisaremos tu proyecto"
        reply="Te responderemos por email en menos de 24 h."
        resetLabel="Enviar otro mensaje"
        onReset={() => undefined}
      />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('Te responderemos por email en menos de 24 h.');
    expect(html).toContain('Enviar otro mensaje');
  });
});

describe('FieldError', () => {
  it('is an alert with a decorative icon, and renders nothing without text', () => {
    const html = renderToStaticMarkup(<FieldError id="x-error">Ingresa tu nombre</FieldError>);
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-hidden="true"');
    expect(renderToStaticMarkup(<FieldError id="x-error">{undefined}</FieldError>)).toBe('');
  });
});
