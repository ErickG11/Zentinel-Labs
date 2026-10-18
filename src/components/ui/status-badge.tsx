import type { ProjectStatus } from '@/content/projects';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProjectStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const live = status === 'live';
  return (
    <span
      data-status={status}
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs tracking-widest whitespace-nowrap uppercase',
        live ? 'text-ink' : 'text-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-accent' : 'bg-muted')}
      />
      {label}
    </span>
  );
}
