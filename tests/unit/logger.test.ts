import { describe, expect, it, vi } from 'vitest';
import { createLogger } from '@/server/logger';

describe('createLogger', () => {
  it('writes structured entries at or above the minimum level', () => {
    const write = vi.fn();
    const log = createLogger({ minLevel: 'info', write });
    log.debug('hidden');
    log.warn('contact.rate_limited', { remaining: 0 });
    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0][0]).toMatchObject({
      level: 'warn',
      message: 'contact.rate_limited',
      context: { remaining: 0 },
    });
  });
});
