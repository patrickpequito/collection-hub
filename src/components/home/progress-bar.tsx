type ProgressBarProps = {
  owned: number;
  total: number;
  className?: string;
  /** Default "completion": bone while in progress, gold only when complete. "gold" = always gold. */
  tone?: "gold" | "completion";
};

/** Thin Director UI progress bar: bone while in progress, gold when complete. */
export function ProgressBar({ owned, total, className = "", tone = "completion" }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (owned / total) * 100) : 0;
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={owned}
      className={`block h-1 w-full bg-white/10 ${className}`}
    >
      <span
        className={`block h-1 ${tone === "gold" || (total > 0 && owned >= total) ? "bg-owned" : "bg-bone"}`}
        style={{ width: `${percent}%` }}
      />
    </span>
  );
}
