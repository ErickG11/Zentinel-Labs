import Image from 'next/image';
import { TransitionLink } from '@/components/providers/page-transition-provider';
import type { Project } from '@/content/projects';

interface NextProjectProps {
  project: Project;
  href: string;
  label: string;
}

export function NextProject({ project, href, label }: NextProjectProps) {
  return (
    <TransitionLink
      href={href}
      label={project.name}
      cursorLabel={label}
      className="group relative block overflow-hidden rounded-3xl border border-border px-8 py-16 sm:px-12 sm:py-24"
    >
      <span className="relative z-10 flex flex-col gap-4">
        <span className="font-mono text-xs tracking-widest text-muted uppercase">{label}</span>
        <span className="font-display text-5xl font-semibold tracking-tight sm:text-7xl">
          {project.name}
        </span>
      </span>
      <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-25">
        <Image
          src={project.cover.src}
          alt=""
          fill
          sizes="(min-width: 1200px) 1152px, calc(100vw - 48px)"
          className="object-cover"
        />
      </span>
    </TransitionLink>
  );
}
