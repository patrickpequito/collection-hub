import {
  CLASS_LABELS,
  GUARDIAN_CLASS_ICON_PATHS,
} from "@/lib/armor-sets/constants";
import type { GuardianClass } from "@/types/armor-set";

type GuardianClassIconProps = {
  guardianClass: GuardianClass;
  size?: "sm" | "md";
  /** Row layout: fill parent width and align glyph to the right edge. */
  align?: "inline" | "row";
};

const SIZE_CLASSES = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
} as const;

export function GuardianClassIcon({
  guardianClass,
  size = "md",
  align = "inline",
}: GuardianClassIconProps) {
  const className =
    align === "row"
      ? "h-5 w-full object-contain object-right brightness-0 invert opacity-90"
      : `${SIZE_CLASSES[size]} shrink-0 object-contain brightness-0 invert opacity-90`;

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
