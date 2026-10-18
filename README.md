# Zentinel Labs — Sitio web

Sitio corporativo de Zentinel Labs (desarrollo de software a medida). Next.js 16 + TypeScript + Tailwind CSS v4, animaciones con GSAP, Lenis, Motion y React Three Fiber, bilingüe ES/EN.

## Requisitos

- Node.js ≥ 20.9
- npm

## Inicio rápido

```bash
npm install
cp .env.example .env.local   # completar valores (ver abajo)
npm run dev                  # http://localhost:3000
```

## Variables de entorno

| Variable                                                   | Uso                                               |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                     | URL pública (canonical, sitemap, OG)              |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                              | Número de WhatsApp (solo dígitos)                 |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Envío del formulario con Resend                   |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`   | Cloudflare Turnstile (anti-bots)                  |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`       | Rate limit compartido (requerido en serverless)   |
| `TRUSTED_PROXY`                                            | `vercel` / `cloudflare` / `other` / `none` (def.) |

Sin las variables de Resend el sitio funciona y el formulario ofrece WhatsApp como alternativa.

## Scripts

| Script                                    | Descripción                                  |
| ----------------------------------------- | -------------------------------------------- |
| `npm run dev`                             | Desarrollo                                   |
| `npm run build` / `npm run start`         | Build y servidor de producción               |
| `npm run lint` / `npm run typecheck`      | ESLint / TypeScript                          |
| `npm run format` / `npm run format:check` | Prettier                                     |
| `npm run test`                            | Tests unitarios (Vitest)                     |
| `npm run test:e2e`                        | Tests E2E + accesibilidad (Playwright + axe) |

Antes de `npm run test:e2e` ejecuta una sola vez `npx playwright install chromium`.

## Seguridad

- CSP estricta con nonce por request (`src/proxy.ts`) y headers de seguridad (`src/lib/security/headers.ts`).
- Formulario: honeypot, rate limit (5/h por IP), Turnstile y validación Zod en cliente y servidor.
- Secretos solo en servidor, validados al arrancar (`src/server/env.ts`).
- `npm audit` en CI y Dependabot semanal.

## Despliegue

- **Upstash es obligatorio en hosting serverless o con varias instancias.** Sin `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` el rate limit usa memoria por instancia (cada instancia cuenta por separado y se reinicia en cada arranque en frío), por lo que no limita de verdad. En producción la app registra un aviso `contact.rate_limiter_in_memory` al crear el limiter.
- Define `TRUSTED_PROXY` según tu hosting (`vercel`, `cloudflare`, `other` o `none`). Con `none` toda solicitud comparte una cubeta de 30/hora.

## Seguridad y despliegue

Checklist antes de publicar:

- [ ] Variables de entorno de producción definidas: `NEXT_PUBLIC_SITE_URL` (https, dominio final), `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `UPSTASH_REDIS_REST_URL`/`TOKEN` y `TRUSTED_PROXY`.
- [ ] `TRUSTED_PROXY` coincide con el proxy real delante de la app. Un valor incorrecto permite falsificar la IP y evadir el rate limit.
- [ ] Claves reales de Turnstile (no las de prueba `1x0000…`), con el widget restringido a tu dominio. En producción el servidor también valida el hostname de la respuesta contra `NEXT_PUBLIC_SITE_URL`.
- [ ] Upstash configurado si el hosting es serverless o multi-instancia.
- [ ] Dominio de Resend verificado con SPF, DKIM y DMARC.
- [ ] El CDN no debe cachear el HTML con nonce por request (CSP) y debe variar por `RSC` y `Next-Router-Prefetch`, para no mezclar respuestas RSC con HTML ni servir nonces repetidos.
- [ ] HSTS: la cabecera incluye `preload`; enviar el dominio a la lista de preload es difícil de revertir. Confirma que todos los subdominios soportan HTTPS antes.
- [ ] Server Actions: `allowedOrigins` se deriva de `NEXT_PUBLIC_SITE_URL` (host y `www.`); en local aplica el chequeo de mismo origen por defecto.
- [ ] Recomendado: publicar un aviso de privacidad, porque el formulario recoge nombre, correo y mensaje.

## Estructura

```
src/
├── app/            # rutas (App Router) y metadata routes
├── components/     # sections, layout, ui, hero, three, case, contact, remote, providers
├── content/        # contenido tipado ES/EN
├── hooks/          # hooks de cliente
├── i18n/           # next-intl
├── lib/            # utilidades compartidas (animación, seo, validación…)
├── messages/       # textos de interfaz
└── server/         # lógica solo de servidor (contacto, seguridad, env, logger)
```
