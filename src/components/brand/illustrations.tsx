import { cn } from "@/lib/utils";

type SvgProps = { className?: string };

const stroke = {
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/* -------------------------------------------------------------------------- */
/* Vehicles                                                                   */
/* -------------------------------------------------------------------------- */

function Car({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="currentColor" {...stroke}>
      <path d="M2 30 v-6 c0-3 2-5 6-6 l10-11 c3-3 6-4 10-4 h22 c4 0 7 1 10 4 l10 11 c4 1 6 3 6 6 v6" />
      <path d="M2 30 h10" />
      <path d="M30 30 h18" />
      <path d="M66 30 h6" />
      <path d="M18 7 h34" />
      <circle cx="21" cy="30" r="7" />
      <circle cx="57" cy="30" r="7" />
    </g>
  );
}

function Truck({ x = 0, y = 0 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="currentColor" {...stroke}>
      <path d="M2 4 h84 v40 h-84 z" />
      <path d="M86 18 h18 l14 14 v12 h-32 z" />
      <path d="M90 22 h11 l9 9 h-20 z" />
      <path d="M2 44 h10" />
      <path d="M40 44 h28" />
      <path d="M96 44 h6" />
      <path d="M114 44 h4" />
      <circle cx="21" cy="44" r="7" />
      <circle cx="33" cy="44" r="7" />
      <circle cx="83" cy="44" r="7" />
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel helpers                                                              */
/* -------------------------------------------------------------------------- */

/** A slanted PV panel drawn as a parallelogram with a module grid. */
function Panel({
  x1,
  y1,
  x2,
  y2,
  depth = 9,
  cells = 6,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth?: number;
  cells?: number;
}) {
  const dividers = Array.from({ length: cells - 1 }, (_, i) => {
    const t = (i + 1) / cells;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    return <path key={i} d={`M${px} ${py} L${px} ${py + depth}`} />;
  });

  return (
    <g stroke="currentColor" className="text-solar" {...stroke}>
      <path d={`M${x1} ${y1} L${x2} ${y2} L${x2} ${y2 + depth} L${x1} ${y1 + depth} Z`} />
      <path
        d={`M${x1} ${y1 + depth / 2} L${x2} ${y2 + depth / 2}`}
        strokeOpacity="0.65"
      />
      {dividers}
    </g>
  );
}

function Ground({ y = 168, from = 8, to = 312 }) {
  return (
    <path
      d={`M${from} ${y} H${to}`}
      stroke="currentColor"
      strokeOpacity="0.35"
      {...stroke}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Carport visuals                                                            */
/* -------------------------------------------------------------------------- */

export type CarportVisualVariant = "single" | "double" | "canopy" | "mega" | "premium";

/**
 * Schematic side elevation for each carport family. Rendered instead of
 * photography so every model reads in the same technical language.
 */
export function CarportVisual({
  variant,
  className,
}: {
  variant: CarportVisualVariant;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-hidden="true"
      className={cn("h-full w-full text-white/85", className)}
    >
      {variant === "single" && (
        <>
          <Panel x1={40} y1={52} x2={266} y2={28} cells={7} />
          <g stroke="currentColor" {...stroke}>
            <path d="M264 37 V168" />
            <path d="M264 52 L248 39" strokeOpacity="0.5" />
          </g>
          <Car x={84} y={130} />
          <Ground />
        </>
      )}

      {variant === "double" && (
        <>
          <Panel x1={22} y1={54} x2={156} y2={28} cells={4} />
          <Panel x1={164} y1={28} x2={298} y2={54} cells={4} />
          <g stroke="currentColor" {...stroke}>
            <path d="M160 37 V168" />
            <path d="M160 60 L138 52" strokeOpacity="0.5" />
            <path d="M160 60 L182 52" strokeOpacity="0.5" />
          </g>
          <Car x={44} y={130} />
          <Car x={182} y={130} />
          <Ground />
        </>
      )}

      {variant === "mega" && (
        <>
          <Panel x1={26} y1={34} x2={292} y2={16} cells={9} depth={10} />
          <g stroke="currentColor" {...stroke}>
            <path d="M288 26 V168" />
            <path d="M288 48 L266 29" strokeOpacity="0.5" />
          </g>
          <Truck x={40} y={116} />
          <Ground />
        </>
      )}

      {variant === "premium" && (
        <>
          <Panel x1={20} y1={44} x2={150} y2={26} cells={4} />
          <Panel x1={170} y1={26} x2={300} y2={44} cells={4} />
          <g stroke="currentColor" {...stroke}>
            <path d="M150 35 L160 72 L170 35" />
            <path d="M160 72 V168" />
          </g>
          <Car x={40} y={130} />
          <Car x={186} y={130} />
          <Ground />
        </>
      )}

      {variant === "canopy" && (
        <>
          <Panel x1={70} y1={44} x2={250} y2={26} cells={5} />
          <g stroke="currentColor" {...stroke}>
            <path d="M160 40 V168" />
            <rect x="146" y="86" width="28" height="42" rx="4" />
            <path d="M153 98 h14 M153 106 h14" strokeOpacity="0.6" />
            <path d="M174 108 h16 v-14" strokeOpacity="0.5" />
          </g>
          <g className="text-solar" stroke="currentColor" {...stroke}>
            <path d="M162 112 l-6 9 h7 l-5 8" />
          </g>
          <Car x={44} y={130} />
          <Ground />
        </>
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Small icons (the three marks from the brand lockup)                        */
/* -------------------------------------------------------------------------- */

export function IconCarportCar({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={cn("h-14 w-16", className)}>
      <g transform="translate(0 -4)">
        <Panel x1={14} y1={30} x2={100} y2={18} cells={5} depth={7} />
        <g stroke="currentColor" {...stroke}>
          <path d="M98 25 V88" />
        </g>
        <Car x={16} y={54} />
      </g>
    </svg>
  );
}

export function IconCarportTruck({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 140 100" aria-hidden="true" className={cn("h-14 w-20", className)}>
      <Panel x1={8} y1={26} x2={126} y2={14} cells={6} depth={7} />
      <g stroke="currentColor" {...stroke}>
        <path d="M124 21 V90" />
      </g>
      <Truck x={6} y={40} />
    </svg>
  );
}

export function IconStorageLeaf({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={cn("h-14 w-16", className)}>
      <g stroke="currentColor" {...stroke}>
        <path d="M12 34 h56 v50 h-56 z" />
        <path d="M22 28 h10 v6 h-10 z" />
        <path d="M50 28 h10 v6 h-10 z" />
        <path d="M58 46 v26" strokeOpacity="0.5" />
        <path d="M96 84 c-18 -6 -18 -34 0 -46 c18 12 18 40 0 46 z" />
        <path d="M96 84 V44" strokeOpacity="0.6" />
        <path d="M96 60 l8 -7 M96 68 l-8 -7" strokeOpacity="0.6" />
      </g>
      <g className="text-solar" stroke="currentColor" {...stroke}>
        <path d="M36 46 l-8 14 h10 l-7 14" />
      </g>
    </svg>
  );
}

export function IconScrewPile({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className={cn("h-14 w-16", className)}>
      <g stroke="currentColor" {...stroke}>
        <path d="M14 34 H106" strokeOpacity="0.35" />
        <path d="M52 12 h16 v22 h-16 z" />
        <path d="M60 34 V86" />
        <path d="M60 88 l-7 -10 h14 z" />
      </g>
      <g className="text-solar" stroke="currentColor" {...stroke}>
        <path d="M48 42 q12 8 24 0" />
        <path d="M48 54 q12 8 24 0" />
        <path d="M50 66 q10 7 20 0" />
      </g>
    </svg>
  );
}
