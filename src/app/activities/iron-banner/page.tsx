import { ActivityEventCardRewardsPanel } from "@/components/activity-event-card-rewards-panel";
import { ClientOwnership } from "@/components/client-ownership";
import { SectionJumpNav } from "@/components/detail-page-parts";
import { ExpansionTriumphsPanel } from "@/components/expansions/expansion-triumphs-panel";
import {
  OwnedActivityCosmeticLootPanel,
  OwnedActivityCurrentLootPanelFull,
  OwnedLegacyArmorSetsSection,
} from "@/components/owned-activity-loot";
import { OwnershipStatBlocks } from "@/components/ownership-stat-blocks";
import { SectionPageLayout } from "@/components/section-page-layout";
import { IRON_BANNER_HUB } from "@/data/activities/iron-banner";
import { IRON_BANNER_EVENT_CARD_REWARDS } from "@/data/activities/iron-banner-event-card";
import { filterExpiredTriumphRecords } from "@/lib/activity-expired-content";
import { resolveIronBannerLoot } from "@/lib/activities/iron-banner-loot";
import { ironBannerPoolOccurrences, poolScheduleNow } from "@/lib/activities/pool-rotation";
import { formatShortDay, playlistEyebrow, playlistSiblings } from "@/lib/activities/playlists";
import { buildCollectibleHrefByItemHash } from "@/lib/collectible-hrefs";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadHomeThisWeek } from "@/lib/home/this-week";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import type { LootItem } from "@/types/activity-loot";
import { pickReferenced } from "@/lib/pick-referenced";

export const revalidate = 3600;

const groupsOf = (items: LootItem[]) => items.map((item) => item.ownershipHashes ?? [item.itemHash]);

export default async function IronBannerActivityPage() {
  const hub = IRON_BANNER_HUB;
  const poolSchedule = poolScheduleNow(ironBannerPoolOccurrences, ["pool-1", "pool-2"] as const);
  const oauthConfigured = isBungieOAuthConfigured();

  const [loot, catalog, allItemHrefs, week] = await Promise.all([
    resolveIronBannerLoot(),
    loadTriumphCatalog(),
    buildCollectibleHrefByItemHash(`/activities/${hub.slug}`),
    loadHomeThisWeek(),
  ]);
  // Only the links this page renders (the full map is ~0.5 MB).
  const itemHrefs = pickReferenced(allItemHrefs, [loot]);

  const titleEntry = getTitleEntry(catalog, hub.titleSlug);
  if (!titleEntry) {
    throw new Error(`Missing triumph title catalog entry: ${hub.titleSlug}`);
  }
  const title = {
    ...titleEntry,
    records: filterExpiredTriumphRecords(hub.titleSlug, titleEntry.records),
  };

  const pieces = (rows: { pieces: Record<string, LootItem | undefined> }[]) =>
    rows.flatMap((row) => Object.values(row.pieces).filter((piece): piece is LootItem => Boolean(piece)));
  const currentLoot = [
    ...pieces(loot.currentArmorRows),
    ...(loot.currentWeaponPools ?? []).flatMap((pool) => pool.items),
  ];
  const legacyArmor = loot.legacyArmorGroups.flatMap((group) => pieces(group.rows));
  // Every Iron Banner weapon and armor piece, current and legacy.
  const allGear = [
    ...currentLoot,
    ...(loot.vendorExclusiveWeapons ?? []),
    ...(loot.currentWeapons ?? []),
    ...legacyArmor,
  ];
  const cosmetics = loot.currentOtherSections.flatMap((section) => section.items);

  const badge = week.ironBanner.live
    ? `Live until ${formatShortDay(week.ironBanner.endMs)}`
    : `Next: ${formatShortDay(week.ironBanner.nextStartMs)}`;

  const sectionLinks = [
    { id: "current-loot", label: "Current loot" },
    { id: "event-card", label: "Event card" },
    { id: "cosmetics", label: "Cosmetics" },
    { id: "legacy-armor", label: "Legacy armor" },
    { id: "triumphs", label: "Triumphs" },
  ];

  return (
    <SectionPageLayout
      title={hub.title}
      imageUrl={hub.headerImageUrl}
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
      backLink={{ href: "/activities#playlists", label: "← Playlists" }}
      headerEyebrow={playlistEyebrow(hub.slug)}
      headerBadge={badge}
      siblings={playlistSiblings(hub.slug)}
    >
      <ClientOwnership>
        <div className="space-y-9">
          <OwnershipStatBlocks
            title={title}
            blocks={[
              { label: "Current loot", groups: groupsOf(currentLoot), gold: true },
              { label: "All weapons & armor", groups: groupsOf(allGear) },
              { label: "Cosmetics", groups: groupsOf(cosmetics) },
            ]}
          />

          <SectionJumpNav links={sectionLinks} />

          <div id="current-loot" className="scroll-mt-20">
            <OwnedActivityCurrentLootPanelFull
              activitySlug={hub.slug}
              activityTitle={hub.title}
              armorRows={loot.currentArmorRows}
              previewFiles={hub.armorSetPreviewFiles}
              weaponPools={loot.currentWeaponPools}
              poolOccurrences={poolSchedule.occurrences}
              poolsNowMs={poolSchedule.nowMs}
              weaponSubgroups={[
                { title: "Vendor exclusive · Lord Saladin", items: loot.vendorExclusiveWeapons ?? [] },
                { title: "Legacy Iron Banner weapons", items: loot.currentWeapons ?? [] },
              ]}
              itemHrefs={itemHrefs}
              heading="Current loot"
            />
          </div>

          <div id="event-card" className="scroll-mt-20">
            <ActivityEventCardRewardsPanel
              rewards={IRON_BANNER_EVENT_CARD_REWARDS}
              claimStatusByRank={null}
              showClaimStatus={false}
              itemHrefs={itemHrefs}
            />
          </div>

          <div id="cosmetics" className="scroll-mt-20">
            <OwnedActivityCosmeticLootPanel
              sections={loot.currentOtherSections}
              itemHrefs={itemHrefs}
              heading="Cosmetics"
            />
          </div>

          <div id="legacy-armor" className="scroll-mt-20">
            <OwnedLegacyArmorSetsSection
              groups={loot.legacyArmorGroups}
              itemHrefs={itemHrefs}
              heading="Legacy armor"
            />
          </div>

          <div id="triumphs" className="scroll-mt-20">
            <ExpansionTriumphsPanel title={title} triumphGroup={null} triumphsGroupTitle="" />
          </div>
        </div>
      </ClientOwnership>
    </SectionPageLayout>
  );
}
