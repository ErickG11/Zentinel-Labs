import { cn } from '@/lib/utils';

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;
// A partir de aqui se avisa que queda poco espacio
const NEAR_LIMIT_RATIO = 0.9;

export type CounterState = 'empty' | 'below-min' | 'ok' | 'near-max' | 'at-max';

export const getCounterState = (
  length: number,
  min: number = MESSAGE_MIN,
  max: number = MESSAGE_MAX,
): CounterState => {
  if (length === 0) return 'empty';
  if (length < min) return 'below-min';
  if (length >= max) return 'at-max';
  if (length >= max * NEAR_LIMIT_RATIO) return 'near-max';
  return 'ok';
};

interface MessageCounterProps {
  id: string;
  count: number;
  min?: number;
  max?: number;
  labels: {
    counter: string;
    minHint: string;
    // Anuncio para lectores de pantalla: solo cambia al cruzar un umbral
    announcement: string;
  };
}

export function MessageCounter({
  id,
  count,
  min = MESSAGE_MIN,
  max = MESSAGE_MAX,
  labels,
}: MessageCounterProps) {
  const state = getCounterState(count, min, max);
  return (
    <div
      id={id}
      className="mt-2 flex items-center justify-between gap-4 font-mono text-xs text-muted"
    >
      <span>{state === 'empty' || state === 'below-min' ? labels.minHint : null}</span>
      <span
        aria-hidden
        className={cn('tabular-nums', (state === 'near-max' || state === 'at-max') && 'text-ink')}
      >
        {labels.counter}
      </span>
      <span aria-live="polite" className="sr-only">
        {labels.announcement}
      </span>
    </div>
  );
}
