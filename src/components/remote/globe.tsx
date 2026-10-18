'use client';

import { geoGraticule, geoOrthographic, geoPath } from 'd3-geo';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { timer, type Timer } from 'd3-timer';
import { useEffect, useRef, useState } from 'react';
import { readCssVariable } from '@/lib/css';
import { REDUCED_MOTION_QUERY } from '@/lib/motion';
import { THEME_EVENT } from '@/lib/theme';
import { isFrontFacing, type LandFeature } from './globe-geometry';

const PIN_COORDS: [number, number] = [-79.17, -0.25];
const ACCENT = '#3d7bff';
// 0.25 grados por frame a 60 Hz, expresado por milisegundo
const ROTATION_SPEED = 0.25 / (1000 / 60);
const MAX_FRAME_DELTA = 100;
// Movimiento minimo antes de iniciar el arrastre para no robar el scroll vertical
const DRAG_THRESHOLD = 8;
const KEY_ROTATION_STEP = 10;
const ZOOM_IN_FACTOR = 1.1;
const ZOOM_OUT_FACTOR = 0.9;

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
  label: string;
  retryLabel: string;
}

const fetchJson = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
};

export function Globe({ hint, errorMessage, label, retryLabel }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const projection = geoOrthographic().clipAngle(90);
    const path = geoPath(projection, context);
    const graticule = geoGraticule()();
    const rotation: [number, number] = [79, 0];
    projection.rotate(rotation);

    let size = 0;
    let radius = 1;
    let zoom = 1;
    let currentDpr = 0;
    let colors = readColors();
    let land: LandFeature[] = [];
    // Arreglo plano [lng0, lat0, lng1, lat1, ...] precalculado
    let dots: number[] = [];
    let elapsedTime = 0;
    let lastElapsed = 0;
    let disposed = false;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let autoRotate = !reducedMotion;
    let rotationTimer: Timer | null = null;
    let dragCleanup: (() => void) | null = null;
    const abortController = new AbortController();

    const isInside = (point: [number, number] | null): point is [number, number] =>
      point !== null && point[0] >= 0 && point[0] <= size && point[1] >= 0 && point[1] <= size;

    const render = (): void => {
      if (size === 0) return;
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

      // Todos los puntos en un solo path
      const dotRadius = 1.1 * factor;
      context.fillStyle = colors.muted;
      context.beginPath();
      for (let i = 0; i < dots.length; i += 2) {
        const coords: [number, number] = [dots[i], dots[i + 1]];
        if (!isFrontFacing(coords, rotation)) continue;
        const projected = projection(coords);
        if (!isInside(projected)) continue;
        context.moveTo(projected[0] + dotRadius, projected[1]);
        context.arc(projected[0], projected[1], dotRadius, 0, Math.PI * 2);
      }
      context.fill();

      if (isFrontFacing(PIN_COORDS, rotation)) {
        const pin = projection(PIN_COORDS);
        if (isInside(pin)) {
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
      }
    };

    // Reinicializa canvas, DPR, radio y proyeccion conservando rotacion y zoom relativo
    const layout = (): void => {
      const nextSize = Math.round(container.getBoundingClientRect().width);
      const dpr = window.devicePixelRatio || 1;
      if (nextSize === 0 || (nextSize === size && dpr === currentDpr)) return;
      if (size > 0) zoom = projection.scale() / radius;
      size = nextSize;
      currentDpr = dpr;
      radius = size / 2.4;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.scale(radius * zoom).translate([size / 2, size / 2]);
      render();
    };

    const start = (): void => {
      if (rotationTimer) return;
      lastElapsed = 0;
      rotationTimer = timer((elapsed) => {
        const delta = Math.min(elapsed - lastElapsed, MAX_FRAME_DELTA);
        lastElapsed = elapsed;
        elapsedTime = elapsed;
        if (autoRotate) {
          rotation[0] += ROTATION_SPEED * delta;
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
    const resize = new ResizeObserver(layout);

    const applyZoom = (factor: number): void => {
      projection.scale(Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * factor)));
      render();
    };

    const handlePointerDown = (event: PointerEvent): void => {
      dragCleanup?.();
      const origin = { x: event.clientX, y: event.clientY };
      const startRotation: [number, number] = [rotation[0], rotation[1]];
      const { pointerId, pointerType } = event;
      let dragging = false;

      const beginDrag = (): void => {
        dragging = true;
        autoRotate = false;
        canvas.setPointerCapture(pointerId);
      };

      const handleMove = (move: PointerEvent): void => {
        const dx = move.clientX - origin.x;
        const dy = move.clientY - origin.y;
        if (!dragging) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          // En tactil un gesto mas vertical que horizontal es scroll de la pagina
          if (pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) {
            removeListeners();
            return;
          }
          beginDrag();
        }
        rotation[0] = startRotation[0] + dx * 0.5;
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * 0.5));
        projection.rotate(rotation);
        render();
      };
      const removeListeners = (): void => {
        canvas.removeEventListener('pointermove', handleMove);
        canvas.removeEventListener('pointerup', handleUp);
        canvas.removeEventListener('pointercancel', handleUp);
        dragCleanup = null;
      };
      const handleUp = (): void => {
        removeListeners();
        if (dragging && !reducedMotion) autoRotate = true;
      };

      canvas.addEventListener('pointermove', handleMove);
      canvas.addEventListener('pointerup', handleUp);
      canvas.addEventListener('pointercancel', handleUp);
      dragCleanup = removeListeners;
    };

    // Solo con Ctrl/Cmd (o pellizco del trackpad) se hace zoom; si no, la pagina sigue haciendo scroll
    const handleWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      applyZoom(event.deltaY > 0 ? ZOOM_OUT_FACTOR : ZOOM_IN_FACTOR);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      const rotations: Record<string, [number, number]> = {
        ArrowLeft: [-KEY_ROTATION_STEP, 0],
        ArrowRight: [KEY_ROTATION_STEP, 0],
        ArrowUp: [0, KEY_ROTATION_STEP],
        ArrowDown: [0, -KEY_ROTATION_STEP],
      };
      const delta = rotations[event.key];
      if (delta) {
        event.preventDefault();
        autoRotate = false;
        rotation[0] += delta[0];
        rotation[1] = Math.max(-90, Math.min(90, rotation[1] + delta[1]));
        projection.rotate(rotation);
        render();
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        applyZoom(ZOOM_IN_FACTOR);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        applyZoom(ZOOM_OUT_FACTOR);
      }
    };

    const handleBlur = (): void => {
      if (!reducedMotion) autoRotate = true;
    };

    const handleTheme = (): void => {
      colors = readColors();
      render();
    };

    const load = async (): Promise<void> => {
      try {
        const [collection, flatDots] = await Promise.all([
          fetchJson<FeatureCollection<Polygon | MultiPolygon>>(
            '/data/land-110m.json',
            abortController.signal,
          ),
          fetchJson<number[]>('/data/land-dots.json', abortController.signal),
        ]);
        if (disposed) return;
        land = collection.features;
        dots = flatDots;
        setStatus('ready');
        render();
        if (disposed) return;
        visibility.observe(canvas);
      } catch {
        if (disposed) return;
        setStatus('error');
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('blur', handleBlur);
    window.addEventListener(THEME_EVENT, handleTheme);
    window.addEventListener('resize', layout);
    resize.observe(container);
    layout();
    void load();

    return () => {
      disposed = true;
      abortController.abort();
      stop();
      dragCleanup?.();
      visibility.disconnect();
      resize.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('blur', handleBlur);
      window.removeEventListener(THEME_EVENT, handleTheme);
      window.removeEventListener('resize', layout);
    };
  }, [attempt]);

  const retry = (): void => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  };

  if (status === 'error') {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-surface p-8">
        <div className="flex flex-col items-center gap-4">
          <p role="alert" className="text-center text-sm text-muted">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-ink glass"
          >
            {retryLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-square">
      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-surface motion-reduce:animate-none" />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        tabIndex={0}
        className="block h-full w-full cursor-grab touch-pan-y rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:cursor-grabbing"
      />
      <p className="absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs text-muted glass">
        {hint}
      </p>
    </div>
  );
}
