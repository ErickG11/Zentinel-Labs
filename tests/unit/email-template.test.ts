import { describe, expect, it } from 'vitest';
import { UNTRUSTED_BANNER, escapeHtml, renderContactEmail } from '@/server/contact/email-template';

describe('escapeHtml', () => {
  it('neutralizes HTML special characters', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    );
  });
});

describe('renderContactEmail', () => {
  const input = {
    name: 'Eve\r\nBcc: x@evil.com',
    email: 'eve@example.com',
    company: '<b>ACME</b>',
    projectType: 'ecommerce' as const,
    message: 'Hola <img src=x onerror=alert(1)>',
    turnstileToken: 't',
  };

  it('escapes user content in the HTML body', () => {
    const { html } = renderContactEmail(input);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;b&gt;ACME&lt;/b&gt;');
  });

  it('strips line breaks from the subject to prevent header injection', () => {
    expect(renderContactEmail(input).subject).not.toMatch(/[\r\n]/);
  });

  it('puts the untrusted-content banner at the top of both parts', () => {
    const { html, text } = renderContactEmail(input);
    expect(UNTRUSTED_BANNER).toContain('No hagas clic en enlaces ni abras adjuntos');
    expect(html.indexOf(UNTRUSTED_BANNER)).toBeGreaterThan(-1);
    expect(html.indexOf(UNTRUSTED_BANNER)).toBeLessThan(html.indexOf('<h2>'));
    expect(text.startsWith(`*** ${UNTRUSTED_BANNER}`)).toBe(true);
  });
});
