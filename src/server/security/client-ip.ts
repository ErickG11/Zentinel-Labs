import 'server-only';
import { isIP } from 'node:net';

// IMPORTANTE: estas cabeceras solo son confiables si el despliegue está detrás de un
// proxy que las sobrescriba (Vercel y Cloudflare lo hacen). Sin proxy, un cliente
// podría falsificarlas y evadir el rate limit.
const readSingle = (headers: Headers, name: string): string | undefined =>
  headers.get(name)?.trim() || undefined;

const readForwardedFor = (headers: Headers): string | undefined =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined;

export const getClientIp = (headers: Headers): string => {
  const candidates = [
    readSingle(headers, 'cf-connecting-ip'),
    readSingle(headers, 'x-vercel-forwarded-for'),
    readSingle(headers, 'x-real-ip'),
    readForwardedFor(headers),
  ];
  for (const candidate of candidates) {
    if (candidate && isIP(candidate) !== 0) return candidate;
  }
  return 'unknown';
};
