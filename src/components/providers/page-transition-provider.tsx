'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
// Router nativo: recibe rutas ya localizadas (con prefijo /es o /en)
import { usePathname, useRouter } from 'next/navigation';
import { EASE_OUT_EXPO } from '@/lib/motion';

type Phase = 'idle' | 'covering' | 'covered';

interface PageTransitionApi {
  navigate: (href: string, label: string) => void;
}

const PageTransitionContext = createContext<PageTransitionApi | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('');
  const targetRef = useRef<string | null>(null);
  // Ruta desde la que se inició la transición; cuando cambia, la cortina se descubre
  const [originPath, setOriginPath] = useState<string | null>(null);

  const navigate = useCallback(
    (href: string, nextLabel: string) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href);
        return;
      }
      targetRef.current = href;
      setLabel(nextLabel);
      setPhase('covering');
    },
    [router],
  );

  const handleCoverComplete = (): void => {
    if (phase !== 'covering' || !targetRef.current) return;
    setOriginPath(pathname);
    setPhase('covered');
    router.push(targetRef.current);
    targetRef.current = null;
  };

  const api = useMemo(() => ({ navigate }), [navigate]);
  const showCurtain = phase === 'covering' || (phase === 'covered' && pathname === originPath);

  return (
    <PageTransitionContext.Provider value={api}>
      {children}
      <AnimatePresence onExitComplete={() => setPhase('idle')}>
        {showCurtain ? (
          <motion.div
            key="curtain"
            aria-hidden
            className="fixed inset-0 z-[95] grid place-items-center bg-ink text-page"
            initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
            onAnimationComplete={handleCoverComplete}
          >
            <motion.span
              className="font-display text-4xl font-semibold tracking-tight sm:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.2 }}
            >
              {label}
            </motion.span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}

export const usePageTransition = (): PageTransitionApi => {
  const context = useContext(PageTransitionContext);
  if (!context) throw new Error('usePageTransition must be used inside PageTransitionProvider');
  return context;
};

interface TransitionLinkProps {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
  cursorLabel?: string;
}

export function TransitionLink({
  href,
  label,
  children,
  className,
  cursorLabel,
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(href, label);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      data-cursor="link"
      data-cursor-label={cursorLabel}
    >
      {children}
    </a>
  );
}
