import { Check } from 'lucide-react';

interface ContactSuccessProps {
  title: string;
  next: string;
  reply: string;
  resetLabel: string;
  onReset: () => void;
}

// Panel que reemplaza el area del boton tras un envio correcto
export function ContactSuccess({ title, next, reply, resetLabel, onReset }: ContactSuccessProps) {
  return (
    <div
      id="contact-success"
      role="status"
      tabIndex={-1}
      className="flex flex-col gap-4 rounded-2xl border border-ink p-6 outline-none"
    >
      <p className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
        <Check className="h-5 w-5" aria-hidden />
        {title}
      </p>
      <p className="text-pretty text-muted">{next}</p>
      <p className="font-medium">{reply}</p>
      <button
        type="button"
        onClick={onReset}
        data-cursor="link"
        className="self-start rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors duration-300 hover:border-ink"
      >
        {resetLabel}
      </button>
    </div>
  );
}
