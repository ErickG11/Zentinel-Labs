import { getTranslations } from 'next-intl/server';
import { NAV_SECTIONS, SECTION_IDS } from '@/content/navigation';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { FooterWordmark } from './footer-wordmark';
import { Logo } from './logo';
import { SectionLink } from './section-link';

export async function Footer() {
  const t = await getTranslations('Footer');
  const tNav = await getTranslations('Nav');
  const tWhatsApp = await getTranslations('WhatsApp');
  const whatsappUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    tWhatsApp('message'),
  );
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 pt-20">
      <div className="mx-auto grid max-w-6xl gap-12 pb-16 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo />
          <p className="text-muted">{t('tagline')}</p>
        </div>
        <nav aria-label={t('navigation')} className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">
            {t('navigation')}
          </p>
          {NAV_SECTIONS.map((id) => (
            <SectionLink key={id} id={id} className="w-fit transition-colors hover:text-muted">
              {tNav(id)}
            </SectionLink>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">{t('contact')}</p>
          <SectionLink
            id={SECTION_IDS.contact}
            className="w-fit transition-colors hover:text-muted"
          >
            {tNav('cta')}
          </SectionLink>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit transition-colors hover:text-muted"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
      <FooterWordmark />
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 border-t border-border py-6 font-mono text-xs text-muted sm:flex-row">
        <p>
          © {year} Zentinel Labs. {t('rights')}
        </p>
        <p>{t('madeIn')}</p>
      </div>
    </footer>
  );
}
