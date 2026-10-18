'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// No se muestra el mensaje del error: puede contener detalles internos
export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('Error');
  return (
    <main id="main" className="flex min-h-dvh items-center px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6">
        <h1 className="font-display text-5xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted">{t('text')}</p>
        <Button onClick={reset} size="lg">
          {t('retry')}
        </Button>
      </div>
    </main>
  );
}
