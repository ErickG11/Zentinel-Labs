import 'server-only';
import { z } from 'zod';

// Variables vacías en .env se tratan como ausentes
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.url().default('http://localhost:3000'),
  ),
  RESEND_API_KEY: optional(z.string().startsWith('re_')),
  CONTACT_TO_EMAIL: optional(z.email()),
  CONTACT_FROM_EMAIL: optional(z.string().min(3)),
  TURNSTILE_SECRET_KEY: optional(z.string().min(10)),
  UPSTASH_REDIS_REST_URL: optional(z.url()),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string().min(10)),
});

const serverEnvSchemaChecked = serverEnvSchema.superRefine((env, ctx) => {
  // Claves de prueba de Cloudflare (siempre pasan): prohibidas en producci�n
  if (env.NODE_ENV === 'production' && /^[123]x0000/.test(env.TURNSTILE_SECRET_KEY ?? '')) {
    ctx.addIssue({
      code: 'custom',
      path: ['TURNSTILE_SECRET_KEY'],
      message: 'Turnstile test secret keys (1x0000/2x0000/3x0000) are not allowed in production',
    });
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const parseServerEnv = (source: Record<string, string | undefined>): ServerEnv => {
  const result = serverEnvSchemaChecked.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};

let cachedEnv: ServerEnv | null = null;

export const getServerEnv = (): ServerEnv => {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
};

export interface ContactConfig {
  resendApiKey: string;
  toEmail: string;
  fromEmail: string;
  turnstileSecret: string;
}

export const getContactConfig = (env: ServerEnv): ContactConfig | null => {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, TURNSTILE_SECRET_KEY } = env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL || !TURNSTILE_SECRET_KEY)
    return null;
  return {
    resendApiKey: RESEND_API_KEY,
    toEmail: CONTACT_TO_EMAIL,
    fromEmail: CONTACT_FROM_EMAIL,
    turnstileSecret: TURNSTILE_SECRET_KEY,
  };
};
