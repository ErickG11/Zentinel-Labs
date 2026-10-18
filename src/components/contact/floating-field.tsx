import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
}

const CONTROL =
  'peer w-full rounded-2xl border bg-transparent px-5 pt-7 pb-3 text-base outline-none transition-colors duration-300 placeholder:text-transparent focus:border-ink';
const LABEL =
  'pointer-events-none absolute top-2.5 left-5 text-xs text-muted transition-all duration-300 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-xs';

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-2 text-sm text-ink">
      {error}
    </p>
  );
}

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
      <ErrorText id={id} error={error} />
    </div>
  );
});

type TextareaProps = FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FloatingTextarea({ id, label, error, className, ...props }, ref) {
    return (
      <div className={cn('relative', className)}>
        <textarea
          ref={ref}
          id={id}
          placeholder=" "
          rows={5}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(CONTROL, 'resize-none', error ? 'border-ink' : 'border-border')}
          {...props}
        />
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
        <ErrorText id={id} error={error} />
      </div>
    );
  },
);
