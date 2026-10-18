import { describe, expect, it } from 'vitest';
import { InMemoryRateLimiter } from '@/server/security/rate-limiter';

describe('InMemoryRateLimiter', () => {
  it('allows up to the limit inside the window and blocks afterwards', async () => {
    let now = 0;
    const limiter = new InMemoryRateLimiter({ limit: 2, windowMs: 1000, now: () => now });
    expect((await limiter.consume('ip')).allowed).toBe(true);
    expect((await limiter.consume('ip')).allowed).toBe(true);
    const blocked = await limiter.consume('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    now = 1001;
    expect((await limiter.consume('ip')).allowed).toBe(true);
  });

  it('tracks keys independently', async () => {
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    expect((await limiter.consume('a')).allowed).toBe(true);
    expect((await limiter.consume('b')).allowed).toBe(true);
    expect((await limiter.consume('a')).allowed).toBe(false);
  });
});
