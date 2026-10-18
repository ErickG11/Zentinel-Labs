import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins truthy class names with a single space', () => {
    expect(cn('glass', false, 'rounded-2xl', null, undefined, '', 'p-6')).toBe(
      'glass rounded-2xl p-6',
    );
  });
});
