import { describe, expect, it } from 'vitest';
import { formatCount, ringDashOffset } from '@/lib/numbers';

describe('formatCount', () => {
  it('rounds to an integer string', () => {
    expect(formatCount(42.6)).toBe('43');
    expect(formatCount(0)).toBe('0');
  });
});

describe('ringDashOffset', () => {
  it('leaves the part of the circumference not covered by the level', () => {
    expect(ringDashOffset(100, 200)).toBe(0);
    expect(ringDashOffset(0, 200)).toBe(200);
    expect(ringDashOffset(25, 200)).toBe(150);
  });

  it('clamps out-of-range levels', () => {
    expect(ringDashOffset(140, 200)).toBe(0);
    expect(ringDashOffset(-5, 200)).toBe(200);
  });
});
