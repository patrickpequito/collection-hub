import Link from "next/link";
import { HomeSearchLoot, MonumentSpotlightProgress } from "@/components/home/home-spotlight-parts";
import { MONUMENT_OF_TRIUMPH_HUB } from "@/data/activities/monument-of-triumph";
import { resolveMonumentOfTriumph } from "@/lib/activities/monument-of-triumph";
import { armorPieces, ownershipGroups } from "@/lib/activities/playlist-page";
import { PAGE_HEADERS } from "@/lib/page-headers";
import { summarizeSeal } from "@/lib/triumphs/hub";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";

const TAG = "border px-1.5 py-0.5 font-display text-[10.5px] uppercase tracking-[0.14em] bg-void/60";

/** Spotlight: the current update (Monument of Triumph), the set bonuses guide and loot search. */
export async function HomeSpotlight() {
  const [data, catalog] = await Promise.all([resolveMonumentOfTriumph(), loadTriumphCatalog()]);
  const title = getTitleEntry(catalog, MONUMENT_OF_TRIUMPH_HUB.titleSlug);
  const armorGroups = ownershipGroups(armorPieces(data.armorSets.flatMap((set) => set.rows)));
  const rewardGroups = ownershipGroups([
    ...armorPieces(data.ornamentSets.flatMap((set) => set.rows)),
    ...Object.values(data.singles).flat(),
    ...armorPieces(data.rewardsPassSets.flatMap((set) => set.rows)),
    ...data.cosmetics.flatMap((section) => section.items),
  ]);

  return (
    <section className="mx-auto max-w-[1360px] px-4 pt-9 sm:px-6">
      <div className="mb-3.5 flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
        <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Spotlight</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Link
          href={`/activities/${MONUMENT_OF_TRIUMPH_HUB.slug}`}
          className="group relative flex min-h-[300px] flex-col justify-end gap-2 overflow-hidden border border-white/[0.16] bg-panel px-5 py-5 transition hover:border-bone/60 sm:px-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MONUMENT_OF_TRIUMPH_HUB.headerImageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.92)_8%,rgba(11,13,16,0.25)_65%,rgba(11,13,16,0.05))]"
          />
          <span className="relative flex gap-2">
            <span className={`${TAG} border-[#e8c860]/60 text-[#e8c860]`}>Now</span>
            <span className={`${TAG} border-white/30 text-[#c7cad0]`}>Update</span>
          </span>
          <span className="text-on-art relative font-display text-4xl font-semibold uppercase leading-none tracking-[0.05em] text-white sm:text-[40px]">
            {MONUMENT_OF_TRIUMPH_HUB.title}
          </span>
          <span className="text-on-art relative max-w-[520px] text-sm text-[#c7cad0]">
            Playlist armor sets, Monument ornaments and cosmetics, and the Immortal seal.
          </span>
          <MonumentSpotlightProgress armorGroups={armorGroups} rewardGroups={rewardGroups} seal={title ? summarizeSeal(title) : null} />
        </Link>
        <div className="grid gap-3 lg:grid-rows-[1fr_auto]">
          <Link
            href="/sets/bonuses"
            className="group relative flex min-h-[144px] flex-col justify-end gap-1 overflow-hidden border border-owned/50 bg-panel px-4 py-3.5 transition hover:border-owned"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PAGE_HEADERS.armorSetsHeader}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,13,16,0.92)_8%,rgba(11,13,16,0.25)_65%,rgba(11,13,16,0.05))]"
            />
            <span className="ui-label text-on-art relative text-[11px]! text-[#e8c860]!">Guide</span>
            <span className="text-on-art relative font-display text-[22px] font-semibold uppercase leading-tight tracking-[0.05em] text-white">
              Armor set bonuses
            </span>
            <span className="text-on-art relative text-[12.5px] text-[#c7cad0]">
              Every 2 and 4-piece bonus, searchable by effect
            </span>
          </Link>
          <HomeSearchLoot />
        </div>
      </div>
    </section>
  );
}
