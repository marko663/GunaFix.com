import { cn } from "@/lib/utils";

/**
 * The Solaris hexagon mark: an angular "S" ribbon inscribed in a hexagon,
 * white for the upper sweep and solar yellow for the lower chevron.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Solaris Industrial"
      className={cn("h-9 w-9", className)}
    >
      <g fill="none" strokeWidth="25" strokeLinejoin="miter" strokeMiterlimit="6">
        <path d="M176 56 L100 12 L24 56 L24 101 L176 145" stroke="currentColor" />
        <path d="M24 145 L100 189 L176 145" className="text-solar" stroke="currentColor" />
      </g>
    </svg>
  );
}

/**
 * Full lockup: mark plus the SOLARIS / INDUSTRIAL wordmark.
 * `compact` drops the tagline rule for tight spaces such as the navbar.
 */
export function Logo({
  className,
  compact = false,
  withTagline = false,
}: {
  className?: string;
  compact?: boolean;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark className={compact ? "h-8 w-8 text-white" : "h-11 w-11 text-white"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-semibold tracking-[0.34em] text-white",
            compact ? "text-[0.95rem]" : "text-xl"
          )}
        >
          SOLARIS
        </span>
        <span
          className={cn(
            "mt-1 flex items-center gap-2 font-medium tracking-[0.42em] text-solar",
            compact ? "text-[0.5rem]" : "text-[0.6rem]"
          )}
        >
          <span aria-hidden className="h-px w-2 bg-solar/70" />
          INDUSTRIAL
          <span aria-hidden className="h-px w-2 bg-solar/70" />
        </span>
        {withTagline && (
          <span className="mt-2 text-[0.55rem] tracking-[0.3em] text-white/60">
            SMART RENEWABLE ENERGY SOLUTIONS
          </span>
        )}
      </span>
    </span>
  );
}
