"use client";

import { SectionHeading } from "@/components/detail-page-parts";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  activeFilterChips,
  AllLootFilterSidebar,
  buildAllLootSearchParams,
  emptyAllLootFilterState,
  hasAnyFilters,
  type AllLootFilterState,
} from "@/components/all-loot-filters";
import {
  AllLootGridCard,
  AllLootResultsHeader,
  AllLootRow,
  isItemOwned,
} from "@/components/all-loot-row";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useOwnedItemHashes } from "@/lib/use-owned-item-hashes";
import { useSignedIn } from "@/lib/use-signed-in";
import type { AllLootFacets, AllLootItem } from "@/types/all-loot";

type SearchResponse = {
  items: AllLootItem[];
  total: number;
  page: number;
  hasMore: boolean;
  error: string | null;
};

type ViewMode = "list" | "grid";
const VIEW_STORAGE_KEY = "d2-collector:loot-view:v1";
/** Wait this long after the last change before searching. */
const SEARCH_DELAY_MS = 350;

/** One-click presets that fill the filters. All need the signed-in collection. */
const QUICK_SEARCHES: {
  id: string;
  label: string;
  description: string;
  filters: Partial<AllLootFilterState>;
}[] = [
  {
    id: "missing-exotics",
    label: "Missing exotics",
    description: "Exotic weapons and armor you don't own yet",
    filters: { rarities: ["Exotic"], types: ["Weapon", "Armor"], collected: "no" },
  },
  {
    id: "obtainable-missing",
    label: "Obtainable, not collected",
    description: "Everything you can still earn in the game",
    filters: { obtainable: "yes", collected: "no" },
  },
  {
    id: "raid-dungeon",
    label: "Missing raid & dungeon loot",
    description: "Weapons and armor from raids and dungeons",
    filters: { sources: ["raid", "dungeon"], types: ["Weapon", "Armor"], collected: "no" },
  },
  {
    id: "monument",
    label: "Missing Monument of Triumph loot",
    description: "What's left from the latest content",
    filters: { seasons: ["Monument of Triumph"], collected: "no" },
  },
];

function readStoredView(): ViewMode {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

const TOGGLE_CLASS =
  "inline-flex h-11 items-center border px-4 font-display text-sm uppercase tracking-[0.12em] transition";

export function AllLootPageContent() {
  const signedIn = useSignedIn();
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
  const [filters, setFilters] = useState<AllLootFilterState>(emptyAllLootFilterState);
  const [view, setView] = useState<ViewMode>("list");
  const [results, setResults] = useState<AllLootItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchedFilters, setSearchedFilters] = useState<AllLootFilterState | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  // Remembered list / grid choice (per browser).
  useEffect(() => {
    void Promise.resolve().then(() => setView(readStoredView()));
  }, []);
  const changeView = (next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice lasts for this visit only.
    }
  };

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
        setFacetsError(error instanceof Error ? error.message : "Failed to load filters");
      });
  }, []);

  const fetchPage = useCallback(
    async (nextFilters: AllLootFilterState, nextPage: number): Promise<SearchResponse> => {
      const response =
        nextFilters.collected !== "all"
          ? await fetch("/api/all-loot/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filters: nextFilters,
                page: nextPage,
                ownedItemHashes: itemHashes,
              }),
            })
          : await fetch(
              `/api/all-loot/search?${buildAllLootSearchParams(nextFilters, nextPage).toString()}`,
            );
      if (response.status === 429) {
        throw new Error("Too many searches in a short time. Wait a few seconds and try again.");
      }
      const payload = (await response.json().catch(() => null)) as SearchResponse | null;
      if (!response.ok || !payload || payload.error) {
        throw new Error(payload?.error ?? "Search failed. Try again in a moment.");
      }
      return payload;
    },
    [itemHashes],
  );

  // Search as you type / pick filters, after a short pause.
  const needsCollection = filters.collected !== "all";
  const waitingForCollection = needsCollection && !ownershipFilterEnabled;
  useEffect(() => {
    if (!hasAnyFilters(filters) || waitingForCollection) return;
    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setSearching(true);
      fetchPage(filters, 1)
        .then((payload) => {
          if (requestId !== requestIdRef.current) return;
          setResults(payload.items);
          setTotal(payload.total);
          setPage(payload.page);
          setHasMore(payload.hasMore);
          setSearchError(null);
          setSearchedFilters(filters);
        })
        .catch((error) => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setTotal(0);
          setHasMore(false);
          setSearchError(error instanceof Error ? error.message : "Search failed");
          setSearchedFilters(filters);
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setSearching(false);
        });
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [fetchPage, filters, waitingForCollection]);

  const isEmpty = !hasAnyFilters(filters);
  const shownFilters = isEmpty ? null : searchedFilters;

  // A search started from the global navigation (/all-loot?q=…).
  const urlQuery = useSearchParams().get("q")?.trim() ?? "";
  useEffect(() => {
    if (!urlQuery) return;
    void Promise.resolve().then(() =>
      setFilters({ ...emptyAllLootFilterState(), query: urlQuery }),
    );
  }, [urlQuery]);

  const loadMore = useCallback(async () => {
    if (!searchedFilters || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const requestId = requestIdRef.current;
    try {
      const payload = await fetchPage(searchedFilters, page + 1);
      if (requestId !== requestIdRef.current) return;
      setResults((current) => [...current, ...payload.items]);
      setPage(payload.page);
      setHasMore(payload.hasMore);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Failed to load more items");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, page, searchedFilters]);

  useEffect(() => {
    if (!shownFilters || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, results.length, shownFilters]);

  const chips = activeFilterChips(filters);
  const applyQuickSearch = (preset: Partial<AllLootFilterState>) =>
    setFilters({ ...emptyAllLootFilterState(), ...preset });

  return (
    <div className="space-y-9">
      <section className="space-y-3">
        <SectionHeading title="Quick searches" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_SEARCHES.map((quick) => (
            <button
              key={quick.id}
              type="button"
              disabled={!ownershipFilterEnabled}
              onClick={() => applyQuickSearch(quick.filters)}
              className="ui-panel flex flex-col gap-1 p-3.5 text-left transition hover:border-bone disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-hairline"
            >
              <span className="text-sm font-medium text-bone">{quick.label}</span>
              <span className="hidden text-xs text-ash sm:block">
                {ownershipFilterEnabled
                  ? quick.description
                  : signedIn
                    ? "Loading your collection…"
                    : "Sign in to use"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Search the catalog"
          note={shownFilters && !searching ? `${total.toLocaleString()} result${total === 1 ? "" : "s"}` : undefined}
        />

        {inventoryError ? (
          <p className="text-xs text-amber-200/80">Collection unavailable: {inventoryError}</p>
        ) : !signedIn ? (
          <p className="text-xs text-amber-200/80">
            Sign in with Bungie to highlight items you already own.
          </p>
        ) : null}
        {facetsError ? <p className="text-sm text-amber-100">{facetsError}</p> : null}

        <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <AllLootFilterSidebar
            facets={facets}
            filters={filters}
            onFiltersChange={setFilters}
            ownershipFilterEnabled={ownershipFilterEnabled}
          />

          <div className="min-w-0 space-y-3">
            <div className="flex gap-2">
              <input
                type="search"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                placeholder="Search name, type, source…"
                aria-label="Search the catalog"
                className="h-11 min-w-0 flex-1 border border-white/30 bg-transparent px-3.5 text-[15px] text-bone placeholder:text-ash focus:border-bone focus:outline-none"
              />
              <div className="flex" role="group" aria-label="View">
                {(["list", "grid"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={view === mode}
                    onClick={() => changeView(mode)}
                    className={`${TOGGLE_CLASS} ${
                      view === mode
                        ? "border-bone text-bone"
                        : "border-white/[0.22] text-bone/60 hover:text-bone"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {chips.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="ui-label">Active</span>
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setFilters(chip.clear(filters))}
                    className="inline-flex h-7 items-center gap-1.5 border border-white/[0.22] px-2.5 font-display text-xs uppercase tracking-[0.1em] text-bone/85 transition hover:border-bone hover:text-bone"
                    aria-label={`Remove ${chip.label}`}
                  >
                    {chip.label}
                    <span aria-hidden>✕</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilters(emptyAllLootFilterState())}
                  className="ml-1 text-xs text-ash underline-offset-2 transition hover:text-bone hover:underline"
                >
                  Clear all
                </button>
              </div>
            ) : null}

            {isEmpty ? (
              <p className="border border-dashed border-white/[0.14] px-6 py-10 text-center text-sm text-ash">
                Type a name, pick a filter or start from a quick search.
              </p>
            ) : waitingForCollection ? (
              <p className="py-8 text-center text-sm text-ash">
                {signedIn ? "Loading your collection…" : "Sign in with Bungie to filter by collection."}
              </p>
            ) : searching && !shownFilters ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="sm" label="Searching Loot Collector" />
              </div>
            ) : shownFilters ? (
              <div className={`space-y-2 transition-opacity ${searching ? "opacity-60" : ""}`}>
                {searchError ? <p className="text-sm text-amber-100">{searchError}</p> : null}
                {results.length === 0 && !searchError ? (
                  <p className="border border-dashed border-white/[0.14] px-6 py-10 text-center text-sm text-ash">
                    No items matched your search.
                  </p>
                ) : results.length === 0 ? null : view === "list" ? (
                  <div>
                    <AllLootResultsHeader />
                    {results.map((item) => (
                      <AllLootRow
                        key={item.itemHash}
                        item={item}
                        owned={isItemOwned(item, ownedSet)}
                        showOwnership={showOwnership}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map((item) => (
                      <AllLootGridCard
                        key={item.itemHash}
                        item={item}
                        owned={isItemOwned(item, ownedSet)}
                        showOwnership={showOwnership}
                      />
                    ))}
                  </div>
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
        </div>
      </section>
    </div>
  );
}
