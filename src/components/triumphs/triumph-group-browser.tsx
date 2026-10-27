"use client";

import { useEffect, useMemo, useState } from "react";
import { StatBlock, StatBlockGrid, StatCount } from "@/components/detail-page-parts";
import {
  useProfileRecordInstances,
  useProfileStringVariables,
} from "@/components/profile-progress-provider";
import { TriumphTile, triumphTileState } from "@/components/triumph-tile";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { countTriumphProgress } from "@/lib/triumphs/record-progress";
import { collectLeafSections, leafSectionId, type TriumphLeafSection } from "@/lib/triumphs/sections";
import { useSignedIn } from "@/lib/use-signed-in";
import type { TriumphGroup, TriumphRecord } from "@/types/triumph";

type Filter = "all" | "open" | "done";

type Leaf = TriumphLeafSection & { id: string };

/** Group page: subcategories with progress on the left (like in game), the selected one's triumphs on the right. */
export function TriumphGroupBrowser({ group }: { group: TriumphGroup }) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const stringVariables = useProfileStringVariables();
  const instanceMap = useMemo(
    () => new Map(Object.entries(signedIn ? instances : {})),
    [instances, signedIn],
  );

  const tree = useMemo(
    () =>
      group.sections.map((section) => ({
        section,
        leaves: collectLeafSections([section]).map<Leaf>((leaf) => ({
          ...leaf,
          id: leafSectionId(section.name, leaf.name),
        })),
      })),
    [group.sections],
  );
  const leaves = tree.flatMap((entry) => entry.leaves);
  const [selectedId, setSelectedId] = useState(leaves[0]?.id ?? "");
  const [filter, setFilter] = useState<Filter>("all");

  // Deep links: /triumphs/group/legends#raids-vault-of-glass
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (fromHash && leaves.some((leaf) => leaf.id === fromHash)) {
      queueMicrotask(() => setSelectedId(fromHash));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const selected = leaves.find((leaf) => leaf.id === selectedId) ?? leaves[0];
  const stateOf = (record: TriumphRecord) =>
    triumphTileState(record, instances[record.recordHash], { showProgress: signedIn, strictCompletion: false });

  const allProgress = countTriumphProgress(group.records, instanceMap);
  const scoreTotal = group.records.reduce((sum, record) => sum + (record.score ?? 0), 0);
  const scoreEarned = signedIn
    ? group.records.filter((record) => stateOf(record) === "complete").reduce((sum, record) => sum + record.score, 0)
    : null;
  const readyToClaim = signedIn ? group.records.filter((record) => stateOf(record) === "claim").length : null;

  const records = selected?.records ?? [];
  const selectedProgress = countTriumphProgress(records, instanceMap);
  const visible = records.filter((record) => {
    if (filter === "all" || !signedIn) return true;
    const done = stateOf(record) !== "open";
    return filter === "done" ? done : !done;
  });

  const nav = (
    <nav aria-label={`${group.name} categories`} className="ui-panel py-2">
      {tree.map(({ section, leaves: sectionLeaves }) => (
        <div key={section.presentationNodeHash}>
          <div className="flex items-center gap-2.5 px-4 pb-1.5 pt-3">
            {section.iconPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bungieIconUrl(section.iconPath)} alt="" width={22} height={22} className="size-[22px]" />
            ) : null}
            <span className="ui-label text-bone!">{section.name}</span>
          </div>
          {sectionLeaves.map((leaf) => {
            const progress = countTriumphProgress(leaf.records, instanceMap);
            const complete = signedIn && progress.total > 0 && progress.completed === progress.total;
            const isSelected = leaf.id === selected?.id;
            return (
              <button
                key={leaf.id}
                type="button"
                onClick={() => select(leaf.id)}
                aria-current={isSelected ? "true" : undefined}
                className={`grid w-full grid-cols-[minmax(0,1fr)_46px] items-center gap-x-2 gap-y-1 py-1.5 pl-12 pr-4 text-left transition ${
                  isSelected ? "bg-white/[0.06] shadow-[inset_3px_0_0_0_#e9e7e2]" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className={`truncate text-sm ${isSelected ? "text-white" : "text-[#c7cad0]"}`}>
                  {leaf.name === section.name ? "All" : leaf.name}
                </span>
                <span className={`text-right text-xs tabular-nums ${complete ? "text-owned" : "text-[#c7cad0]"}`}>
                  {signedIn ? `${progress.completed}/${progress.total}` : progress.total}
                </span>
                {signedIn ? (
                  <span className="col-span-2 block h-0.5 bg-white/10">
                    <span
                      className={`block h-full ${complete ? "bg-owned" : "bg-ash"}`}
                      style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }}
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="space-y-6">
      <StatBlockGrid count={3}>
        <StatBlock label="Completed">
          <StatCount owned={signedIn ? allProgress.completed : null} total={allProgress.total} gold />
        </StatBlock>
        <StatBlock label="Score">
          <StatCount owned={scoreEarned} total={scoreTotal} />
        </StatBlock>
        <StatBlock label="Ready to claim">
          <span className="font-display text-[22px] leading-none sm:text-[30px] text-bone">{readyToClaim ?? "—"}</span>
        </StatBlock>
      </StatBlockGrid>

      {!signedIn ? <p className="text-[13px] text-owned">Sign in to see your triumph progress.</p> : null}

      <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
        <div className="hidden lg:sticky lg:top-20 lg:block">{nav}</div>
        <label className="lg:hidden">
          <span className="ui-label mb-1.5 block">Category</span>
          <select
            value={selected?.id}
            onChange={(event) => select(event.target.value)}
            className="w-full border border-white/[0.22] bg-panel px-3 py-2.5 text-sm text-bone"
          >
            {tree.map(({ section, leaves: sectionLeaves }) => (
              <optgroup key={section.presentationNodeHash} label={section.name}>
                {sectionLeaves.map((leaf) => (
                  <option key={leaf.id} value={leaf.id}>
                    {leaf.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <section className="min-w-0 space-y-3.5">
          <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.14] pb-2.5">
            <h2 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">
              {selected?.name}
            </h2>
            <span className="ui-label">
              {signedIn ? `${selectedProgress.completed} / ${selectedProgress.total}` : `${selectedProgress.total} triumphs`}
            </span>
          </div>
          {signedIn ? (
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", "All"],
                  ["open", "Incomplete"],
                  ["done", "Completed"],
                ] as [Filter, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                  className={`inline-flex min-h-[38px] items-center border px-3.5 font-display text-sm uppercase tracking-[0.12em] transition ${
                    filter === id ? "border-bone bg-bone text-void" : "border-white/[0.22] text-[#c7cad0] hover:border-bone/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          {visible.length ? (
            <div className="grid gap-2.5 md:grid-cols-2">
              {visible.map((record) => (
                <TriumphTile
                  key={record.recordHash}
                  record={record}
                  instance={signedIn ? instances[record.recordHash] : undefined}
                  showProgress={signedIn}
                  stringVariables={stringVariables}
                />
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
              Nothing to show with this filter.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
