import {
  CLASS_LABELS,
  GUARDIAN_CLASS_ICON_PATHS,
} from "@/lib/armor-sets/constants";
import type { GuardianClass } from "@/types/armor-set";

type GuardianClassIconProps = {
  guardianClass: GuardianClass;
  size?: "xs" | "sm" | "md";
  /** Row layout: fill parent width and align glyph to the right edge. */
  align?: "inline" | "row";
  /** "dark" renders a black glyph for light backgrounds. */
  tone?: "light" | "dark";
};

/** xs is optically balanced: the Hunter glyph reads larger, so it is drawn smaller. */
const XS_CLASS_SIZES: Record<GuardianClass, string> = {
  hunter: "h-3 w-3",
  titan: "h-[13px] w-[13px]",
  warlock: "h-3.5 w-3.5",
};

const SIZE_CLASSES = {
  xs: "h-3.5 w-3.5",
  sm: "h-5 w-5",
  md: "h-6 w-6",
} as const;

export function GuardianClassIcon({
  guardianClass,
  size = "md",
  align = "inline",
  tone = "light",
}: GuardianClassIconProps) {
  const toneClass = tone === "dark" ? "brightness-0" : "brightness-0 invert";
  const className =
    align === "row"
      ? `h-5 w-full object-contain object-right ${toneClass} opacity-90`
      : `${size === "xs" ? XS_CLASS_SIZES[guardianClass] : SIZE_CLASSES[size]} shrink-0 object-contain ${toneClass} opacity-90`;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local SVG icons need invert filter
    <img
      src={GUARDIAN_CLASS_ICON_PATHS[guardianClass]}
      alt={CLASS_LABELS[guardianClass]}
      aria-hidden
      className={className}
    />
  );
}
