'use client';

import { useSyncExternalStore } from 'react';
import { INTRO_DONE_EVENT, isIntroDone } from '@/lib/intro';

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(INTRO_DONE_EVENT, onChange);
  return () => window.removeEventListener(INTRO_DONE_EVENT, onChange);
};

export const useIntroReady = (): boolean =>
  useSyncExternalStore(subscribe, isIntroDone, () => false);
