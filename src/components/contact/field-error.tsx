import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  id: string;
  children: string | undefined;
  className?: string;
}

// Error de campo accesible: se anuncia al aparecer y mantiene el estilo monocromo
export function FieldError({ id, children, className }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn('mt-2 flex items-start gap-2 text-sm text-ink', className)}
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
