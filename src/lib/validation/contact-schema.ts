import { z } from 'zod';

export const PROJECT_TYPES = ['landing', 'webapp', 'ecommerce', 'other'] as const;

// Caracteres de control y separadores de línea Unicode (evitan inyección en cabeceras/texto)
const CONTROL_CHARS = /[\u0000-\u001f\u007f\u0085\u2028\u2029]/;
const hasNoControlChars = (value: string): boolean => !CONTROL_CHARS.test(value);

// Los mensajes son claves de traducción (namespace Contact.errors)
export const contactSchema = z.object({
  name: z
    .string({ error: 'name.min' })
    .trim()
    .min(2, 'name.min')
    .max(80, 'name.max')
    .refine(hasNoControlChars, 'name.min'),
  email: z
    .string({ error: 'email.invalid' })
    .trim()
    .max(120, 'email.invalid')
    .refine(hasNoControlChars, 'email.invalid')
    .pipe(z.email('email.invalid')),
  company: z
    .string({ error: 'company.invalid' })
    .trim()
    .max(100, 'company.max')
    .refine(hasNoControlChars, 'company.invalid')
    .optional(),
  projectType: z.enum(PROJECT_TYPES, { error: 'projectType.required' }),
  message: z
    .string({ error: 'message.min' })
    .trim()
    .min(20, 'message.min')
    .max(2000, 'message.max'),
  turnstileToken: z.string({ error: 'captcha.required' }).min(1, 'captcha.required'),
  website: z.string({ error: 'website.invalid' }).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const isHoneypotFilled = (input: unknown): boolean =>
  typeof input === 'object' &&
  input !== null &&
  'website' in input &&
  typeof input.website === 'string' &&
  input.website.trim() !== '';
