/** Triumph-style completion mark: outer border with inset gold fill. */
export function CompletionMark({
  complete,
  label,
}: {
  complete: boolean | null;
  /** Optional difficulty / column label shown beside the box. */
  label?: string;
}) {
  const done = complete === true;
  const unknown = complete === null;
  const status =
    complete === null ? "unknown" : complete ? "complete" : "incomplete";

  return (
    <span className="inline-flex items-center gap-1.5">
      {label ? (
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
      ) : null}
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
          done
            ? "border-[#c9a227]"
            : unknown
              ? "border-zinc-700 opacity-60"
              : "border-zinc-500"
        }`}
        role="img"
        aria-label={
          status === "unknown"
            ? label
              ? `${label}: not tracked`
              : "Not tracked"
            : status === "complete"
              ? label
                ? `${label}: complete`
                : "Complete"
              : label
                ? `${label}: incomplete`
                : "Incomplete"
        }
      >
        {done ? (
          <span className="h-[calc(100%-6px)] w-[calc(100%-6px)] bg-[#c9a227]" />
        ) : null}
      </span>
    </span>
  );
}
