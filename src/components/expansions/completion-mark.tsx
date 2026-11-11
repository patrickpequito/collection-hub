/**
 * Completion notch: a 20×8 tab, outlined when open, gold with a soft glow when
 * done. One notch = one thing; a row of notches = a set.
 */
export function Notch({
  complete,
  small = false,
}: {
  complete: boolean | null;
  small?: boolean;
}) {
  const done = complete === true;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 border ${small ? "h-[7px] w-4" : "h-2 w-5"} ${
        done
          ? "border-owned bg-owned shadow-[0_0_6px_rgba(201,162,39,0.4)]"
          : complete === null
            ? "border-white/15"
            : "border-white/30"
      }`}
    />
  );
}

/** A run of notches (region chests, feathers…) with an accessible summary. */
export function NotchRow({ marks, label }: { marks: (boolean | null)[]; label?: string }) {
  const signedOut = marks.every((mark) => mark === null);
  const done = marks.filter((mark) => mark === true).length;
  return (
    <span
      role="img"
      aria-label={`${label ? `${label}: ` : ""}${signedOut ? `${marks.length} total` : `${done} of ${marks.length}`}`}
      className="flex flex-wrap gap-[3px]"
    >
      {marks.map((mark, index) => (
        <Notch key={index} complete={mark} />
      ))}
    </span>
  );
}

/** Notch with an optional label (difficulty / column) beside it. */
export function CompletionMark({
  complete,
  label,
}: {
  complete: boolean | null;
  /** Optional difficulty / column label shown beside the mark. */
  label?: string;
}) {
  const status =
    complete === null ? "not tracked" : complete ? "complete" : "incomplete";
  return (
    <span
      className="inline-flex items-center gap-1.5"
      role="img"
      aria-label={label ? `${label}: ${status}` : status}
    >
      {label ? (
        <span aria-hidden className="text-[11px] font-medium text-zinc-400">
          {label}
        </span>
      ) : null}
      <Notch complete={complete} />
    </span>
  );
}
