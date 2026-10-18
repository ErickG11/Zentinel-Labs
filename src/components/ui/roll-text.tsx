const ROLL_TRANSITION =
  'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';

export function RollText({ children }: { children: string }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span
        className={`${ROLL_TRANSITION} group-hover:-translate-y-full group-focus-visible:-translate-y-full`}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={`${ROLL_TRANSITION} absolute inset-0 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0`}
      >
        {children}
      </span>
    </span>
  );
}
