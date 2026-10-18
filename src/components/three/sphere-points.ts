const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// Distribución de Fibonacci: puntos casi equidistantes sobre la esfera
export const createSpherePoints = (count: number, radius: number): Float32Array => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    points[i * 3] = Math.cos(theta) * ring * radius;
    points[i * 3 + 1] = y * radius;
    points[i * 3 + 2] = Math.sin(theta) * ring * radius;
  }
  return points;
};

export const createDispersionSeeds = (
  count: number,
  random: () => number = Math.random,
): Float32Array => {
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = 0.2 + random() * 0.8;
  return seeds;
};
