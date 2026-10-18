# Zentinel Labs — Sitio web corporativo (Design Spec)

- **Fecha:** 2026-10-17
- **Autor:** Erick Mateo Granda Delgado
- **Estado:** Pendiente de revisión

## 1. Objetivo

Sitio web corporativo de **Zentinel Labs**, empresa de desarrollo de software a medida (webs corporativas/landing, apps web a medida, e-commerce). Debe transmitir profesionalismo con una estética monocroma premium y animaciones de nivel "Awwwards", ser bilingüe (ES/EN), estar bien posicionado en SEO y convertir visitas en solicitudes de cotización.

**Criterios de éxito**
- Lighthouse: Performance ≥ 90 (desktop), Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- Contraste WCAG AA en ambos temas; navegación completa por teclado.
- Formulario de contacto funcional, validado y protegido contra spam/abuso.
- Experiencia completa sin animación cuando `prefers-reduced-motion: reduce`.
- Headers de seguridad con calificación A+ en securityheaders.com.

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Server Components, Server Actions) |
| Lenguaje | TypeScript estricto (`strict: true`, sin `any`) |
| Estilos | Tailwind CSS v4 (tokens vía `@theme` + CSS variables) |
| Animación scroll | GSAP + ScrollTrigger + SplitText (`@gsap/react` → `useGSAP`) |
| Smooth scroll | Lenis, sincronizado con `gsap.ticker` |
| Micro-interacciones | Motion (`motion/react`) |
| 3D | React Three Fiber + @react-three/drei |
| Globo | d3-geo sobre `<canvas>` (port del portfolio a TS) |
| i18n | next-intl (rutas `/es`, `/en`; `es` por defecto) |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`) |
| Email | Resend |
| Anti-bot | Cloudflare Turnstile + honeypot |
| Iconos | lucide-react + SVG custom de marcas |
| Calidad | ESLint + Prettier, Vitest, Playwright |

Las versiones exactas se fijan en el plan de implementación.

## 3. Arquitectura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # fuentes, providers, Lenis, cursor, nav, footer
│   │   ├── page.tsx                # home one-page
│   │   ├── proyectos/[slug]/page.tsx   # caso de estudio (SSG)
│   │   └── not-found.tsx
│   ├── sitemap.ts · robots.ts
│   └── [locale]/opengraph-image.tsx
├── proxy.ts                        # next-intl routing + CSP con nonce (middleware de Next 16)
├── components/
│   ├── sections/                   # Hero, TechTicker, Manifesto, Services, Process,
│   │                               # Stats, Projects, Remote, Faq, Contact, Footer
│   ├── layout/                     # Navbar, Preloader, PageTransition, ThemeToggle, LocaleSwitch
│   ├── ui/                         # MagneticButton, RollText, Cursor, Marquee,
│   │                               # SplitReveal, GlassCard, Eyebrow, WhatsAppFab
│   └── three/                      # SentinelScene (R3F) + fallback ligero
├── lib/
│   ├── animations/                 # useSplitReveal, useScrubReveal, usePinnedSection…
│   ├── motion.ts                   # easings y duraciones compartidos
│   └── utils.ts
├── content/                        # services.ts, process.ts, projects.ts, faq.ts (tipado, ES/EN)
├── server/
│   ├── contact/                    # action.ts, schema.ts, email-template.ts
│   ├── security/                   # rate-limiter.ts (interfaz + impl), turnstile.ts
│   ├── env.ts                      # validación de env con Zod (server-only)
│   └── logger.ts
├── i18n/                           # routing.ts, request.ts
└── messages/                       # es.json, en.json (textos de UI)
```

**Principios**
- Server Components por defecto; `"use client"` solo en componentes interactivos/animados.
- Contenido separado de presentación: secciones reciben datos tipados de `content/`.
- Hooks de animación reutilizables en `lib/animations/` (DRY); cada hook limpia sus ScrollTriggers (`useGSAP` con scope).
- `RateLimiter` como interfaz (Strategy) con implementación en memoria por defecto e implementación Upstash Redis opcional, seleccionada por env.

## 4. Sistema visual

**Paleta (dark-first, toggle a claro, persistido en `localStorage`, script anti-FOUC en `<head>` con nonce)**

| Token | Oscuro | Claro |
|---|---|---|
| `--color-page` | `#0A0A0A` | `#F5F5F4` |
| `--color-ink` | `#F5F5F5` | `#0A0A0A` |
| `--color-muted` | `#8A8A8A` | `#5C5C5C` |
| `--color-surface` | `rgba(255,255,255,0.04)` | `rgba(10,10,10,0.04)` |
| `--color-border` | `rgba(255,255,255,0.08)` | `rgba(10,10,10,0.09)` |
| `--color-accent` (plano) | `#3D7BFF` | `#3D7BFF` |
| `--color-accent-ink` (texto) | `#6E9BFF` | `#1F55D6` |

- **Acento azul eléctrico** solo en: puntos de estado, pin del globo, cursor de terminal, `::selection`, focus ring, indicador de progreso de scroll.
- **Glass**: `background: var(--color-surface); border: 1px solid var(--color-border); backdrop-filter: blur(20px)`.
- **Fondo global**: 3 blobs blancos/grises al 4–6% con animación `blob` (12s, delays 0/-4/-8s) + capa de grano (noise SVG) al ~4%.
- **Texto gradiente**: `linear-gradient(90deg, var(--color-ink), var(--color-muted))`.
- **Tipografía** (via `next/font`): Space Grotesk (display), Inter (body), JetBrains Mono (labels/eyebrows `// servicios`).
- **Logo**: tipográfico `zentinel_labs` + punto azul (reemplazable).
- **Radios**: `rounded-2xl` cards, `rounded-3xl` cards grandes, `rounded-full` pills.
- **Easing**: `power3.out` / `expo.out`; nunca bounce/elastic. Desplazamientos 20–40px, escalas 0.95–1.05.
- **Patrón dashed**: borde punteado + hover de relleno reservado para cards placeholder/CTA secundario.

## 5. Elementos globales

- **Preloader**: contador 0→100 (mono) + logo; sale con cortina GSAP (`clip-path`). Solo en la primera carga de la sesión (`sessionStorage`).
- **Cursor custom**: punto + anillo con lerp; estados `default | link (crece + label "Ver"/"Abrir") | text (barra)`. Desactivado en dispositivos táctiles y con reduced-motion.
- **MagneticButton**: atracción hacia el cursor (Motion spring); hover con relleno que sube desde abajo + `RollText` (texto sale arriba / entra abajo).
- **Navbar**: entra con `y:-40 → 0`; píldora `max-w-5xl` transparente → glass al `scrollY > 20`; se oculta al bajar y reaparece al subir; barra de progreso de scroll (acento). Incluye LocaleSwitch (ES/EN), ThemeToggle (animación sol/luna del portfolio) y CTA "Cotizar". Menú móvil a pantalla completa con links en stagger.
- **Lenis**: smooth scroll global; links ancla usan `lenis.scrollTo`.
- **Transición de página**: cortina negra con el nombre de la página destino (Motion `AnimatePresence` en template).
- **WhatsAppFab**: botón flotante con pulso sutil, aparece tras el hero.

## 6. Home — secciones

Cada sección: eyebrow mono → h2 display (SplitText reveal por líneas) → contenido. Padding `py-28`/`py-32`, contenedor `max-w-6xl px-6`.

1. **Hero** — Escena R3F: esfera de partículas monocroma ("sentinel") que sigue al mouse y se deforma/dispersa con el scroll. Titular con SplitText por caracteres; frase clave en texto gradiente. Terminal typewriter (port del portfolio: 18ms/char, 120ms/línea, 2200ms/snippet, cursor azul parpadeante, highlighting simple) con snippets TS/Next, rotada -2° y enderezándose en hover. Dos CTAs magnéticos ("Cotizar proyecto", "Ver trabajos"). Indicador de scroll.
2. **TechTicker** — marquee infinito con fades laterales; velocidad y dirección ligadas a la velocidad de scroll (ScrollTrigger `getVelocity`).
3. **Manifesto** — párrafo grande; cada palabra pasa de `muted/20%` a `ink` con scrub al hacer scroll.
4. **Services** — sección pinned con 3 stacking cards (Webs corporativas/landing, Apps web a medida, E-commerce); cada card: número, título, descripción, entregables en pills, mini-ilustración animada; las anteriores se escalan/oscurecen al apilarse.
5. **Process** — scroll horizontal pinned de 5 pasos (Descubrimiento → Diseño → Desarrollo → Lanzamiento → Soporte) con línea de progreso que se dibuja.
6. **Stats** — contadores animados + tarjeta de stack con progress rings SVG (GSAP, `strokeDashoffset`, `power3.out`, stagger 0.08, ScrollTrigger `top 80%` once).
7. **Projects** — lista grande (Pan de Vida, GasSolution); en hover, preview flotante que sigue al cursor (lerp); filas con reveal `clip-path` + parallax de imagen; enlazan a `/proyectos/[slug]`. Card dashed final "Tu proyecto aquí" → contacto.
8. **Remote** — globo d3-geo del portfolio (dot-matrix gris, pin azul pulsante en Santo Domingo, Ecuador; auto-rotación, drag, zoom con wheel, re-lectura de colores al cambiar tema, estados loading/error, hint glass). Copy: trabajamos en cualquier zona horaria.
9. **FAQ** — acordeón accesible (`button` + `aria-expanded`) con altura animada (Motion). Preguntas: tiempos, costos, mantenimiento, propiedad del código, hosting, proceso de pago. Respuestas marcadas para revisión de Erick.
10. **Contact** — card glass grande con blob; formulario (ver §8); botón con estados `idle → loading → success ✓ / error`. Email y WhatsApp como alternativa.
11. **Footer** — links, redes, legal; texto gigante "ZENTINEL LABS" a ancho completo con reveal parallax.

## 7. Páginas de caso `/[locale]/proyectos/[slug]`

- Slugs válidos definidos en `content/projects.ts`; slug inexistente → `notFound()`. Render dinámico (requerido por la CSP con nonce, ver §9).
- Estructura: hero con imagen full-bleed que escala con scroll → ficha (cliente, año, rol, stack) → Reto / Solución / Resultado → galería con parallax → "Siguiente proyecto" (hover con preview, prefetch).
- Contenido derivado de los repos locales de Pan de Vida y GasSolution, **sin inventar métricas**; textos marcados `// TODO: Erick revisar`. Imágenes placeholder hasta recibir capturas reales.

## 8. Contacto (Server Action)

- **Campos**: nombre (2–80), email, empresa (opcional, ≤ 100), tipo de proyecto (`landing | webapp | ecommerce | other`), presupuesto (rangos enum), mensaje (20–2000), honeypot oculto, token Turnstile.
- **Esquema Zod único** (`server/contact/schema.ts`) usado en cliente (RHF) y re-validado en servidor.
- **Flujo servidor**: honeypot → rate limit por IP → validación Zod → verificación Turnstile → render de email con escape HTML → envío Resend (`replyTo` = email del cliente). La validación va antes del captcha porque es local y barata; el captcha implica una llamada externa.
- **Respuesta**: `{ success: true, data, message }` / `{ success: false, error, message }`; mensajes localizados.
- **Errores**: fallos de Resend/Turnstile se registran con `logger` (sin PII sensible) y el usuario ve un mensaje amigable con link a WhatsApp.
- **Env** (`.env.example` provisto; Erick crea `.env.local`): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`, opcionales `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

## 9. Seguridad

- **Decisión (2026-10-17):** se prioriza CSP con nonce sobre SSG → todas las páginas se renderizan dinámicamente por request (sin caché CDN del HTML). Costo extra en hosting: despreciable a tráfico moderado. Hosting a decidir en Fase 7 (Vercel Hobby no permite uso comercial; candidatos: Cloudflare Workers/OpenNext, Netlify, Vercel Pro).
- **Content-Security-Policy estricta con nonce** generada en `proxy.ts`: `default-src 'self'`; `script-src 'self' 'nonce-…' 'strict-dynamic' https://challenges.cloudflare.com`; `style-src-elem 'self' 'nonce-…'`; `style-src-attr 'unsafe-inline'` (estilos inline de Motion/GSAP en el HTML del servidor); `frame-src https://challenges.cloudflare.com`; `img-src 'self' data: blob:`; `connect-src 'self'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`.
- **Headers** (en `next.config.ts` `headers()`): `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara, micrófono, geolocalización, etc. deshabilitados), `Cross-Origin-Opener-Policy: same-origin`; `poweredByHeader: false`.
- **Validación**: todo input re-validado con Zod en servidor; límites de longitud; enums cerrados.
- **Anti-abuso**: honeypot + Cloudflare Turnstile + rate limit por IP (5 envíos / hora). En memoria por defecto (válido para un solo servidor); Upstash Redis si las env existen (necesario en serverless/Vercel).
- **CSRF**: Server Actions con verificación de `Origin` nativa de Next; `serverActions.allowedOrigins` restringido al dominio.
- **Inyección/XSS**: nada de `dangerouslySetInnerHTML` salvo JSON-LD serializado y escapado; contenido del email escapado.
- **Secretos**: solo vía `process.env`, validados al arrancar con Zod en `server/env.ts` marcado `import "server-only"`; ningún secreto con prefijo `NEXT_PUBLIC_`. `.env*.local` en `.gitignore`.
- **Dependencias**: lockfile comprometido, `npm audit` en CI, Dependabot semanal.
- **Logging**: `logger` centralizado (sin `console.log` en producción), sin registrar mensajes ni emails completos.
- **Errores**: `error.tsx` y `not-found.tsx` sin stack traces al usuario.

## 10. SEO e i18n

- next-intl con `localePrefix: "always"`; detección de idioma en `/` y redirección.
- `generateMetadata` por página/idioma; `alternates.languages` (hreflang ES/EN + x-default).
- OG images dinámicas con `next/og` (B/N + logo).
- `sitemap.ts` (ambos idiomas, casos incluidos), `robots.ts`, JSON-LD `Organization` + `WebSite`; `ProfessionalService` con área de servicio.
- HTML semántico (un `h1` por página, landmarks, `alt` en imágenes).

## 11. Rendimiento y accesibilidad

- R3F y globo cargados con `next/dynamic` (`ssr: false`) e `IntersectionObserver`; fallback ligero (CSS/SVG) en dispositivos con `hardwareConcurrency ≤ 4` o sin WebGL.
- `next/image` con AVIF/WebP y `sizes`; fuentes `next/font` con `display: swap`.
- Animaciones solo con `transform`/`opacity`/`clip-path`; `will-change` puntual.
- `prefers-reduced-motion`: sin Lenis, pin, scrub, 3D, cursor ni preloader; contenido estático visible.
- Focus visible con anillo azul; skip-link "Saltar al contenido"; `aria-live` para el estado del formulario.

## 12. Testing

- **Vitest**: esquema Zod de contacto, rate limiter, escape de email, helpers de contenido (`getProjectBySlug`).
- **Playwright (smoke, chromium)**: home carga en `/es` y `/en`; cambio de idioma; validaciones del formulario; página de caso abre y slug inválido da 404; navegación por teclado del menú; headers de seguridad presentes.
- `tsc --noEmit` y ESLint sin errores como gate.

## 13. Git y entrega

- Repo propio en `C:\Erick\Proyectos\Zentinel Labs` (`git init`), ramas `main` / `develop` / `feature/*`, Conventional Commits. Sin push sin orden explícita.
- Construcción por fases con aprobación entre cada una:
  1. Setup + sistema de diseño + seguridad base (headers/CSP)
  2. Globales (preloader, cursor, navbar, Lenis, transiciones, i18n)
  3. Hero 3D + ticker
  4. Manifesto, Services, Process, Stats
  5. Projects + páginas de caso + Remote (globo)
  6. FAQ + Contact (server action, Turnstile, rate limit) + Footer
  7. SEO + tests + auditoría Lighthouse

### Pasada de diseño con skills (al cierre de cada fase con UI)

Skills instaladas en `~/.claude/skills` (revisadas el 2026-10-17; commits: impeccable `08d5b47`, taste-skill `f624f37`, ui-ux-pro-max-skill `56ea9cf`):

1. **ui-ux-pro-max** — antes de implementar una sección nueva: consultar estilo/tipografía/presets GSAP para el stack `nextjs` y validar contra sus reglas UX y de accesibilidad.
2. **impeccable** — al terminar la fase: `audit` de las secciones nuevas (jerarquía, ritmo, tipografía, movimiento, a11y) y `polish` sobre lo que falle.
3. **design-taste-frontend** (taste) — al terminar la fase: crítica de "tells" genéricos sobre capturas en desktop y móvil.

**Regla de prioridad:** el spec aprobado manda. Si una skill propone cambiar algo que Erick eligió explícitamente (paleta B/N + azul, eyebrows mono `// sección`, glass, tipografías, animaciones del portfolio), se le presenta como propuesta con pros/contras y **no se aplica sin su aprobación**. Las mejoras que no contradicen el spec (espaciado, contraste, jerarquía, timing, estados) se aplican directamente.

## 14. Fuera de alcance (YAGNI)

CMS, blog, panel admin, testimonios, sección de equipo, analytics (se puede añadir luego), apps móviles.
