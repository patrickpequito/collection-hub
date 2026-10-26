import Link from "next/link";
import type { ReactNode } from "react";
import { ExploreClosestTitles, ExploreMeta, type ExploreMetaKey } from "@/components/home/home-explore-meta";
import { DESTINATIONS } from "@/data/destinations";
import { PUBLISHED_EXPANSION_SLUGS } from "@/data/expansions";
import { DUNGEONS, LEGACY_RAIDS, RAIDS } from "@/data/rad-loot/activities";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { loadTriumphCatalog } from "@/lib/triumphs/load";

/** `href: null` = page not built yet (greyed out, no link). */
type Row = { label: string; href: string | null; meta: string; metaKey?: ExploreMetaKey };

const expansionHref = (slug: string) => (PUBLISHED_EXPANSION_SLUGS.has(slug) ? `/expansions/${slug}` : null);

const ROW = "flex items-center justify-between gap-3 border-b border-white/[0.07] py-2 text-sm last:border-b-0";

function Pillar({ title, href, image, rows, extra }: { title: string; href: string; image: string; rows: Row[]; extra?: ReactNode }) {
  return (
    <div className="ui-panel flex min-w-0 flex-col">
      <Link href={href} className="group relative flex min-h-[120px] flex-col justify-end overflow-hidden border-b border-hairline px-4 py-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.92)_8%,rgba(11,13,16,0.25)_65%,rgba(11,13,16,0.05))]"
        />
        <span className="text-on-art relative font-display text-[22px] font-semibold uppercase tracking-[0.05em] text-white">{title}</span>
      </Link>
      <div className="flex-1 px-4 pb-2.5 pt-1">
        {rows.map((row) => {
          const content = (
            <>
              <span className="truncate">{row.label}</span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-ash">
                {row.metaKey ? <ExploreMeta metaKey={row.metaKey} fallback={row.meta} /> : row.meta}
              </span>
            </>
          );
          return row.href ? (
            <Link key={row.label} href={row.href} className={`${ROW} text-bone/85 transition hover:text-white`}>
              {content}
            </Link>
          ) : (
            <div key={row.label} title="Page coming soon" className={`${ROW} text-bone/40`}>
              {content}
            </div>
          );
        })}
        {extra}
      </div>
    </div>
  );
}

/** Every area of the site in four columns that mirror the navigation. */
export async function HomeExplore() {
  const catalog = await loadTriumphCatalog();
  const raids = RAIDS.length + LEGACY_RAIDS.length;
  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-6">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Explore</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Pillar
          title="Collections"
          href="/all-loot"
          image={PAGE_HEADERS.lootCollector}
          rows={[
            { label: "Loot Collector", href: "/all-loot", meta: "Search", metaKey: "loot" },
            { label: "Exotics", href: "/exotics", meta: "Catalog", metaKey: "exotics" },
            { label: "Armor sets", href: "/sets", meta: "Catalog" },
            { label: "Set bonuses guide", href: "/sets/bonuses", meta: "Guide" },
            { label: "Shaders", href: "/shaders", meta: "Catalog", metaKey: "shaders" },
            { label: "Collections badges", href: "/collections", meta: "39 badges", metaKey: "badges" },
          ]}
        />
        <Pillar
          title="Triumphs"
          href="/triumphs"
          image={PAGE_HEADERS.triumphs}
          rows={[
            { label: "Seals & titles", href: "/triumphs", meta: `${catalog.titles.length} seals`, metaKey: "seals" },
            { label: "Triumph groups", href: "/triumphs", meta: `${catalog.groups.length} groups` },
            { label: "Legacy seals", href: "/triumphs", meta: `${catalog.legacyTitles?.length ?? 0} seals` },
          ]}
          extra={
            <ExploreClosestTitles
              placeholders={[
                { label: "Raid seals", href: "/triumphs", meta: "→" },
                { label: "Dungeon seals", href: "/triumphs", meta: "→" },
                { label: "Event seals", href: "/triumphs", meta: "→" },
              ]}
            />
          }
        />
        <Pillar
          title="Timeline"
          href="/expansions"
          image="/images/banners/expansions-seasons.webp"
          rows={[
            { label: "Monument of Triumph", href: "/activities/monument-of-triumph", meta: "Now · Update" },
            { label: "Renegades", href: expansionHref("renegades"), meta: "Year 8" },
            { label: "The Edge of Fate", href: expansionHref("the-edge-of-fate"), meta: "Year 8" },
            { label: "The Final Shape", href: expansionHref("the-final-shape"), meta: "Year 7" },
            { label: "Lightfall", href: expansionHref("lightfall"), meta: "Year 6" },
            { label: "All expansions & seasons", href: "/expansions", meta: "→" },
          ]}
        />
        <Pillar
          title="Activities"
          href="/activities"
          image={PAGE_HEADERS.radLoot}
          rows={[
            { label: "Raids", href: "/activities#raids", meta: String(raids) },
            { label: "Dungeons", href: "/activities#dungeons", meta: String(DUNGEONS.length) },
            { label: "Pantheon", href: "/activities/the-pantheon", meta: "Weekly" },
            { label: "Playlists", href: "/activities/vanguard-ops", meta: "6" },
            { label: "Sparrow Racing League", href: "/activities/sparrow-racing-league", meta: "New" },
            { label: "Destinations", href: "/activities/destinations", meta: String(DESTINATIONS.length) },
          ]}
        />
      </div>
    </section>
  );
}
