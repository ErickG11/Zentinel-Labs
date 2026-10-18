export const CSP_NONCE_HEADER = 'x-nonce';

const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';

export interface CspOptions {
  nonce: string;
  isDev: boolean;
  upgradeInsecureRequests: boolean;
}

export const buildCsp = ({ nonce, isDev, upgradeInsecureRequests }: CspOptions): string => {
  const nonceSource = `'nonce-${nonce}'`;

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // React usa eval solo en desarrollo para reconstruir stacks de error
    'script-src': [
      "'self'",
      nonceSource,
      "'strict-dynamic'",
      TURNSTILE_ORIGIN,
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    // Fallback para navegadores sin soporte de style-src-elem/attr
    'style-src': ["'self'", "'unsafe-inline'"],
    'style-src-elem': ["'self'", isDev ? "'unsafe-inline'" : nonceSource],
    // Motion/GSAP renderizan estilos inline en el HTML del servidor
    'style-src-attr': ["'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
    'frame-src': [TURNSTILE_ORIGIN],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (upgradeInsecureRequests) policy.push('upgrade-insecure-requests');

  return policy.join('; ');
};
