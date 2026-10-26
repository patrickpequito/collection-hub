import type { ReactNode } from "react";
import { ProgressBar } from "@/components/home/progress-bar";

/** One of the summary blocks at the top of a raid / expansion / season page. */
export function StatBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ui-panel flex min-w-0 flex-col gap-2.5 p-4">
      <span className="ui-label truncate">{label}</span>
      {children}
    </div>
  );
}

/** "12 / 33" in the block's big number style; null owned → "—". */
export function StatCount({
  owned,
  total,
  gold = false,
}: {
  owned: number | null;
  total: number;
  gold?: boolean;
}) {
  return (
    <>
      <span
        className={`font-display text-[30px] leading-none ${
          gold && owned !== null ? "text-owned" : "text-bone"
        }`}
      >
        {owned?.toLocaleString("en-US") ?? "—"} / {total.toLocaleString("en-US")}
      </span>
      <ProgressBar owned={owned ?? 0} total={total} />
    </>
  );
}

/** Grid for 1–5 stat blocks. */
export function StatBlockGrid({ count, children }: { count: number; children: ReactNode }) {
  const columns =
    { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-3 lg:grid-cols-5" }[
      count
    ] ?? "sm:grid-cols-2 lg:grid-cols-4";
  return <section className={`grid gap-3 ${columns}`}>{children}</section>;
}

/** Jump links to the page's sections. */
export function SectionJumpNav({ links }: { links: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Sections" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="inline-flex h-10 items-center border border-white/[0.22] px-4 font-display text-sm uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-white"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Section title that sits above its block (never inside the panel): 24px title,
 * small note on the right (gold when it is an owned count), divider line below.
 */
export function SectionHeading({
  title,
  note,
  noteGold = false,
}: {
  title: ReactNode;
  note?: ReactNode;
  noteGold?: boolean;
}) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
      <h2 className="min-w-0 text-2xl font-semibold uppercase tracking-[0.06em] text-bone">{title}</h2>
      {note ? <span className={`ui-label shrink-0 ${noteGold ? "text-owned!" : ""}`}>{note}</span> : null}
    </div>
  );
}

/** Title row inside a block (Emblems, Armor · Set, Weapons…): title left, owned count right. */
export function BoxHeading({ title, note }: { title: ReactNode; note?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="min-w-0 font-display text-base font-semibold uppercase tracking-[0.08em] text-bone">{title}</h3>
      {note !== undefined && note !== null ? <span className="ui-label shrink-0">{note}</span> : null}
    </div>
  );
}
