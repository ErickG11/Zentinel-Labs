'use client';

import { ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import Image from 'next/image';
import { useState, type PointerEvent } from 'react';
import { TransitionLink } from '@/components/providers/page-transition-provider';
import type { Project } from '@/content/projects';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EASE_OUT_EXPO, FINE_POINTER_QUERY, REDUCED_MOTION_QUERY } from '@/lib/motion';

export interface ProjectListItem {
  project: Project;
  href: string;
}

interface ProjectListProps {
  items: ProjectListItem[];
  viewLabel: string;
}

export function ProjectList({ items, viewLabel }: ProjectListProps) {
  const finePointer = useMediaQuery(FINE_POINTER_QUERY);
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [active, setActive] = useState<string | null>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 22, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 22, mass: 0.6 });

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>): void => {
    x.set(event.clientX);
    y.set(event.clientY);
  };

  const activeProject = items.find((item) => item.project.slug === active)?.project;

  return (
    <>
      <ul
        className="group/list mt-16 border-t border-border"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setActive(null)}
      >
        {items.map(({ project, href }, index) => (
          <motion.li
            key={project.slug}
            className="border-b border-border"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
            animate={reduceMotion ? { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 } : undefined}
            whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: reduceMotion ? 0 : 1,
              ease: EASE_OUT_EXPO,
              delay: reduceMotion ? 0 : index * 0.08,
            }}
            onPointerEnter={() => setActive(project.slug)}
          >
            <TransitionLink
              href={href}
              label={project.name}
              cursorLabel={viewLabel}
              className="group grid gap-6 py-10 transition-opacity duration-500 group-hover/list:opacity-40 hover:!opacity-100 md:grid-cols-[4rem_1fr_auto] md:items-center"
            >
              <span className="font-mono text-sm text-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col gap-3">
                <span className="font-display text-4xl font-semibold tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:text-6xl">
                  {project.name}
                </span>
                <span className="text-muted">{project.summary}</span>
                <span className="relative mt-2 block aspect-[16/10] overflow-hidden rounded-2xl md:hidden">
                  <Image
                    src={project.cover.src}
                    alt={project.cover.alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </span>
              </span>
              <span className="flex items-center gap-4 font-mono text-xs tracking-widest text-muted uppercase">
                {project.category} · {project.year}
                <span className="grid h-11 w-11 place-items-center rounded-full text-ink glass">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </span>
            </TransitionLink>
          </motion.li>
        ))}
      </ul>

      {finePointer ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-30 hidden md:block"
          style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        >
          <AnimatePresence mode="popLayout">
            {activeProject ? (
              <motion.div
                key={activeProject.slug}
                className="relative aspect-[16/10] w-[24rem] overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
                initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85, rotate: 4 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              >
                <Image
                  src={activeProject.cover.src}
                  alt=""
                  fill
                  sizes="24rem"
                  className="object-cover"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </>
  );
}
