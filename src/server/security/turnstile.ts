import 'server-only';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface VerifyOptions {
  token: string;
  secret: string;
  remoteIp?: string;
  fetchImpl?: typeof fetch;
}

interface SiteVerifyResponse {
  success?: unknown;
}

export const verifyTurnstileToken = async ({
  token,
  secret,
  remoteIp,
  fetchImpl = fetch,
}: VerifyOptions): Promise<boolean> => {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const response = await fetchImpl(VERIFY_URL, { method: 'POST', body });
    if (!response.ok) return false;
    const data = (await response.json()) as SiteVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
};
