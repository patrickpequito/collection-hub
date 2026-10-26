"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useOwnership } from "@/components/client-ownership";
import { ProgressBar } from "@/components/home/progress-bar";
import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { countOwnedGroups } from "@/lib/expansions/expansion-progress";
import type { SealSummary } from "@/lib/triumphs/hub";
import { sealProgress } from "@/lib/triumphs/seal-progress";
import { useSignedIn } from "@/lib/use-signed-in";

function ProgressItem({ label, owned, total }: { label: string; owned: number; total: number }) {
  return (
    <div className="min-w-0">
      <span className="ui-label text-on-art text-[10.5px]!">{label}</span>
      <span className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <ProgressBar owned={owned} total={total} />
        <span className="text-on-art text-xs tabular-nums text-[#c7cad0]">
          {owned} / {total}
        </span>
      </span>
    </div>
  );
}

/** Armor, Monument rewards and Immortal seal progress on the Spotlight card (signed in). */
export function MonumentSpotlightProgress({
  armorGroups,
  rewardGroups,
  seal,
}: {
  armorGroups: string[][];
  rewardGroups: string[][];
  seal: SealSummary | null;
}) {
  const signedIn = useSignedIn();
  const { ownedItemHashes, showOwnership } = useOwnership();
  const instances = useProfileRecordInstances();
  if (!signedIn || !showOwnership) return null;
  const sealBase = seal ? sealProgress(seal, instances).base : null;
  return (
    <div className="relative mt-2 grid max-w-[520px] grid-cols-3 gap-4">
      <ProgressItem label="Armor" owned={countOwnedGroups(armorGroups, ownedItemHashes)} total={armorGroups.length} />
      <ProgressItem
        label="Monument rewards"
        owned={countOwnedGroups(rewardGroups, ownedItemHashes)}
        total={rewardGroups.length}
      />
      {seal && sealBase ? <ProgressItem label={`${seal.guardianTitle} seal`} owned={sealBase.completed} total={sealBase.total} /> : null}
    </div>
  );
}

const SUGGESTIONS = [
  { label: "Exotics", query: "exotic" },
  { label: "Adept", query: "adept" },
  { label: "Renegades", query: "renegades" },
  { label: "Shaders", query: "shader" },
];

/** "Search loot" box: goes to the Loot Collector with the query. */
export function HomeSearchLoot() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const go = (value: string) => {
    const trimmed = value.trim();
    router.push(trimmed ? `/all-loot?q=${encodeURIComponent(trimmed)}` : "/all-loot");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    go(query);
  };
  return (
    <div className="ui-panel flex flex-col justify-center gap-2.5 px-4 pb-3.5 pt-3 sm:px-[18px]">
      <h3 className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-bone">Search loot</h3>
      <form role="search" onSubmit={submit} className="flex">
        <label htmlFor="home-search-loot" className="sr-only">
          Search the loot catalog
        </label>
        <input
          id="home-search-loot"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Weapon, armor, shader, emote…"
          className="h-11 min-w-0 flex-1 border border-white/25 border-r-0 bg-void/85 px-3 text-[15px] text-bone placeholder:text-ash focus:border-bone focus:outline-none"
        />
        <button
          type="submit"
          className="h-11 shrink-0 bg-bone px-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-void transition hover:bg-white"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => go(suggestion.query)}
            className="inline-flex min-h-[26px] items-center border border-white/[0.22] px-2.5 font-display text-[11.5px] uppercase tracking-[0.12em] text-[#c7cad0] transition hover:border-bone hover:text-white"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}
