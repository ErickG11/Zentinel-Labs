import { z } from 'zod';

export const PROJECT_TYPES = ['landing', 'webapp', 'ecommerce', 'other'] as const;
// TODO(Erick): confirmar rangos de presupuesto (USD)
export const BUDGET_RANGES = ['lt-1000', '1000-3000', '3000-7000', 'gt-7000', 'undecided'] as const;

// Los mensajes son claves de traducción (namespace Contact.errors)
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name.min').max(80, 'name.max'),
  email: z.string().trim().max(120, 'email.invalid').pipe(z.email('email.invalid')),
  company: z.string().trim().max(100, 'company.max').optional(),
  projectType: z.enum(PROJECT_TYPES, 'projectType.required'),
  budget: z.enum(BUDGET_RANGES, 'budget.required'),
  message: z.string().trim().min(20, 'message.min').max(2000, 'message.max'),
  turnstileToken: z.string().min(1, 'captcha.required'),
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const isHoneypotFilled = (input: unknown): boolean =>
  typeof input === 'object' &&
  input !== null &&
  'website' in input &&
  typeof input.website === 'string' &&
  input.website.trim() !== '';
