import 'server-only';
import { isIP } from 'node:net';

// Modo de confianza en proxies (variable TRUSTED_PROXY). Solo se leen las cabeceras
// que el proxy declarado sobrescribe; el resto se ignora porque el cliente las puede falsificar.
export const TRUSTED_PROXY_MODES = ['vercel', 'cloudflare', 'other', 'none'] as const;
export type TrustedProxy = (typeof TRUSTED_PROXY_MODES)[number];

export const UNKNOWN_IP = 'unknown';

const readSingle = (headers: Headers, name: string): string | undefined =>
  headers.get(name)?.trim() || undefined;

// La entrada más a la derecha es la que añadió el proxy de confianza más cercano
const readRightmostForwardedFor = (headers: Headers): string | undefined => {
  const parts = headers.get('x-forwarded-for')?.split(',');
  return parts?.[parts.length - 1]?.trim() || undefined;
};

const candidatesFor = (headers: Headers, mode: TrustedProxy): Array<string | undefined> => {
  switch (mode) {
    case 'vercel':
      return [readSingle(headers, 'x-vercel-forwarded-for'), readSingle(headers, 'x-real-ip')];
    case 'cloudflare':
      return [readSingle(headers, 'cf-connecting-ip')];
    case 'other':
      return [readRightmostForwardedFor(headers)];
    case 'none':
      return [];
  }
};

export const getClientIp = (headers: Headers, mode: TrustedProxy = 'none'): string => {
  for (const candidate of candidatesFor(headers, mode)) {
    if (candidate && isIP(candidate) !== 0) return candidate;
  }
  return UNKNOWN_IP;
};
