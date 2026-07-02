import { isValidGearTier } from "@/lib/gear-tier";

/**
 * Tier diamonds in icon-normalized coordinates (0–100).
 * SVG scales with the roll icon box without transform drift.
 */
const GEAR_TIER_MARKER_LAYOUT = {
  left: 10.85,
  top: 30.5,
  size: 7.5,
  step: 13.75,
} as const;

type GearTierMarkersProps = {
  tier: number | null | undefined;
  className?: string;
};

function diamondCenter(index: number) {
  const { left, top, size, step } = GEAR_TIER_MARKER_LAYOUT;
  return {
    x: left + size / 2,
    y: top + index * step + size / 2,
  };
}

/**
 * Stacked diamonds on the left of item icons (Destiny gear tier 1–5).
 */
export function GearTierMarkers({ tier, className = "" }: GearTierMarkersProps) {
  if (!isValidGearTier(tier)) return null;

  const fill = tier === 5 ? "#e4b422" : "#c9b8e8";
  const { size } = GEAR_TIER_MARKER_LAYOUT;
  const half = size / 2;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute inset-0 z-10 ${className}`}
      aria-hidden
    >
      {Array.from({ length: tier }, (_, index) => {
        const { x, y } = diamondCenter(index);
        return (
          <rect
            key={index}
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            fill={fill}
            transform={`rotate(45 ${x} ${y})`}
          />
        );
      })}
    </svg>
  );
}
