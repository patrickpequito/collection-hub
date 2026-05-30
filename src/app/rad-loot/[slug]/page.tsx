import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityArmorSection } from "@/components/activity-armor-section";
import { ActivityPageHeader } from "@/components/activity-page-header";
import { LootSection } from "@/components/loot-section";
import { getActivityLootPage } from "@/data/rad-loot/vault-of-glass";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
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
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <ActivityPageHeader
        title={activity.title}
        imageFile={activity.headerImageFile}
      />

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <Link
          href="/rad-loot"
          className="inline-block text-sm text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
        >
          ← RAD Loot
        </Link>

        {session ? (
          <p className="text-xs text-zinc-500">
            Signed in as {session.displayName}.
            {inventoryError ? ` Collection unavailable: ${inventoryError}` : null}
          </p>
        ) : (
          <p className="text-xs text-amber-200/80">
            Sign in from the home page to highlight items you own.
          </p>
        )}

        {showOwnership ? (
          <p className="text-xs text-zinc-500">
            Gold border = legendary acquired. Green border = exotic acquired. Hover for
            source.
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
      </div>
    </main>
  );
}
