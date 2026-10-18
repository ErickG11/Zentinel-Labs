import { describe, expect, it } from 'vitest';
import { buildAlternates, serializeJsonLd } from '@/lib/seo';

describe('buildAlternates', () => {
  it('sets the canonical for the current locale and hreflang for every locale plus x-default', () => {
    expect(buildAlternates('en', (locale) => `/${locale}`)).toEqual({
      canonical: '/en',
      languages: { es: '/es', en: '/en', 'x-default': '/es' },
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapes "<" so the payload cannot close the script tag', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('</script>');
    expect(JSON.parse(output)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
