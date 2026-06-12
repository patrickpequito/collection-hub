type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "h-5 w-5 border",
  md: "h-7 w-7 border-2",
  lg: "h-9 w-9 border-2",
} as const;

export function LoadingSpinner({
  label = "Loading",
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`shrink-0 animate-spin rounded-full border-zinc-700/50 border-t-zinc-400/70 motion-reduce:animate-none motion-reduce:border-zinc-500/60 ${SIZE_CLASSES[size]} ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
