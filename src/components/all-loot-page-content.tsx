"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AllLootFiltersPanel,
  buildAllLootSearchParams,
  emptyAllLootFilterState,
  type AllLootFilterState,
} from "@/components/all-loot-filters";
import { AllLootCollectionBanners } from "@/components/all-loot-collection-banners";
import { AllLootResultsHeader, AllLootRow, isItemOwned } from "@/components/all-loot-row";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import { useSignedIn } from "@/lib/use-signed-in";
import type { AllLootFacets, AllLootItem } from "@/types/all-loot";

type AllLootPageContentProps = {
  signedIn?: boolean;
};

type SearchResponse = {
  items: AllLootItem[];
  total: number;
  page: number;
  hasMore: boolean;
  error: string | null;
};

export function AllLootPageContent({
  signedIn: signedInProp,
}: AllLootPageContentProps) {
  const signedInHook = useSignedIn();
  const signedIn = signedInProp ?? signedInHook;
  const {
    itemHashes,
    loading: inventoryLoading,
    error: inventoryError,
  } = useOwnedItemHashes(signedIn);
  const ownedSet = useMemo(() => new Set(itemHashes), [itemHashes]);
  const showOwnership = signedIn && !inventoryError;
  const ownershipFilterEnabled = showOwnership && !inventoryLoading;

  const [facets, setFacets] = useState<AllLootFacets | null>(null);
  const [facetsError, setFacetsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AllLootFilterState>(
    emptyAllLootFilterState,
  );
  const [activeFilters, setActiveFilters] = useState<AllLootFilterState | null>(
    null,
  );
  const [results, setResults] = useState<AllLootItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    fetch("/api/all-loot/facets")
      .then(async (response) => {
        const payload = (await response.json()) as {
          facets: AllLootFacets | null;
          error?: string | null;
        };
        if (!response.ok || !payload.facets) {
          throw new Error(payload.error ?? "Failed to load filters");
        }
        setFacets(payload.facets);
      })
      .catch((error) => {
        setFacetsError(
          error instanceof Error ? error.message : "Failed to load filters",
        );
      });
  }, []);

  const fetchPage = useCallback(
    async (nextFilters: AllLootFilterState, nextPage: number, append: boolean) => {
      const useOwnershipFilter = nextFilters.collected !== "all";
      let response: Response;

      if (useOwnershipFilter) {
        response = await fetch("/api/all-loot/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: nextFilters,
            page: nextPage,
            ownedItemHashes: itemHashes,
          }),
        });
      } else {
        const params = buildAllLootSearchParams(nextFilters, nextPage);
        response = await fetch(`/api/all-loot/search?${params.toString()}`);
      }

      const payload = (await response.json()) as SearchResponse;

      if (!response.ok || payload.error) {
        throw new Error(payload.error ?? "Search failed");
      }

      setResults((current) =>
        append ? [...current, ...payload.items] : payload.items,
      );
      setTotal(payload.total);
      setPage(payload.page);
      setHasMore(payload.hasMore);
      setSearchError(null);
    },
    [itemHashes],
  );

  const runSearch = useCallback(async () => {
    if (filters.collected !== "all" && !ownershipFilterEnabled) {
      setSearchError(
        inventoryLoading
          ? "Still loading your collection. Try again in a moment."
          : "Sign in with Bungie to filter by collection.",
      );
      return;
    }

    setSearching(true);
    setHasSearched(true);
    setActiveFilters(filters);

    try {
      await fetchPage(filters, 1, false);
    } catch (error) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      setSearchError(
        error instanceof Error ? error.message : "Search failed",
      );
    } finally {
      setSearching(false);
    }
  }, [fetchPage, filters, inventoryLoading, ownershipFilterEnabled]);

  const loadMore = useCallback(async () => {
    if (!activeFilters || !hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      await fetchPage(activeFilters, page + 1, true);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Failed to load more items",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [activeFilters, fetchPage, hasMore, page]);

  useEffect(() => {
    if (!hasSearched || !hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, hasSearched, loadMore, results.length]);

  return (
    <div className="space-y-4">
      {inventoryError ? (
        <p className="text-xs text-amber-200/80">
          Collection unavailable: {inventoryError}
        </p>
      ) : showOwnership ? (
        <p className="text-xs text-zinc-500">
          Gold ring = in your collection. Dimmed icons = not owned yet.
        </p>
      ) : !signedIn ? (
        <p className="text-xs text-amber-200/80">
          Sign in with Bungie to highlight items you already own.
        </p>
      ) : null}

      {facetsError ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {facetsError}
        </p>
      ) : null}

      <AllLootCollectionBanners />

      <AllLootFiltersPanel
        facets={facets}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={() => void runSearch()}
        searching={searching}
        ownershipFilterEnabled={ownershipFilterEnabled}
      />

      {!hasSearched ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Set filters and press Search to browse the catalog.
        </p>
      ) : null}

      {searching ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="sm" label="Searching Loot Collector" />
        </div>
      ) : null}

      {hasSearched && !searching ? (
        <div className="space-y-2">
          <p className="text-sm text-zinc-400">
            {total.toLocaleString()} item{total === 1 ? "" : "s"} found
          </p>

          {searchError ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              {searchError}
            </p>
          ) : null}

          {results.length === 0 && !searchError ? (
            <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-10 text-center">
              <p className="text-sm text-zinc-400">
                No items matched your search.
              </p>
            </div>
          ) : (
            <>
              <AllLootResultsHeader />
              <div>
                {results.map((item) => (
                  <AllLootRow
                    key={item.itemHash}
                    item={item}
                    owned={isItemOwned(item, ownedSet)}
                    showOwnership={showOwnership}
                  />
                ))}
              </div>
            </>
          )}

          {loadingMore ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="sm" label="Loading more items" />
            </div>
          ) : null}

          <div ref={sentinelRef} className="h-1" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
