"use client";

import { useEffect, useState } from "react";
import type { CollectionSummary } from "@/app/api/all-loot/summary/route";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import { useSession } from "@/lib/use-session";

const BLOCKS: { key: keyof CollectionSummary; label: string; gold?: boolean }[] = [
  { key: "collection", label: "Collection", gold: true },
  { key: "weapons", label: "Weapons" },
  { key: "armor", label: "Armor" },
  { key: "cosmetics", label: "Cosmetics" },
];

/** Loot Collector header: owned / total for the catalog and by category. */
export function CollectionSummaryBlocks() {
  const session = useSession();
  const [state, setState] = useState<{ key: string; summary: CollectionSummary } | null>(null);
  const key = session.signedIn ? (session.membershipId ?? "signed-in") : "signed-out";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/all-loot/summary", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { summary: CollectionSummary }) => {
        if (!cancelled) setState({ key, summary: payload.summary });
      })
      .catch(() => {
        // Blocks simply stay empty.
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const summary = state?.key === key ? state.summary : null;

  return (
    <StatBlockGrid count={4}>
      {BLOCKS.map((block) => {
        const entry = summary?.[block.key];
        return (
          <StatBlock key={block.key} label={block.label}>
            {entry ? (
              <StatCount owned={entry.owned} total={entry.total} gold={block.gold} />
            ) : (
              <span className="font-display text-[30px] leading-none text-ash">—</span>
            )}
          </StatBlock>
        );
      })}
    </StatBlockGrid>
  );
}
