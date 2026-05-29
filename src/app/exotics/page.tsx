import Link from "next/link";
import { ExoticsCatalog } from "@/components/exotics-catalog";
import { fetchOwnedItemHashes } from "@/lib/destiny-inventory";
import { loadExoticCatalog } from "@/lib/exotics/load";
import { getSession } from "@/lib/session";

export default async function ExoticsPage() {
  const session = await getSession();
  const catalog = await loadExoticCatalog();

  let ownedItemHashes: string[] = [];
  let inventoryError: string | null = null;

  if (session) {
    try {
      const owned = await fetchOwnedItemHashes(session);
      ownedItemHashes = [...owned];
    } catch (error) {
      inventoryError =
        error instanceof Error ? error.message : "Failed to load inventory";
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] text-zinc-400">
              COLLECTION HUB
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Exotics</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Exotic weapons and armor ({catalog.items.length} items).
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <Link
              href="/sets"
              className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Armor sets
            </Link>
            <Link
              href="/"
              className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              ← Home
            </Link>
          </div>
        </header>

        {session ? (
          <p className="mb-4 text-xs text-zinc-500">
            Signed in as {session.displayName}.
            {inventoryError
              ? ` Inventory unavailable: ${inventoryError}`
              : ` Tracking ${ownedItemHashes.length} items in your profile.`}
          </p>
        ) : (
          <p className="mb-4 text-xs text-amber-200/80">
            Sign in from the home page to highlight exotics you already own.
          </p>
        )}

        <ExoticsCatalog
          items={catalog.items}
          ownedItemHashes={ownedItemHashes}
          showOwnership={Boolean(session && !inventoryError)}
        />
      </div>
    </main>
  );
}
