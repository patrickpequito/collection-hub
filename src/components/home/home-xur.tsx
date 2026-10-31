"use client";

import { useEffect, useState } from "react";
import { useSignedIn } from "@/lib/use-signed-in";
import type { XurArmor, XurClass, XurData, XurGear, XurItem } from "@/lib/xur";

/** Xûr portrait (left part of an in-game screenshot; Bungie's own vendor art is only 525×150). */
const XUR_ART = "/images/xur/xur.webp";

const CLASS_ICON: Record<XurClass, string> = {
  Titan: "/icons/d2/class_titan.svg",
  Hunter: "/icons/d2/class_hunter.svg",
  Warlock: "/icons/d2/class_warlock.svg",
};
/** Titan and Hunter symbols read larger than Warlock's at the same box size. */
const CLASS_ICON_SIZE: Record<XurClass, string> = { Titan: "size-2.5", Hunter: "size-2.5", Warlock: "size-3" };

const GOLD_BORDER = "border-[rgba(232,200,96,0.45)]";
const EXOTIC_ICON = "box-border block border-2 border-[#ceae33] shadow-[0_0_10px_rgba(206,174,51,0.3)]";
const LABEL = "ui-label text-[10.5px]! md:text-[11px]!";

function leavesLabel(iso: string): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(date);
  return `Leaves ${day} · 17:00 UTC`;
}

function Icon({ item, className = "" }: { item: XurItem; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.icon} alt={item.name} title={item.name} className={`${EXOTIC_ICON} ${className}`} />;
}

function ClassIcon({ guardianClass }: { guardianClass: XurClass }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={CLASS_ICON[guardianClass]} alt="" aria-hidden className={`${CLASS_ICON_SIZE[guardianClass]} opacity-85 invert`} />
  );
}

/** Catalyst card: on phones the icon fills the card height; on desktop it sits inside with padding. */
function Catalyst({ item }: { item: XurItem }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 overflow-hidden border ${GOLD_BORDER} bg-[linear-gradient(90deg,rgba(232,200,96,0.10),transparent)] md:gap-3 md:px-3 md:py-[9px]`}
    >
      <Icon item={item} className="size-[52px] shrink-0 md:size-14" />
      <div className="min-w-0 pr-2">
        <div className={`${LABEL} text-[#e8c860]!`}>Catalyst</div>
        <div className="font-display text-[15px] font-semibold uppercase leading-tight tracking-[0.04em] text-bone md:text-[19px]">
          {item.name}
        </div>
      </div>
    </div>
  );
}

function GearPending({ signedIn }: { signedIn: boolean }) {
  return (
    <p className="text-[12.5px] text-ash">
      {signedIn ? "Loading this week's weapons and catalysts…" : "Sign in to load this week's exotic weapons and catalysts."}
    </p>
  );
}

/** Xûr strip under "This week" (Friday → Tuesday reset): catalysts, exotic weapons, exotic armor by class. */
export function HomeXur({ data }: { data: XurData }) {
  const signedIn = useSignedIn();
  const [gear, setGear] = useState<XurGear | null>(data.gear);

  // First signed-in visit of the weekend reads the sub-vendor and stores it for everyone.
  useEffect(() => {
    if (gear || !signedIn) return;
    let cancelled = false;
    fetch("/api/xur", { method: "POST" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { gear: XurGear | null } | null) => {
        if (!cancelled && payload?.gear) setGear(payload.gear);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [gear, signedIn]);

  const byClass = (["Titan", "Hunter", "Warlock"] as const).map((guardianClass) => ({
    guardianClass,
    pieces: data.armor.filter((piece) => piece.guardianClass === guardianClass),
  }));

  return (
    <div className="relative mt-3 flex flex-col overflow-hidden border border-[rgba(232,200,96,0.35)] bg-panel md:flex-row">
      {/* Desktop: the art runs a little wider than Xûr's column and fades into the panel colour on the right. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[360px] md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={XUR_ART} alt="" className="h-full w-full object-cover object-[50%_25%] opacity-60" />
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,22,28,0)_45%,var(--color-panel)_100%),linear-gradient(0deg,rgba(11,13,16,0.9)_5%,rgba(11,13,16,0.15)_60%)]" />
      </div>
      {/* Phones: the art runs below the band, behind the catalysts, and fades into the panel colour at the bottom. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[230px] md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={XUR_ART} alt="" className="h-full w-full object-cover object-[50%_22%] opacity-60" />
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,22,28,0.1)_0%,rgba(18,22,28,0.6)_45%,var(--color-panel)_100%)]" />
      </div>
      {/* Xûr: band on phones, portrait column on desktop. */}
      <div className="relative flex h-[118px] shrink-0 flex-col justify-between px-4 py-3.5 md:h-auto md:min-h-[176px] md:w-[260px] md:py-4">

        <span className={`${LABEL} relative text-[#e8c860]!`}>Agent of the Nine · Tower</span>
        <div className="relative">
          <div className="font-display text-[26px] font-semibold uppercase leading-none tracking-[0.06em] text-bone md:text-3xl">
            Xûr is here
          </div>
          <div className={`${LABEL} mt-1 text-[#c7cad0]!`}>{leavesLabel(data.leavesAt)}</div>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-4 p-3.5 md:flex-row md:gap-7 md:px-5 md:py-4">
        <div className="flex flex-col gap-2 md:w-[250px] md:shrink-0">
          <span className={`${LABEL} text-[#e8c860]!`}>{gear ? `${gear.catalysts.length} catalysts this week` : "Catalysts this week"}</span>
          {gear ? (
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1 md:gap-2">
              {gear.catalysts.map((item) => (
                <Catalyst key={item.hash} item={item} />
              ))}
            </div>
          ) : (
            <GearPending signedIn={signedIn} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {gear ? (
            <div className="flex flex-col gap-1.5">
              <span className={LABEL}>Exotic weapons</span>
              <div className="grid grid-cols-6 gap-1.5 md:flex md:gap-2">
                {gear.weapons.map((item) => (
                  <Icon key={item.hash} item={item} className="aspect-square w-full md:size-[52px]" />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <span className={LABEL}>Exotic armor</span>
            {/* Phones: one 6-column row with the class as a badge. Desktop: grouped by class with a small header. */}
            <div className="grid grid-cols-6 gap-1.5 md:hidden">
              {data.armor.map((piece) => (
                <ArmorTile key={piece.hash} piece={piece} />
              ))}
            </div>
            <div className="hidden gap-[22px] md:flex">
              {byClass.map(({ guardianClass, pieces }) => (
                <div key={guardianClass} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-[5px]">
                    <ClassIcon guardianClass={guardianClass} />
                    <span className="ui-label text-[9.5px]! text-[#c7cad0]!">{guardianClass}</span>
                  </div>
                  <div className="flex gap-2">
                    {pieces.map((piece) => (
                      <Icon key={piece.hash} item={piece} className="size-[52px]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArmorTile({ piece }: { piece: XurArmor }) {
  return (
    <div className="relative">
      <Icon item={piece} className="aspect-square w-full" />
      <span className="absolute bottom-0.5 right-0.5 flex size-4 items-center justify-center bg-void/85">
        <ClassIcon guardianClass={piece.guardianClass} />
      </span>
    </div>
  );
}
