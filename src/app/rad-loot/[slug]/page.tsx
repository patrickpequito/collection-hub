import { notFound } from "next/navigation";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { SectionPageLayout } from "@/components/section-page-layout";
import { LootSection } from "@/components/loot-section";
import { getActivityLootPage } from "@/data/rad-loot/vault-of-glass";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { isBungieOAuthConfigured } from "@/lib/env";
import { activityHeaderUrl } from "@/lib/page-headers";
import { getSession } from "@/lib/session";

type ActivityPageProps = {
  params: Promise<{ slug: string }>;
};

const VOG_EXOTIC_HASHES = new Set(["4289226715", "2907216422"]);

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

  return (
    <SectionPageLayout
      title={activity.title}
      imageUrl={activityHeaderUrl(activity.headerImageFile)}
      session={session}
      oauthConfigured={oauthConfigured}
      backLink={{ href: "/rad-loot", label: "← RAD Loot" }}
    >
      {session ? (
        <p className="text-xs text-zinc-500">
          Signed in as {session.displayName}.
          {inventoryError ? ` Collection unavailable: ${inventoryError}` : null}
        </p>
      ) : (
        <p className="text-xs text-amber-200/80">
          Sign in to highlight items you own.
        </p>
      )}

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
        exoticItemHashes={VOG_EXOTIC_HASHES}
      />

      <LootSection
        title="Timelost Weapons"
        items={activity.timelostWeapons}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
      />

      <LootSection
        title="Other"
        items={activity.other}
        ownedItemHashes={ownedItemHashes}
        showOwnership={showOwnership}
        exoticItemHashes={VOG_EXOTIC_HASHES}
      />
    </SectionPageLayout>
  );
}
