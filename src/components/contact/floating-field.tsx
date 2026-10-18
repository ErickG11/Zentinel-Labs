import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';
import { FieldError } from './field-error';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
}

const CONTROL =
  'peer w-full rounded-2xl border bg-transparent px-5 pt-7 pb-3 text-base outline-none transition-colors duration-300 placeholder:text-transparent focus:border-ink';
const LABEL =
  'pointer-events-none absolute top-2.5 left-5 text-xs text-muted transition-all duration-300 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs';

type InputProps = FieldShellProps & InputHTMLAttributes<HTMLInputElement>;

export const FloatingInput = forwardRef<HTMLInputElement, InputProps>(function FloatingInput(
  { id, label, error, className, ...props },
  ref,
) {
  return (
    <div className={cn('relative', className)}>
      <input
        ref={ref}
        id={id}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CONTROL, error ? 'border-ink' : 'border-border')}
        {...props}
      />
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
});

interface TextareaExtras {
  // Id de contenido auxiliar (p. ej. el contador) que tambien describe al campo
  describedBy?: string;
  // Contenido bajo el campo, tras el error
  footer?: ReactNode;
}

type TextareaProps = FieldShellProps & TextareaExtras & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FloatingTextarea({ id, label, error, describedBy, footer, className, ...props }, ref) {
    const described = [error ? `${id}-error` : null, describedBy].filter(Boolean).join(' ');
    return (
      <div className={cn('relative', className)}>
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          rows={5}
          aria-invalid={Boolean(error)}
          aria-describedby={described || undefined}
          className={cn(CONTROL, 'resize-none', error ? 'border-ink' : 'border-border')}
          {...props}
        />
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
        <FieldError id={`${id}-error`}>{error}</FieldError>
        {footer}
      </div>
    );
  },
);
