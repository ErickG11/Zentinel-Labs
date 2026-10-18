'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { BufferAttribute, Points, PointsMaterial } from 'three';
import { readCssVariable } from '@/lib/css';
import { THEME_EVENT } from '@/lib/theme';
import { createDispersionSeeds, createSpherePoints } from './sphere-points';

const POINT_COUNT = 3200;
const RADIUS = 1.55;
const MAX_DELTA = 0.1;
// Equivale a un lerp de 0.04 por frame a 60 Hz: -ln(0.96) * 60
const FOLLOW_RATE = 2.45;

interface PointerTarget {
  x: number;
  y: number;
}

function ParticleSphere() {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<PointsMaterial>(null);
  const base = useMemo(() => createSpherePoints(POINT_COUNT, RADIUS), []);
  const seeds = useMemo(() => createDispersionSeeds(POINT_COUNT), []);
  const positions = useMemo(() => base.slice(), [base]);
  const scrollProgress = useRef(0);
  const pointer = useRef<PointerTarget>({ x: 0, y: 0 });
  const elapsed = useRef(0);

  useEffect(() => {
    const handleScroll = (): void => {
      scrollProgress.current = Math.min(1, window.scrollY / window.innerHeight);
    };
    const handlePointer = (event: PointerEvent): void => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      };
    };
    const applyColor = (): void => {
      materialRef.current?.color.set(readCssVariable('--zl-ink'));
    };

    handleScroll();
    applyColor();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener(THEME_EVENT, applyColor);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener(THEME_EVENT, applyColor);
    };
  }, []);

  useFrame((_state, rawDelta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const delta = Math.min(rawDelta, MAX_DELTA);
    elapsed.current += delta;
    const time = elapsed.current;
    const follow = 1 - Math.exp(-FOLLOW_RATE * delta);
    const dispersion = scrollProgress.current;
    const attribute = points.geometry.getAttribute('position') as BufferAttribute;
    const array = attribute.array as Float32Array;

    for (let i = 0; i < POINT_COUNT; i++) {
      const index = i * 3;
      const bx = base[index];
      const by = base[index + 1];
      const bz = base[index + 2];
      const wave = 1 + Math.sin(time * 0.9 + by * 3 + bx * 2) * 0.035;
      const spread = 1 + dispersion * seeds[i] * 1.6;
      array[index] = bx * wave * spread;
      array[index + 1] = by * wave * spread;
      array[index + 2] = bz * wave * spread;
    }
    attribute.needsUpdate = true;

    // Rotación continua + inercia hacia el puntero
    points.rotation.y += delta * 0.07;
    points.rotation.x += (pointer.current.y * 0.35 - points.rotation.x) * follow;
    points.rotation.z += (-pointer.current.x * 0.2 - points.rotation.z) * follow;
    material.opacity = 0.85 - dispersion * 0.6;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.016}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

interface SentinelSceneProps {
  active: boolean;
}

export default function SentinelScene({ active }: SentinelSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ alpha: true }}
      frameloop={active ? 'always' : 'never'}
    >
      <ParticleSphere />
    </Canvas>
  );
}
