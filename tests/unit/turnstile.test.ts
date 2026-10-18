import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstileToken } from '@/server/security/turnstile';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('verifyTurnstileToken', () => {
  it('posts secret, token and ip and accepts a successful verification', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    await expect(
      verifyTurnstileToken({ token: 't', secret: 's', remoteIp: '203.0.113.7', fetchImpl }),
    ).resolves.toBe(true);
    const body = fetchImpl.mock.calls[0][1].body as URLSearchParams;
    expect(body.get('secret')).toBe('s');
    expect(body.get('response')).toBe('t');
    expect(body.get('remoteip')).toBe('203.0.113.7');
  });

  it('rejects failed verifications, HTTP errors and network errors', async () => {
    await expect(
      verifyTurnstileToken({
        token: 't',
        secret: 's',
        fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ success: false })),
      }),
    ).resolves.toBe(false);
    await expect(
      verifyTurnstileToken({
        token: 't',
        secret: 's',
        fetchImpl: vi.fn().mockResolvedValue(jsonResponse({}, 500)),
      }),
    ).resolves.toBe(false);
    await expect(
      verifyTurnstileToken({
        token: 't',
        secret: 's',
        fetchImpl: vi.fn().mockRejectedValue(new Error('offline')),
      }),
    ).resolves.toBe(false);
  });
});
