'use client';

import { MessageCircle } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useState } from 'react';
import { EASE_OUT_EXPO } from '@/lib/motion';

interface WhatsAppFabProps {
  href: string;
  label: string;
}

export function WhatsAppFab({ href, label }: WhatsAppFabProps) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => {
    setVisible(value > window.innerHeight * 0.8);
  });

  return (
    <AnimatePresence>
      {visible ? (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          data-cursor="link"
          className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 grid h-14 w-14 place-items-center rounded-full bg-ink text-page shadow-xl shadow-black/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-ink/30 motion-reduce:hidden"
          />
          <MessageCircle className="relative h-6 w-6" aria-hidden />
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
