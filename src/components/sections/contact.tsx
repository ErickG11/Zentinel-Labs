import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/contact/contact-form';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { SECTION_IDS } from '@/content/navigation';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export async function Contact() {
  const t = await getTranslations('Contact');
  const tWhatsApp = await getTranslations('WhatsApp');
  const whatsappUrl = buildWhatsAppUrl(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    tWhatsApp('message'),
  );

  return (
    <section
      id={SECTION_IDS.contact}
      aria-labelledby="contact-title"
      className="section-anchor px-6 py-28"
    >
      <Reveal className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl p-8 glass sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 animate-blob rounded-full bg-(--zl-blob) blur-3xl"
          />
          <div className="relative flex flex-col gap-12">
            <SectionHeading
              id="contact-title"
              eyebrow={t('eyebrow')}
              title={t('title')}
              description={t('description')}
            />
            <ContactForm
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              whatsappUrl={whatsappUrl}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
