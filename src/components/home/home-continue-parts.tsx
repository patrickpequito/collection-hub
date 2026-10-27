"use client";

import Link from "@/components/app-link";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { useHomeSummary } from "@/components/home/home-summary-provider";
import { PinIcon } from "@/components/pin-icon";
import { ProgressBar } from "@/components/home/progress-bar";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { MAX_PINNED_TITLES, usePinnedTitles } from "@/lib/use-pinned-titles";
import { useRecentVisits } from "@/lib/recent-visits";
import type { GuardianClass } from "@/types/armor-set";

const PANEL = "ui-panel flex min-w-0 flex-col px-4 pb-2 pt-3.5";
const ROW = "flex items-center gap-3 border-b border-white/[0.07] py-2.5 last:border-b-0";
const THUMB = "h-[34px] w-14 shrink-0 border border-white/[0.14] object-cover";

function PanelTitle({ title, link }: { title: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-bone">{title}</h3>
      {link ? (
        <Link href={link.href} className="ui-label text-[11px]! transition hover:text-bone">
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}

const Empty = ({ children }: { children: string }) => <p className="py-3 text-sm text-ash">{children}</p>;

/** Closest titles (pinned ones first), as on the old home row. */
export function ClosestTitles() {
  const { summary, signedIn } = useHomeSummary();
  const { pins } = usePinnedTitles();
  const progressBySlug = new Map((summary?.titleProgress ?? []).map((entry) => [entry.slug, entry]));
  const titles = [
    ...pins
      .map((slug) => progressBySlug.get(slug))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .map((entry) => ({ ...entry, pinned: true })),
    ...(summary?.closestTitles ?? [])
      .filter((entry) => !pins.includes(entry.slug))
      .map((entry) => ({ ...entry, pinned: false, done: false })),
  ].slice(0, MAX_PINNED_TITLES);
  return (
    <div className={PANEL}>
      <PanelTitle title="Closest titles" link={{ href: "/triumphs", label: "All →" }} />
      {!signedIn ? <Empty>Sign in to see the titles you&apos;re closest to earning.</Empty> : null}
      {signedIn && titles.length === 0 ? <Empty>{summary ? "No titles left to chase. Impressive." : "Loading…"}</Empty> : null}
      {titles.map((title) => (
        <Link
          key={title.slug}
          href={`/triumphs/title/${title.slug}`}
          className="flex flex-col gap-1.5 border-b border-white/[0.07] py-2.5 transition last:border-b-0 hover:bg-white/[0.03]"
        >
          <span className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-1.5 text-bone">
              {title.pinned ? <PinIcon className="size-3 shrink-0 text-owned" /> : null}
              <span className="truncate">{title.name}</span>
              {title.goal === "gild" && !title.done ? <span className="text-[12.5px] text-owned">Gild</span> : null}
            </span>
            <span className="shrink-0 text-[12.5px] tabular-nums text-owned">
              {title.done ? (title.goal === "gild" ? "Gilded" : "Complete") : `${title.completed} / ${title.total}`}
            </span>
          </span>
          <ProgressBar owned={title.completed} total={title.total} tone="gold" />
        </Link>
      ))}
    </div>
  );
}

const CLASSES: GuardianClass[] = ["hunter", "titan", "warlock"];

/** Collections badges closest to their next completed class. */
export function AlmostComplete() {
  const { summary, signedIn } = useHomeSummary();
  const badges = summary?.badges.almost ?? [];
  return (
    <div className={PANEL}>
      <PanelTitle title="Almost complete" link={{ href: "/collections", label: "Collections →" }} />
      {!signedIn ? <Empty>Sign in to see which collections you&apos;re closest to finishing.</Empty> : null}
      {signedIn && badges.length === 0 ? <Empty>{summary ? "Every collection is gilded." : "Loading…"}</Empty> : null}
      {badges.map((badge) => (
        <Link key={badge.slug} href={`/collections#${badge.slug}`} className={`${ROW} transition hover:bg-white/[0.03]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bungieIconUrl(badge.iconPath)} alt="" className={THUMB} />
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate text-sm text-bone">{badge.name}</span>
            <span className="grid grid-cols-3 gap-2">
              {CLASSES.map((guardianClass) => (
                <span key={guardianClass} className="flex items-center gap-1.5">
                  <GuardianClassIcon guardianClass={guardianClass} size="xs" />
                  <span className="block h-[3px] flex-1 bg-white/12">
                    <span
                      className={`block h-[3px] ${badge.classes[guardianClass] >= 100 ? "bg-owned" : "bg-bone/80"}`}
                      style={{ width: `${badge.classes[guardianClass]}%` }}
                    />
                  </span>
                </span>
              ))}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Recently viewed pages. */
export function JumpBackIn() {
  const visits = useRecentVisits().slice(0, 3);
  return (
    <div className={PANEL}>
      <PanelTitle title="Jump back in" />
      {visits.length === 0 ? <Empty>Pages you open (seasons, raids, weapons…) will show up here.</Empty> : null}
      {visits.map((visit) => (
        <Link key={visit.href} href={visit.href} className={`${ROW} transition hover:bg-white/[0.03]`}>
          {visit.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={visit.imageUrl} alt="" className={THUMB} />
          ) : (
            <span className={THUMB} />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-bone">{visit.title}</span>
            <span className="block text-[12.5px] text-ash">{visit.kind}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
