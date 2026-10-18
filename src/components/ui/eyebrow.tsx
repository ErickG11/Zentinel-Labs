import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn('font-mono text-xs tracking-widest text-muted uppercase', className)}>
      {children}
    </p>
  );
}
