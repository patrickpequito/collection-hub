"use client";

import { useMemo, useState } from "react";
import {
  useProfileRecordInstances,
  useProfileStringVariables,
} from "@/components/profile-progress-provider";
import { TriumphTile, triumphTileState } from "@/components/triumph-tile";
import { bungieIconUrl } from "@/lib/bungie-icon";
import type { SealSummary } from "@/lib/triumphs/hub";
import { splitTitleRecords } from "@/lib/triumphs/record-progress";
import { sealProgress } from "@/lib/triumphs/seal-progress";
import { MAX_PINNED_TITLES, usePinnedTitles } from "@/lib/use-pinned-titles";
import { useSignedIn } from "@/lib/use-signed-in";
import { PinIcon } from "@/components/pin-icon";
import type { TitleEntry, TriumphProgress } from "@/types/triumph";

function ProgressLine({ label, progress, show }: { label: string; progress: TriumphProgress; show: boolean }) {
  const done = show && progress.total > 0 && progress.completed === progress.total;
  return (
    <div>
      <div className="ui-label flex justify-between text-xs!">
        <span>{label}</span>
        <span className={done ? "text-owned" : "text-bone"}>
          {show ? progress.completed : "—"} / {progress.total}
        </span>
      </div>
      <span className="mt-1.5 block h-1 bg-white/[0.12]">
        <span
          className={`block h-full ${done ? "bg-owned" : "bg-bone"}`}
          style={{ width: show && progress.total ? `${(progress.completed / progress.total) * 100}%` : "0%" }}
        />
      </span>
    </div>
  );
}

/** Seal page: seal + title + progress fixed on the left, its triumphs on the right. */
export function SealDetail({ title, seal }: { title: TitleEntry; seal: SealSummary }) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const stringVariables = useProfileStringVariables();
  const [tab, setTab] = useState<"base" | "gilding">("base");
  const [hideCompleted, setHideCompleted] = useState(false);
  const pinned = usePinnedTitles();
  const isPinned = pinned.isPinned(title.slug);
  const replaces = !isPinned && pinned.pins.length >= MAX_PINNED_TITLES ? pinned.pins[0] : null;

  const { baseRecords, gildingRecords } = splitTitleRecords(title.records);
  const progress = useMemo(() => sealProgress(seal, signedIn ? instances : {}), [instances, seal, signedIn]);
  const earned = signedIn && progress.tier !== "none";
  const records = tab === "gilding" ? gildingRecords : baseRecords;
  const visible = hideCompleted
    ? records.filter(
        (record) =>
          triumphTileState(record, instances[record.recordHash], {
            showProgress: signedIn,
            strictCompletion: true,
          }) === "open",
      )
    : records;
  const totalScore = title.records.reduce((sum, record) => sum + (record.score ?? 0), 0);

  return (
    <div className="grid gap-7 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
      <aside
        className={`ui-panel flex flex-col items-center gap-3.5 px-5 py-6 text-center lg:sticky lg:top-20 ${
          earned
            ? "border-owned/45! bg-[radial-gradient(circle_at_50%_28%,rgba(201,162,39,0.16),rgba(18,22,28,0.92)_60%)]!"
            : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bungieIconUrl(title.iconPath)}
          alt=""
          width={200}
          height={200}
          className={`size-[200px] object-contain drop-shadow-[0_6px_24px_rgba(0,0,0,0.6)] ${
            signedIn && !earned ? "opacity-70 grayscale" : ""
          } ${title.isLegacy ? "brightness-[1.6] grayscale" : ""}`}
        />
        <span className="ui-label">Title</span>
        <span
          className={`-mt-2 font-display text-[40px] font-semibold uppercase leading-none tracking-[0.14em] ${
            earned ? "text-owned" : "text-bone"
          }`}
        >
          {title.guardianTitle ?? title.name}
        </span>
        {signedIn ? (
          <span
            className={`border px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.14em] ${
              earned ? "border-owned text-owned" : "border-white/30 text-[#c7cad0]"
            }`}
          >
            {progress.tier === "gilded"
              ? `Gilded${progress.gildCount > 1 ? ` ×${progress.gildCount}` : ""}`
              : earned
                ? "Title unlocked"
                : "Not earned yet"}
          </span>
        ) : null}
        {title.description ? <p className="text-sm leading-normal text-ash">{title.description}</p> : null}

        {!title.isLegacy ? (
          signedIn ? (
            <div className="w-full space-y-1.5">
              <button
                type="button"
                aria-pressed={isPinned}
                disabled={!pinned.ready}
                onClick={() => pinned.togglePin(title.slug)}
                title={replaces ? `Replaces your oldest pin (${replaces})` : undefined}
                className={`flex min-h-10 w-full items-center justify-center gap-2 border font-display text-sm uppercase tracking-[0.14em] transition disabled:opacity-50 ${
                  isPinned
                    ? "border-owned bg-owned/[0.12] text-owned hover:bg-owned/20"
                    : "border-white/25 text-[#c7cad0] hover:border-bone/70 hover:text-bone"
                }`}
              >
                <PinIcon />
                {isPinned ? "Pinned" : "Pin title"}
              </button>
              <p className="text-xs text-ash">
                {isPinned
                  ? "Shown first on Home. Click again to unpin."
                  : replaces
                    ? `You have ${MAX_PINNED_TITLES} pins — this replaces the oldest.`
                    : "Pinned titles show first on Home."}
              </p>
              {pinned.error ? <p className="text-xs text-red-400">{pinned.error}</p> : null}
            </div>
          ) : (
            <p className="text-xs text-owned">Sign in to pin this title to Home.</p>
          )
        ) : null}

        <div className="mt-1 flex w-full flex-col gap-3 text-left">
          <ProgressLine label="Title triumphs" progress={progress.base} show={signedIn} />
          {progress.gildable ? (
            <ProgressLine label="Gilding" progress={progress.gilding} show={signedIn} />
          ) : (
            <p className="text-xs leading-normal text-ash">
              {title.isLegacy
                ? "Legacy seal — no longer obtainable."
                : "This seal can't be gilded."}
            </p>
          )}
        </div>

        <div className="grid w-full grid-cols-2 gap-2.5 border-t border-white/[0.12] pt-3.5 text-left">
          <div>
            <span className="ui-label text-[11px]!">Score</span>
            <div className="font-display text-2xl leading-tight text-bone">{totalScore.toLocaleString("en-US")}</div>
          </div>
          <div>
            <span className="ui-label text-[11px]!">Triumphs</span>
            <div className="font-display text-2xl leading-tight text-bone">{title.records.length}</div>
          </div>
        </div>
      </aside>

      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex border border-white/[0.22]">
            {(
              [
                ["base", `Title triumphs · ${baseRecords.length}`],
                ...(gildingRecords.length ? [["gilding", `Gilding · ${gildingRecords.length}`]] : []),
              ] as ["base" | "gilding", string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
                className={`px-5 py-2.5 font-display text-[15px] uppercase tracking-[0.14em] transition ${
                  tab === id ? "bg-bone text-void" : "text-ash hover:text-bone"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {signedIn ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={hideCompleted}
              onClick={() => setHideCompleted((value) => !value)}
              className="group flex items-center gap-2.5 font-display text-sm uppercase tracking-[0.12em] text-[#c7cad0] transition hover:text-bone"
            >
              <span
                aria-hidden
                className={`size-4 border transition ${
                  hideCompleted
                    ? "border-owned bg-owned bg-clip-content p-[3px]"
                    : "border-white/45 bg-[#1d2026] group-hover:border-bone/70"
                }`}
              />
              Hide completed
            </button>
          ) : (
            <span className="text-[13px] text-owned">Sign in to see your progress.</span>
          )}
        </div>

        {visible.length ? (
          <div className="grid gap-2.5 md:grid-cols-2">
            {visible.map((record) => (
              <TriumphTile
                key={record.recordHash}
                record={record}
                instance={signedIn ? instances[record.recordHash] : undefined}
                showProgress={signedIn}
                strictCompletion
                stringVariables={stringVariables}
              />
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-white/[0.14] px-4 py-3.5 text-[13px] text-ash">
            Everything here is complete.
          </p>
        )}
      </section>
    </div>
  );
}
