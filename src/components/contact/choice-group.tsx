import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface ChoiceGroupProps {
  name: string;
  legend: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  registration: UseFormRegisterReturn;
  error?: string;
}

export function ChoiceGroup({ name, legend, options, registration, error }: ChoiceGroupProps) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-3 font-mono text-xs tracking-widest text-muted uppercase">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input type="radio" value={option.value} className="peer sr-only" {...registration} />
            <span
              className={cn(
                'inline-flex h-10 items-center rounded-full border border-border px-4 text-sm text-muted transition-colors duration-300',
                'peer-checked:border-ink peer-checked:bg-ink peer-checked:text-page peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-ink',
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-sm text-ink">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
