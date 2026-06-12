import {
  CURRENT_VERSION,
  CURRENT_VERSION_PUBLISHED_AT,
  formatReleaseDate,
} from "@/data/updates";

type AppVersionLabelProps = {
  /** `overlay` for text on top of banner images. */
  variant?: "default" | "overlay";
  className?: string;
};

const VARIANT_CLASSES = {
  default: "text-xs text-zinc-500",
  overlay: "text-xs text-zinc-300/90 drop-shadow-sm",
} as const;

export function AppVersionLabel({
  variant = "default",
  className = "",
}: AppVersionLabelProps) {
  return (
    <p className={`${VARIANT_CLASSES[variant]} ${className}`}>
      v{CURRENT_VERSION} · Updated{" "}
      <time dateTime={CURRENT_VERSION_PUBLISHED_AT}>
        {formatReleaseDate(CURRENT_VERSION_PUBLISHED_AT)}
      </time>
    </p>
  );
}
