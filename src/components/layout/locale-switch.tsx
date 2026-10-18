'use client';

import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

type ReplaceTarget = Parameters<ReturnType<typeof useRouter>['replace']>[0];

export function LocaleSwitch() {
  const t = useTranslations('Nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale): void => {
    if (next === locale) return;
    // Las rutas dinámicas necesitan sus params para localizar el pathname
    const target = (
      params.slug ? { pathname, params: { slug: params.slug } } : { pathname }
    ) as ReplaceTarget;
    startTransition(() => router.replace(target, { locale: next }));
  };

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn(
        'flex h-9 items-center rounded-full p-1 font-mono text-xs glass pointer-coarse:h-12',
        isPending && 'opacity-60',
      )}
    >
      {routing.locales.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => switchTo(option)}
          aria-pressed={option === locale}
          className={cn(
            'h-7 rounded-full px-2.5 uppercase transition-colors duration-300 pointer-coarse:h-11 pointer-coarse:px-4',
            option === locale ? 'bg-ink text-page' : 'text-muted hover:text-ink',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
