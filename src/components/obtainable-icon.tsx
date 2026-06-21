type ObtainableIconProps = {
  obtainable: boolean;
  size?: "default" | "compact";
};

export function ObtainableIcon({
  obtainable,
  size = "default",
}: ObtainableIconProps) {
  const compact = size === "compact";
  const iconClass = compact
    ? "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none"
    : "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs sm:h-6 sm:w-6 sm:text-sm";

  if (obtainable) {
    return (
      <span
        className={`${iconClass} bg-emerald-500/15 text-emerald-300`}
        title="Obtainable today"
        aria-label="Obtainable today"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      className={`${iconClass} bg-zinc-800 text-zinc-500`}
      title="Not obtainable"
      aria-label="Not obtainable"
    >
      ✕
    </span>
  );
}
