import { cn } from '@/lib/utils';
import { Eyebrow } from './eyebrow';
import { Reveal } from './reveal';
import { SplitReveal } from './split-reveal';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  id,
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'flex max-w-3xl flex-col gap-5',
        centered && 'mx-auto items-center text-center',
      )}
    >
      <Reveal y={12}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <SplitReveal
        id={id}
        as="h2"
        className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
      >
        {title}
      </SplitReveal>
      {description ? (
        <Reveal delay={0.15}>
          <p className="text-lg text-pretty text-muted">{description}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
