"use client";

import { useCallback, useEffect, useState } from "react";
import { GuardianClassIcon } from "@/components/guardian-class-icon";
import { VAULT_ICON_PATH } from "@/lib/destiny-characters";
import {
  isTransferDestinationDisabled,
  resolveRollTransferDestination,
  transferDestinationLabel,
  TRANSFER_DESTINATIONS,
} from "@/lib/roll-transfer-utils";
import type {
  ProfileCharacter,
  RollItemLocation,
  TransferDestinationId,
} from "@/types/destiny-characters";
import type { GuardianClass } from "@/types/armor-set";

type RollTransferPanelProps = {
  roll: RollItemLocation;
  characters: ProfileCharacter[];
  open: boolean;
  onTransferComplete?: (
    destination: TransferDestinationId,
  ) => void | Promise<void>;
};

type TransferPhase = "idle" | "transferring" | "animating";

const LOCATION_ANIMATION_MS = 350;

function DestinationIcon({
  destination,
  subdued = false,
}: {
  destination: TransferDestinationId;
  subdued?: boolean;
}) {
  const iconClass = subdued ? "opacity-45" : "opacity-95";

  if (destination === "vault") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- local SVG icon
      <img
        src={VAULT_ICON_PATH}
        alt=""
        aria-hidden
        className={`h-6 w-6 object-contain brightness-0 invert ${iconClass}`}
      />
    );
  }

  return (
    <div className={subdued ? "opacity-45" : undefined}>
      <GuardianClassIcon
        guardianClass={destination as GuardianClass}
        size="md"
      />
    </div>
  );
}

function CurrentLocationChevron({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 20 5"
      aria-hidden
      className={`pointer-events-none absolute -top-2 left-1/2 z-10 h-[5px] w-6 -translate-x-1/2 text-zinc-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-opacity duration-300 motion-reduce:transition-none ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <path d="M0 0 L10 5 L20 0 Z" fill="currentColor" />
    </svg>
  );
}

export function RollTransferPanel({
  roll,
  characters,
  open,
  onTransferComplete,
}: RollTransferPanelProps) {
  const [transferPhase, setTransferPhase] = useState<TransferPhase>("idle");
  const [highlightedDestination, setHighlightedDestination] =
    useState<TransferDestinationId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentDestination = resolveRollTransferDestination(roll, characters);
  const effectiveCurrent = highlightedDestination ?? currentDestination;

  useEffect(() => {
    if (!open) {
      setTransferPhase("idle");
      setError(null);
      setHighlightedDestination(null);
      return;
    }

    if (transferPhase !== "idle" || !currentDestination) return;
    setHighlightedDestination(currentDestination);
  }, [open, currentDestination, transferPhase]);

  const handleTransfer = useCallback(
    async (destination: TransferDestinationId) => {
      if (
        transferPhase !== "idle" ||
        !currentDestination ||
        isTransferDestinationDisabled(
          destination,
          currentDestination,
          characters,
        )
      ) {
        return;
      }

      const fromDestination = currentDestination;
      setTransferPhase("transferring");
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
        if (!response.ok || payload.error) {
          throw new Error(payload.error ?? "Transfer failed");
        }

        await onTransferComplete?.(destination);
        setHighlightedDestination(destination);
        setTransferPhase("animating");

        window.setTimeout(() => {
          setTransferPhase("idle");
        }, LOCATION_ANIMATION_MS);
      } catch (transferError) {
        setHighlightedDestination(fromDestination);
        setTransferPhase("idle");
        setError(
          transferError instanceof Error
            ? transferError.message
            : "Transfer failed",
        );
      }
    },
    [
      characters,
      currentDestination,
      onTransferComplete,
      roll.itemHash,
      roll.itemInstanceId,
      transferPhase,
    ],
  );

  const isBusy = transferPhase !== "idle";

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className="border-t border-zinc-700/50 px-2 pb-2 pt-2.5">
          <div className="grid grid-cols-4 gap-1.5">
            {TRANSFER_DESTINATIONS.map((destination) => {
              const disabled = isTransferDestinationDisabled(
                destination,
                effectiveCurrent,
                characters,
              );
              const isHighlighted = destination === highlightedDestination;
              const showChevron = isHighlighted;
              const label = transferDestinationLabel(destination);

              return (
                <button
                  key={destination}
                  type="button"
                  disabled={disabled || isBusy}
                  title={
                    isHighlighted
                      ? `${label} (current location)`
                      : disabled
                        ? `${label} (unavailable)`
                        : `Transfer to ${label}`
                  }
                  aria-label={
                    isHighlighted
                      ? `${label}, current location`
                      : `Transfer to ${label}`
                  }
                  aria-current={isHighlighted ? "true" : undefined}
                  aria-busy={transferPhase === "transferring"}
                  onClick={() => handleTransfer(destination)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded border transition-all duration-300 ease-out motion-reduce:transition-none ${
                    isHighlighted
                      ? "cursor-default border-zinc-400/75 bg-zinc-800/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : disabled
                        ? "cursor-not-allowed border-zinc-800/60 bg-zinc-900/15 opacity-35"
                        : "border-zinc-800/70 bg-zinc-900/20 hover:border-zinc-600 hover:bg-zinc-800/50"
                  }`}
                >
                  <CurrentLocationChevron visible={showChevron} />
                  <DestinationIcon
                    destination={destination}
                    subdued={!isHighlighted && !disabled}
                  />
                </button>
              );
            })}
          </div>

          {transferPhase === "transferring" ? (
            <p className="mt-2 text-center text-xs text-zinc-400 animate-pulse motion-reduce:animate-none">
              Transferring…
            </p>
          ) : null}

          {error ? (
            <p className="mt-1.5 text-xs text-red-400">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
