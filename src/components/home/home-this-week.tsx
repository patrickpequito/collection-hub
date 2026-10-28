import Link from "@/components/app-link";
import type { ReactNode } from "react";
import { WeeklyLootBar } from "@/components/home/home-progress";
import { loadHomeThisWeek, type DestinationWeek, type PantheonFeaturedBoss } from "@/lib/home/this-week";
import type { ActivityEntry } from "@/types/activity-loot";

const TILE =
  "group relative flex min-h-[165px] flex-col justify-end gap-1 overflow-hidden border border-white/[0.16] bg-panel px-4 py-3.5 transition hover:border-bone/60";
const SHADE =
  "absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.92)_8%,rgba(11,13,16,0.25)_65%,rgba(11,13,16,0.05))]";
const TAG = "border px-1.5 py-0.5 font-display text-[10.5px] uppercase tracking-[0.14em] bg-void/60";

function formatDay(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(ms),
  );
}

function resetIn(ms: number): string {
  const minutes = Math.max(0, Math.round((ms - Date.now()) / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return days > 0 ? `${days}d ${String(hours).padStart(2, "0")}h` : `${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function activityImage(entry: ActivityEntry): string | undefined {
  const file = entry.wideImageFile ?? entry.imageFile;
  return file ? `/images/rad-loot/activities/${file}` : undefined;
}

function Tile({
  href,
  image,
  eyebrow,
  title,
  sub,
  imagePosition,
  children,
}: {
  href: string;
  image?: string;
  /** CSS object-position for cropped art (e.g. "72% center"). */
  imagePosition?: string;
  eyebrow: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className={TILE}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          style={imagePosition ? { objectPosition: imagePosition } : undefined}
        />
      ) : null}
      <span aria-hidden className={SHADE} />
      <span className="ui-label text-on-art relative text-[11px]! text-[#e8c860]!">{eyebrow}</span>
      <span className="text-on-art relative font-display text-xl font-semibold uppercase leading-tight tracking-[0.05em] text-white">
        {title}
      </span>
      {sub ? <span className="text-on-art relative line-clamp-2 text-[12.5px] text-[#c7cad0]">{sub}</span> : null}
      {children}
    </Link>
  );
}

const PANTHEON_ART = "/images/rad-loot/activities/the-pantheon-wide.webp";

/** Pantheon tile split in two: this week's featured Reprise and Encore bosses, each over its own art. */
function PantheonTile({ bosses }: { bosses: PantheonFeaturedBoss[] }) {
  if (bosses.length === 0) {
    return (
      <Tile href="/activities/the-pantheon" image={PANTHEON_ART} imagePosition="72% center" eyebrow="Pantheon" title="Raid boss rush">
        <WeeklyLootBar slug="the-pantheon" />
      </Tile>
    );
  }
  return (
    <Link href="/activities/the-pantheon" className={TILE}>
      <span aria-hidden className="absolute inset-0 grid grid-cols-2 gap-px bg-white/[0.16]">
        {bosses.map((featured, index) => (
          <span key={featured.pool} className="relative overflow-hidden bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.image ?? PANTHEON_ART}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                featured.image ? "" : "opacity-35 blur-[3px] grayscale"
              }`}
              style={featured.image ? undefined : { objectPosition: index === 0 ? "35% center" : "80% center" }}
            />
          </span>
        ))}
      </span>
      <span aria-hidden className={SHADE} />
      <span className="ui-label text-on-art relative text-[11px]! text-[#e8c860]!">Pantheon · Featured bosses</span>
      <span className="relative grid grid-cols-2 gap-3">
        {bosses.map((featured) => (
          <span key={featured.pool} className="flex min-w-0 flex-col">
            <span className="ui-label text-on-art text-[10.5px]! text-[#c7cad0]!">{featured.pool}</span>
            <span className="text-on-art truncate font-display text-xl font-semibold uppercase leading-tight tracking-[0.05em] text-white">
              {featured.boss}
            </span>
          </span>
        ))}
      </span>
      <WeeklyLootBar slug="the-pantheon" />
    </Link>
  );
}

function DestinationCard({ destination }: { destination: DestinationWeek }) {
  const pending = destination.headline === null;
  const tag = pending
    ? { label: "Soon", className: "border-white/30 text-[#c7cad0]" }
    : destination.cadence === "daily"
      ? { label: "Daily", className: "border-[#e8c860]/60 text-[#e8c860]" }
      : { label: "Weekly", className: "border-seasonal/70 text-[#5fd6d5]" };
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={destination.imageUrl}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover ${pending ? "brightness-[0.55] grayscale" : "transition duration-300 group-hover:scale-[1.03]"}`}
      />
      <span aria-hidden className={SHADE} />
      <span className={`${TAG} absolute right-2 top-2 z-10 ${tag.className}`}>{tag.label}</span>
      <span className={`ui-label text-on-art relative text-[10px]! ${pending ? "" : "text-[#e8c860]!"}`}>{destination.name}</span>
      <span className="text-on-art relative line-clamp-2 font-display text-[13.5px] font-semibold uppercase leading-tight tracking-[0.04em] text-white">
        {destination.headline ?? "Rotation coming soon"}
      </span>
    </>
  );
  const className = `group relative flex min-h-[128px] flex-col justify-end gap-0.5 overflow-hidden border border-white/[0.16] bg-panel px-2.5 py-2.5 ${
    pending ? "opacity-55" : ""
  }`;
  return destination.href && !pending ? (
    <Link href={destination.href} className={`${className} transition hover:border-bone/60`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** Weekly rotation: endgame activities, the live event, and every destination's rotation. */
export async function HomeThisWeek() {
  const week = await loadHomeThisWeek();
  const [raidA, raidB] = week.raids;
  const [dungeonA, dungeonB] = week.dungeons;
  const trialsLive = week.trials.maps.length > 0 && week.trials.source !== "iron-banner";

  // Slim event bar: whatever is live now, and what comes next.
  const live = week.ironBanner.live
    ? {
        name: "Iron Banner",
        href: "/activities/iron-banner",
        image: "/images/headers/iron-banner-header.webp",
        detail: `Until ${formatDay(week.ironBanner.endMs)}`,
      }
    : trialsLive
      ? {
          name: "Trials of Osiris",
          href: "/activities/trials-of-osiris",
          image: "/images/headers/trials-of-osiris-header.webp",
          detail: `${week.trials.maps.map((map) => map.name).join(" · ")} · ${week.trialsRange}`,
        }
      : null;
  const next = week.ironBanner.live
    ? {
        label: "Trials of Osiris · returns after Iron Banner",
        href: "/activities/trials-of-osiris",
        image: "/images/headers/trials-of-osiris-header.webp",
      }
    : {
        label: `Iron Banner · ${formatDay(week.ironBanner.nextStartMs)}`,
        href: "/activities/iron-banner",
        image: "/images/headers/iron-banner-header.webp",
      };

  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-6">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">This week</h2>
        <span className="ui-label text-seasonal!">Weekly reset in {resetIn(week.weekEndMs)} · Tuesday 17:00 UTC</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {raidA ? (
          <Tile href={`/activities/${raidA.slug}`} image={activityImage(raidA)} eyebrow="Featured raid" title={raidA.title}>
            <WeeklyLootBar slug={raidA.slug} />
          </Tile>
        ) : null}
        {raidB ? (
          <Tile href={`/activities/${raidB.slug}`} image={activityImage(raidB)} eyebrow="Featured raid" title={raidB.title}>
            <WeeklyLootBar slug={raidB.slug} />
          </Tile>
        ) : null}
        <PantheonTile bosses={week.pantheon} />
        {dungeonA ? (
          <Tile href={`/activities/${dungeonA.slug}`} image={activityImage(dungeonA)} eyebrow="Featured dungeon" title={dungeonA.title}>
            <WeeklyLootBar slug={dungeonA.slug} />
          </Tile>
        ) : null}
        {dungeonB ? (
          <Tile href={`/activities/${dungeonB.slug}`} image={activityImage(dungeonB)} eyebrow="Featured dungeon" title={dungeonB.title}>
            <WeeklyLootBar slug={dungeonB.slug} />
          </Tile>
        ) : null}
        <Tile
          href="/activities/vanguard-ops"
          image="/images/headers/vanguard-ops-header.webp"
          eyebrow={week.nightfall?.grandmaster ? "Vanguard Grandmaster alert" : "Weekly Nightfall"}
          title={week.nightfall?.strike ?? "Vanguard Ops"}
          sub={week.nightfall?.grandmaster ? "Grandmaster Nightfall is live" : "Nightfall strike this week"}
        />
      </div>

      {/* Two separate links: the live event, and the next one. */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        {live ? (
          <Link
            href={live.href}
            className="group flex min-w-0 flex-1 items-stretch border border-hairline bg-panel/85 transition hover:border-bone/60"
          >
            {/* Phones: a narrower image strip so the card stays short. */}
            <span className="relative w-24 shrink-0 overflow-hidden sm:w-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={live.image}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
              <span className="flex items-center gap-2">
                <span className={`${TAG} border-[#4fbf73] text-[#8fe0a8]`}>Live</span>
                <span className="font-display text-[15px] font-semibold uppercase tracking-[0.08em] text-bone">{live.name}</span>
              </span>
              <span className="text-[12.5px] text-ash">{live.detail}</span>
            </span>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center border border-hairline bg-panel/85 px-4 py-3 text-sm text-ash">
            No playlist event this week.
          </div>
        )}
        <Link
          href={next.href}
          className="group flex items-stretch border border-hairline bg-panel/85 transition hover:border-bone/60 sm:min-w-[300px]"
        >
          <span className="relative w-24 shrink-0 overflow-hidden sm:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={next.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          </span>
          <span className="flex flex-col justify-center gap-0.5 px-4 py-3">
            <span className="ui-label text-[11px]!">Next</span>
            <span className="text-sm text-bone">{next.label}</span>
          </span>
        </Link>
      </div>

      <p className="ui-label mt-5 text-[11px]!">Destinations · weekly and daily rotations</p>
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {week.destinations.map((destination) => (
          <DestinationCard key={destination.slug} destination={destination} />
        ))}
      </div>
    </section>
  );
}
