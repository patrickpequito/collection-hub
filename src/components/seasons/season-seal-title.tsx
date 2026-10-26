"use client";

import { useProfileRecordInstances } from "@/components/profile-progress-provider";
import { useSignedIn } from "@/lib/use-signed-in";
import { isRecordObjectivesMet, isRecordRedeemed } from "@/lib/triumphs/record-progress";
import { TITLE_BORDER_CLASSES, TITLE_FILL_CLASSES } from "@/lib/triumphs/title-styles";

/** Season seal title box — highlighted once the seal is earned. */
export function SeasonSealTitle({
  title,
  completionRecordHash,
}: {
  title: string;
  completionRecordHash: string;
}) {
  const signedIn = useSignedIn();
  const instances = useProfileRecordInstances();
  const state = signedIn ? instances[completionRecordHash]?.state : undefined;
  const earned = isRecordRedeemed(state) || isRecordObjectivesMet(state);
  const tier = earned ? "base" : "none";

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 border px-3 py-2 text-sm font-semibold tracking-wide text-zinc-100 ${TITLE_BORDER_CLASSES[tier]} ${TITLE_FILL_CLASSES[tier]}`}
    >
      <span>{title}</span>
      {earned ? (
        <span className="font-display text-[11px] font-normal uppercase tracking-[0.16em] text-bone/80">
          Earned
        </span>
      ) : null}
    </div>
  );
}
