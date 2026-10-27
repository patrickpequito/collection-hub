"use client";

import { useState } from "react";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { VAULT_ICON_PATH } from "@/lib/destiny-characters";
import {
  isTransferDestinationDisabled,
  resolveRollTransferDestination,
  transferDestinationLabel,
} from "@/lib/roll-transfer-utils";
import { GUARDIAN_CLASSES } from "@/lib/armor-sets/constants";
import type {
  ProfileCharacter,
  RollItemLocation,
  TransferDestinationId,
} from "@/types/destiny-characters";

/** Hunter, Titan, Warlock, then Vault — same order as the sketch. */
const DESTINATIONS: TransferDestinationId[] = [...GUARDIAN_CLASSES, "vault"];

/** Current location of a copy as a small icon square (collapsed phone rows). */
export function RollLocationIcon({ roll, characters }: { roll: RollItemLocation; characters: ProfileCharacter[] }) {
  const destination = resolveRollTransferDestination(roll, characters);
  if (!destination) return null;
  return (
    <span
      className="flex size-[1.625rem] shrink-0 items-center justify-center border border-white/[0.18]"
      title={transferDestinationLabel(destination)}
    >
      {destination === "vault" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icon
        <img src={VAULT_ICON_PATH} alt="" aria-hidden className="size-3.5 object-contain brightness-0 invert opacity-80" />
      ) : (
        <span className="flex opacity-80 [&>img]:size-3.5">
          <GuardianClassIcon guardianClass={destination} size="sm" tone="light" />
        </span>
      )}
    </span>
  );
}

/** Width of the inline move cell, shared with the table header. */
export const ROLL_TRANSFER_CELL_CLASS = "w-[8.25rem] shrink-0";

/**
 * Inline move buttons for one copy: the filled square is where it is now,
 * the others move it there. Only existing characters are clickable.
 */
export function RollTransferButtons({
  roll,
  characters,
  onTransferComplete,
  labelled = false,
}: {
  roll: RollItemLocation;
  characters: ProfileCharacter[];
  /** Full-width buttons with the destination name (phones). */
  labelled?: boolean;
  onTransferComplete?: (
    itemInstanceId: string,
    destination: TransferDestinationId,
  ) => void | Promise<void>;
}) {
  const currentDestination = resolveRollTransferDestination(roll, characters);
  const [pending, setPending] = useState<TransferDestinationId | null>(null);
  // Optimistic location, only trusted while the roll still reports where it came from.
  const [moved, setMoved] = useState<{ from: TransferDestinationId | null; to: TransferDestinationId } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = moved && moved.from === currentDestination ? moved.to : currentDestination;
  const equipped = roll.location === "equipped" && shown === currentDestination;

  async function handleTransfer(destination: TransferDestinationId) {
    if (pending || isTransferDestinationDisabled(destination, shown, characters)) return;
    setPending(destination);
    setError(null);
    try {
      const response = await fetch("/api/items/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemInstanceId: roll.itemInstanceId,
          itemHash: roll.itemHash,
          destination,
        }),
      });
      const payload = (await response.json()) as { error: string | null };
      if (!response.ok || payload.error) throw new Error(payload.error ?? "Transfer failed");
      setMoved({ from: currentDestination, to: destination });
      await onTransferComplete?.(roll.itemInstanceId, destination);
    } catch (transferError) {
      setError(transferError instanceof Error ? transferError.message : "Transfer failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={`${labelled ? "w-full" : ROLL_TRANSFER_CELL_CLASS} relative`}>
      <div className="flex gap-1" role="group" aria-label="Move this copy">
        {DESTINATIONS.map((destination) => {
          const here = destination === shown;
          const disabled = !here && isTransferDestinationDisabled(destination, shown, characters);
          const label = transferDestinationLabel(destination);
          const isPending = pending === destination;
          return (
            <button
              key={destination}
              type="button"
              disabled={here || disabled || Boolean(pending)}
              onClick={() => handleTransfer(destination)}
              title={
                here
                  ? `${label}${equipped ? " · equipped" : ""} (current location)`
                  : disabled
                    ? `${label} (no character)`
                    : `Move to ${label}`
              }
              aria-label={here ? `${label}, current location` : `Move to ${label}`}
              aria-current={here ? "true" : undefined}
              aria-busy={isPending}
              className={`relative flex h-[1.875rem] items-center justify-center gap-1.5 border transition ${
                labelled ? "flex-1" : "w-[1.875rem]"
              } ${
                here
                  ? "cursor-default border-bone bg-bone"
                  : disabled
                    ? "cursor-not-allowed border-white/[0.08] opacity-30"
                    : "border-white/25 hover:border-bone/70 hover:bg-white/[0.06]"
              } ${isPending ? "animate-pulse motion-reduce:animate-none" : ""}`}
            >
              {destination === "vault" ? (
                // eslint-disable-next-line @next/next/no-img-element -- local SVG icon
                <img
                  src={VAULT_ICON_PATH}
                  alt=""
                  aria-hidden
                  className={`size-[1.125rem] object-contain brightness-0 ${here ? "opacity-85" : "invert opacity-75"}`}
                />
              ) : (
                <span className={`flex [&>img]:size-[1.125rem] ${here ? "" : "opacity-75"}`}>
                  <GuardianClassIcon guardianClass={destination} size="sm" tone={here ? "dark" : "light"} />
                </span>
              )}
              {labelled ? (
                <span
                  className={`font-display text-[10.5px] uppercase tracking-[0.12em] ${here ? "text-void" : "text-[#c7cad0]"}`}
                >
                  {label}
                </span>
              ) : null}
              {here && equipped ? (
                <span className="absolute -bottom-[3px] left-1/2 h-[3px] w-3 -translate-x-1/2 bg-owned" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="absolute left-0 top-full z-20 mt-1 w-56 border border-red-400/40 bg-[#12161c] px-2 py-1 text-[11px] leading-snug text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
