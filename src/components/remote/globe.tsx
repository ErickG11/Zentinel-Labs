'use client';

import { geoGraticule, geoOrthographic, geoPath } from 'd3-geo';
import type { FeatureCollection, MultiPolygon, Polygon, Position } from 'geojson';
import { timer, type Timer } from 'd3-timer';
import { useEffect, useRef, useState } from 'react';
import { readCssVariable } from '@/lib/css';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';
import { THEME_EVENT } from '@/lib/theme';
import { generateDotsInFeature, type LandFeature } from './globe-geometry';

const PIN_COORDS: [number, number] = [-79.17, -0.25];
const ACCENT = '#3d7bff';
const DOT_STEP = 1.28;
const ROTATION_SPEED = 0.25;

interface GlobeColors {
  page: string;
  ink: string;
  muted: string;
}

const readColors = (): GlobeColors => ({
  page: readCssVariable('--zl-page'),
  ink: readCssVariable('--zl-ink'),
  muted: readCssVariable('--zl-muted'),
});

interface GlobeProps {
  hint: string;
  errorMessage: string;
}

export function Globe({ hint, errorMessage }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const size = Math.round(container.getBoundingClientRect().width);
    if (size === 0) return;
    const radius = size / 2.4;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    context.scale(dpr, dpr);

    const projection = geoOrthographic()
      .scale(radius)
      .translate([size / 2, size / 2])
      .clipAngle(90);
    const path = geoPath(projection, context);
    const graticule = geoGraticule()();
    const rotation: [number, number] = [79, 0];
    projection.rotate(rotation);

    let colors = readColors();
    let land: LandFeature[] = [];
    let dots: Position[] = [];
    let elapsedTime = 0;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let autoRotate = !reducedMotion;
    let rotationTimer: Timer | null = null;

    const isVisible = (point: [number, number] | null): point is [number, number] =>
      point !== null && point[0] >= 0 && point[0] <= size && point[1] >= 0 && point[1] <= size;

    const render = (): void => {
      const scale = projection.scale();
      const factor = scale / radius;
      context.clearRect(0, 0, size, size);

      context.beginPath();
      context.arc(size / 2, size / 2, scale, 0, Math.PI * 2);
      context.fillStyle = colors.page;
      context.fill();
      context.globalAlpha = 0.35;
      context.strokeStyle = colors.ink;
      context.lineWidth = 1.5 * factor;
      context.stroke();

      context.beginPath();
      path(graticule);
      context.globalAlpha = 0.12;
      context.lineWidth = factor;
      context.stroke();

      context.beginPath();
      land.forEach((feature) => path(feature));
      context.globalAlpha = 0.45;
      context.stroke();
      context.globalAlpha = 1;

      context.fillStyle = colors.muted;
      for (const dot of dots) {
        const projected = projection(dot as [number, number]);
        if (!isVisible(projected)) continue;
        context.beginPath();
        context.arc(projected[0], projected[1], 1.1 * factor, 0, Math.PI * 2);
        context.fill();
      }

      const pin = projection(PIN_COORDS);
      if (isVisible(pin)) {
        const pulse = (3 + Math.sin(elapsedTime / 300) * 1.5) * factor;
        context.beginPath();
        context.arc(pin[0], pin[1], pulse * 2.2, 0, Math.PI * 2);
        context.globalAlpha = 0.4;
        context.strokeStyle = ACCENT;
        context.lineWidth = 1.5 * factor;
        context.stroke();
        context.globalAlpha = 1;
        context.beginPath();
        context.arc(pin[0], pin[1], 2.6 * factor, 0, Math.PI * 2);
        context.fillStyle = ACCENT;
        context.fill();
      }
    };

    const start = (): void => {
      if (rotationTimer) return;
      rotationTimer = timer((elapsed) => {
        elapsedTime = elapsed;
        if (autoRotate) {
          rotation[0] += ROTATION_SPEED;
          projection.rotate(rotation);
        }
        render();
      });
    };
    const stop = (): void => {
      rotationTimer?.stop();
      rotationTimer = null;
    };

    const visibility = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? start() : stop(),
    );

    const handlePointerDown = (event: PointerEvent): void => {
      autoRotate = false;
      canvas.setPointerCapture(event.pointerId);
      const origin = { x: event.clientX, y: event.clientY };
      const startRotation: [number, number] = [rotation[0], rotation[1]];

      const handleMove = (move: PointerEvent): void => {
        rotation[0] = startRotation[0] + (move.clientX - origin.x) * 0.5;
        rotation[1] = Math.max(
          -90,
          Math.min(90, startRotation[1] - (move.clientY - origin.y) * 0.5),
        );
        projection.rotate(rotation);
        render();
      };
      const handleUp = (): void => {
        canvas.removeEventListener('pointermove', handleMove);
        canvas.removeEventListener('pointerup', handleUp);
        canvas.removeEventListener('pointercancel', handleUp);
        if (!reducedMotion) autoRotate = true;
      };

      canvas.addEventListener('pointermove', handleMove);
      canvas.addEventListener('pointerup', handleUp);
      canvas.addEventListener('pointercancel', handleUp);
    };

    const handleWheel = (event: WheelEvent): void => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.9 : 1.1;
      projection.scale(Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * factor)));
      render();
    };

    const handleTheme = (): void => {
      colors = readColors();
      render();
    };

    const load = async (): Promise<void> => {
      try {
        const response = await fetch('/data/land-110m.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as FeatureCollection<Polygon | MultiPolygon>;
        land = data.features;
        dots = land.flatMap((feature) => generateDotsInFeature(feature, DOT_STEP));
        setStatus('ready');
        render();
        visibility.observe(canvas);
      } catch {
        setStatus('error');
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener(THEME_EVENT, handleTheme);
    render();
    void load();

    return () => {
      stop();
      visibility.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener(THEME_EVENT, handleTheme);
    };
  }, []);

  if (status === 'error') {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-surface p-8">
        <p className="text-center text-sm text-muted">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-square">
      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-surface" />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        data-lenis-prevent=""
        aria-hidden
        className="block h-full w-full cursor-grab touch-none active:cursor-grabbing"
      />
      <p className="absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs text-muted glass">
        {hint}
      </p>
    </div>
  );
}
