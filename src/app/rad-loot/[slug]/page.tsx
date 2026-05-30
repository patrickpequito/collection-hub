import { notFound } from "next/navigation";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { LootSection } from "@/components/loot-section";
import { getActivityLootPage } from "@/data/rad-loot/activity-pages";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { isBungieOAuthConfigured } from "@/lib/env";
import { activityHeaderUrl } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

type ActivityPageProps = {
  params: Promise<{ slug: string }>;
};

const ACTIVITY_EXOTIC_HASHES: Record<string, Set<string>> = {
  "vault-of-glass": new Set(["4289226715", "2907216422"]),
  "crotas-end": new Set(["1034055198", "1934481780", "2091889892"]),
};

export default async function ActivityLootPage({ params }: ActivityPageProps) {
  const { slug } = await params;
  const activity = getActivityLootPage(slug);

  if (!activity) {
    notFound();
  }

  const session = await getSession();
  const oauthConfigured = isBungieOAuthConfigured();
  let ownedItemHashes = new Set<string>();
  let inventoryError: string | null = null;

  if (session) {
    try {
      ownedItemHashes = await fetchOwnedItemHashes(session);
    } catch (error) {
      inventoryError =
        error instanceof Error ? error.message : "Failed to load inventory";
    }
  }

  const showOwnership = Boolean(session && !inventoryError);
  const exoticItemHashes = ACTIVITY_EXOTIC_HASHES[slug] ?? new Set<string>();

  return (
    <SectionPageLayout
      title={activity.title}
      imageUrl={activityHeaderUrl(activity.headerImageFile)}
      session={session}
      oauthConfigured={oauthConfigured}
      backLink={{ href: "/rad-loot", label: "← RAD Loot" }}
    >
      {inventoryError ? (
        <p className="text-xs text-zinc-500">
          Collection unavailable: {inventoryError}
        </p>
      ) : !session ? (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight items you own.
        </p>
      ) : null}

      {showOwnership ? (
        <p className="text-xs text-zinc-500">
          Gold border = legendary acquired. Green border = exotic acquired. Hover
          for source.
        </p>
      ) : null}

      <ActivityArmorSection
        rows={activity.armorSets}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
      />

      <LootSection
        title="Weapons"
        items={activity.weapons}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        exoticItemHashes={exoticItemHashes}
      />

      <LootSection
        title={activity.timelostWeaponsTitle ?? "Timelost Weapons"}
        items={activity.timelostWeapons}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
      />

      <LootSection
        title="Other"
        items={activity.other}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        exoticItemHashes={exoticItemHashes}
      />
    </SectionPageLayout>
  );
}
