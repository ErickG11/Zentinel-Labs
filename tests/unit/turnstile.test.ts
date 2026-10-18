import { describe, expect, it, vi } from 'vitest';
import { verifyTurnstileToken } from '@/server/security/turnstile';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('verifyTurnstileToken', () => {
  it('posts secret, token and ip with no-store cache and an abort signal', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    await expect(
      verifyTurnstileToken({ token: 't', secret: 's', remoteIp: '203.0.113.7', fetchImpl }),
    ).resolves.toBe(true);
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const body = init.body as URLSearchParams;
    expect(body.get('secret')).toBe('s');
    expect(body.get('response')).toBe('t');
    expect(body.get('remoteip')).toBe('203.0.113.7');
    expect(init.cache).toBe('no-store');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('omits remoteip when the ip is unknown', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true }));
    await verifyTurnstileToken({ token: 't', secret: 's', remoteIp: 'unknown', fetchImpl });
    expect((fetchImpl.mock.calls[0][1].body as URLSearchParams).has('remoteip')).toBe(false);
  });

  it('rejects failed verifications, non-boolean success, HTTP and network errors', async () => {
    const run = (fetchImpl: typeof fetch) =>
      verifyTurnstileToken({ token: 't', secret: 's', fetchImpl });
    await expect(run(vi.fn().mockResolvedValue(jsonResponse({ success: false })))).resolves.toBe(
      false,
    );
    await expect(run(vi.fn().mockResolvedValue(jsonResponse({ success: 'true' })))).resolves.toBe(
      false,
    );
    await expect(run(vi.fn().mockResolvedValue(jsonResponse({}, 500)))).resolves.toBe(false);
    await expect(run(vi.fn().mockRejectedValue(new Error('offline')))).resolves.toBe(false);
  });

  it('uses a 5s timeout and fails closed when the request is aborted', async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
    const fetchImpl = vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError'));
    try {
      await expect(verifyTurnstileToken({ token: 't', secret: 's', fetchImpl })).resolves.toBe(
        false,
      );
      expect(timeoutSpy).toHaveBeenCalledWith(5000);
    } finally {
      timeoutSpy.mockRestore();
    }
  });

  it('sends a fresh idempotency_key per verification', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => jsonResponse({ success: true }));
    await verifyTurnstileToken({ token: 't', secret: 's', fetchImpl });
    await verifyTurnstileToken({ token: 't', secret: 's', fetchImpl });
    const keys = fetchImpl.mock.calls.map((call) =>
      (call[1].body as URLSearchParams).get('idempotency_key'),
    );
    expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/);
    expect(keys[0]).not.toBe(keys[1]);
  });

  describe('hostname check', () => {
    const run = (hostname: unknown, expectedHostname?: string) =>
      verifyTurnstileToken({
        token: 't',
        secret: 's',
        expectedHostname,
        fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ success: true, hostname })),
      });

    it('accepts the expected hostname and its www variant', async () => {
      await expect(run('zentinel.dev', 'zentinel.dev')).resolves.toBe(true);
      await expect(run('www.zentinel.dev', 'zentinel.dev')).resolves.toBe(true);
      await expect(run('zentinel.dev', 'www.zentinel.dev')).resolves.toBe(true);
    });

    it('rejects a mismatched hostname', async () => {
      await expect(run('evil.example', 'zentinel.dev')).resolves.toBe(false);
      await expect(run('sub.zentinel.dev', 'zentinel.dev')).resolves.toBe(false);
    });

    it('rejects a missing hostname when one is expected', async () => {
      await expect(run(undefined, 'zentinel.dev')).resolves.toBe(false);
    });

    it('skips the check when no hostname is expected', async () => {
      await expect(run('example.com')).resolves.toBe(true);
      await expect(run(undefined)).resolves.toBe(true);
    });
  });
});
