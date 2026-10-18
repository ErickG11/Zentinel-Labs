'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { BufferAttribute, Points, PointsMaterial } from 'three';
import { readCssVariable } from '@/lib/css';
import { THEME_EVENT } from '@/lib/theme';
import { createDispersionSeeds, createSpherePoints } from './sphere-points';

const POINT_COUNT = 3200;
const RADIUS = 1.55;

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

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;

    const time = state.clock.elapsedTime;
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
    points.rotation.x += (pointer.current.y * 0.35 - points.rotation.x) * 0.04;
    points.rotation.z += (-pointer.current.x * 0.2 - points.rotation.z) * 0.04;
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
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
    >
      <ParticleSphere />
    </Canvas>
  );
}
