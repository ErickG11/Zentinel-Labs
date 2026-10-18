import 'server-only';

// Detrás de un proxy de confianza (Vercel/Cloudflare) el primer valor es la IP real
export const getClientIp = (headers: Headers): string => {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get('x-real-ip')?.trim() || 'unknown';
};
