import { describe, expect, it } from 'vitest';
import { shouldRender3D } from '@/components/hero/render-3d';

describe('shouldRender3D', () => {
  it('renders on capable devices', () => {
    expect(shouldRender3D({ reducedMotion: false, webgl: true, cores: 8 })).toBe(true);
    expect(shouldRender3D({ reducedMotion: false, webgl: true, cores: undefined })).toBe(true);
  });

  it('falls back on reduced motion, missing WebGL or low-end CPUs', () => {
    expect(shouldRender3D({ reducedMotion: true, webgl: true, cores: 8 })).toBe(false);
    expect(shouldRender3D({ reducedMotion: false, webgl: false, cores: 8 })).toBe(false);
    expect(shouldRender3D({ reducedMotion: false, webgl: true, cores: 4 })).toBe(false);
  });
});
