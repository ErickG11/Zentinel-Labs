export const formatCount = (value: number): string => String(Math.round(value));

export const ringDashOffset = (level: number, circumference: number): number => {
  const clamped = Math.min(100, Math.max(0, level));
  return circumference - (clamped / 100) * circumference;
};
