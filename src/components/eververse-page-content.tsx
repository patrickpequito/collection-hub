"use client";

import { useEffect, useState } from "react";
import { EververseCatalog } from "@/components/eververse-catalog";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import type { EververseRotation } from "@/types/eververse";

type EverversePageContentProps = {
  signedIn: boolean;
};

export function EverversePageContent({ signedIn }: EverversePageContentProps) {
  const { itemHashes: ownedItemHashes, error: inventoryError } =
    useOwnedItemHashes(signedIn);
  const [rotation, setRotation] = useState<EververseRotation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [source, setSource] = useState<"cache" | "live" | "none">("none");
  const [loading, setLoading] = useState(signedIn);

  useEffect(() => {
    if (!signedIn) {
      setLoading(false);
      setRotation(null);
      setError(null);
      setSource("none");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/eververse/rotation", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          rotation: EververseRotation | null;
          error: string | null;
          apiNotice: string | null;
          source: "cache" | "live" | "none";
        };
        if (cancelled) return;
        setRotation(payload.rotation);
        setError(payload.error);
        setApiNotice(payload.apiNotice);
        setSource(payload.source);
      })
      .catch((fetchError) => {
        if (cancelled) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load Eververse rotation.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const showOwnership = signedIn && !inventoryError;
  const hasItems =
    rotation?.categories.some((category) => category.items.length > 0) ?? false;

  return (
    <div className="space-y-4">
      {inventoryError ? (
        <p className="text-xs text-amber-200/80">
          Collection unavailable: {inventoryError}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="sm" label="Loading Bright Dust rotation" />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </p>
      ) : null}

      {!loading && apiNotice ? (
        <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
          {apiNotice}
        </p>
      ) : null}

      {!loading && signedIn && !error && !apiNotice ? (
        <p className="text-xs text-zinc-500">
          {source === "live"
            ? "Live rotation from Tess Everis."
            : "Cached rotation — refreshes at the next daily reset."}
        </p>
      ) : null}

      {!loading && hasItems && rotation ? (
        <EververseCatalog
          rotation={rotation}
          ownedItemHashes={ownedItemHashes}
          showOwnership={showOwnership}
        />
      ) : null}

      {!loading && signedIn && !hasItems && !error ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">
            No Bright Dust items returned for this account right now.
          </p>
        </div>
      ) : null}

      {!signedIn ? (
        <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center">
          <p className="text-sm text-zinc-400">
            Sign in with Bungie to see today&apos;s Bright Dust shop and mark
            what you already own.
          </p>
        </div>
      ) : null}
    </div>
  );
}
