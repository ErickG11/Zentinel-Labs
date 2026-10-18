export function SentinelFallback() {
  return (
    <div
      data-sentinel-fallback=""
      aria-hidden
      className="absolute inset-[12%] rounded-full [background-image:radial-gradient(var(--color-ink)_1px,transparent_1.2px)] [mask-image:radial-gradient(circle_at_35%_35%,black_10%,transparent_70%)] [background-size:14px_14px] opacity-40"
    />
  );
}
