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

| Variable                                                   | Uso                                             |
| ---------------------------------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                     | URL pública (canonical, sitemap, OG)            |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                              | Número de WhatsApp (solo dígitos)               |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Envío del formulario con Resend                 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`   | Cloudflare Turnstile (anti-bots)                |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`       | Rate limit compartido (requerido en serverless) |

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
