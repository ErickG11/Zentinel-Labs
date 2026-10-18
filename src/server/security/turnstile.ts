import 'server-only';

const TIMEOUT_MS = 5000;
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface VerifyOptions {
  token: string;
  secret: string;
  remoteIp?: string;
  // Si se indica, el hostname de la respuesta debe coincidir (o su variante www.)
  expectedHostname?: string;
  fetchImpl?: typeof fetch;
}

interface SiteVerifyResponse {
  success?: unknown;
  hostname?: unknown;
}

const hostnameMatches = (actual: unknown, expected: string): boolean => {
  if (typeof actual !== 'string') return false;
  const bare = expected.toLowerCase().replace(/^www\./, '');
  const received = actual.toLowerCase();
  return received === bare || received === `www.${bare}`;
};

export const verifyTurnstileToken = async ({
  token,
  secret,
  remoteIp,
  expectedHostname,
  fetchImpl = fetch,
}: VerifyOptions): Promise<boolean> => {
  const body = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const response = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return false;
    const data = (await response.json()) as SiteVerifyResponse;
    if (data.success !== true) return false;
    if (expectedHostname === undefined) return true;
    return hostnameMatches(data.hostname, expectedHostname);
  } catch {
    return false;
  }
};
