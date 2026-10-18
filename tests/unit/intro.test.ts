// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  INTRO_DONE_EVENT,
  INTRO_SESSION_KEY,
  introInitScript,
  isIntroDone,
  markIntroDone,
  shouldPlayIntro,
} from '@/lib/intro';

afterEach(() => {
  delete document.documentElement.dataset.intro;
  delete document.documentElement.dataset.motion;
  sessionStorage.clear();
});

describe('shouldPlayIntro', () => {
  it('plays only on the first visit of the session without reduced motion', () => {
    expect(shouldPlayIntro({ seen: false, reducedMotion: false })).toBe(true);
    expect(shouldPlayIntro({ seen: true, reducedMotion: false })).toBe(false);
    expect(shouldPlayIntro({ seen: false, reducedMotion: true })).toBe(false);
  });
});

describe('markIntroDone', () => {
  it('flags the document, remembers the session and notifies listeners', () => {
    const listener = vi.fn();
    window.addEventListener(INTRO_DONE_EVENT, listener);
    expect(isIntroDone()).toBe(false);

    markIntroDone();

    expect(isIntroDone()).toBe(true);
    expect(document.documentElement.dataset.intro).toBe('done');
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('1');
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(INTRO_DONE_EVENT, listener);
  });
});

describe('introInitScript', () => {
  const run = (): void => {
    new Function(introInitScript)();
  };

  it('marks a first visit as "play" and motion as allowed', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    run();
    expect(document.documentElement.dataset.intro).toBe('play');
    expect(document.documentElement.dataset.motion).toBe('ok');
  });

  it('skips the intro when already seen this session', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    run();
    expect(document.documentElement.dataset.intro).toBe('skip');
  });

  it('skips the intro and flags reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    run();
    expect(document.documentElement.dataset.intro).toBe('skip');
    expect(document.documentElement.dataset.motion).toBe('reduce');
  });
});
