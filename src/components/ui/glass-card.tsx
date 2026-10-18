import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function GlassCard({ children, className, as: Component = 'div' }: GlassCardProps) {
  return <Component className={cn('rounded-2xl glass', className)}>{children}</Component>;
}
