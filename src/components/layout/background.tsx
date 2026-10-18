export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] animate-blob rounded-full bg-(--zl-blob) blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] animate-blob rounded-full bg-(--zl-blob) blur-3xl [animation-delay:-4s]" />
      <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] animate-blob rounded-full bg-(--zl-blob) blur-3xl [animation-delay:-8s]" />
      <div className="absolute inset-0 bg-noise" />
    </div>
  );
}
