"use client";

import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath, isGuardianClass } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import { itemRarityColor } from "@/lib/item-rarity-color";
import {
  weaponAmmoIconPath,
  weaponAmmoLabel,
} from "@/lib/weapon-slot-icon";
import type { AllLootItem } from "@/types/all-loot";
import { isItemOwned } from "@/lib/all-loot/ownership";

export { isItemOwned };

/** Shared grid layout for header + rows. Rarity hides below sm (640px). */
export const ALL_LOOT_ROW_LAYOUT = [
  "grid items-center gap-x-2 border-b border-zinc-800/80 py-2 sm:gap-x-4 sm:py-3",
  "grid-cols-[2rem_minmax(0,1.3fr)_minmax(0,1.15fr)_1.375rem_3.75rem_1.375rem]",
  "sm:grid-cols-[3rem_minmax(0,1.75fr)_repeat(4,minmax(0,1fr))_2.5rem]",
].join(" ");

const COL_ICON = "col-start-1";
const COL_ITEM = "col-start-2 min-w-0";
const COL_RARITY = "col-start-3 hidden min-w-0 sm:block";
const COL_CLASS_WEAPON =
  "col-start-3 min-w-0 sm:col-start-4";
const COL_DAMAGE =
  "col-start-4 flex justify-center sm:col-start-5";
const COL_SLOT =
  "col-start-5 min-w-0 max-sm:justify-self-center max-sm:text-center sm:col-start-6";
const COL_OBTAINABLE =
  "col-start-6 flex items-center justify-center sm:col-start-7 sm:justify-end";

type AllLootRowProps = {
  item: AllLootItem;
  owned: boolean;
  showOwnership: boolean;
};

function shouldShowItemType(type: string) {
  return type !== "Weapon" && type !== "Armor";
}

function ItemMetaLine({
  type,
  seasonLabel,
}: {
  type: string;
  seasonLabel: string;
}) {
  const showType = shouldShowItemType(type);

  return (
    <p className="truncate text-[10px] sm:text-xs">
      {showType ? (
        <>
          <span className="font-medium uppercase tracking-wide text-zinc-400">
            {type}
          </span>
          <span className="text-zinc-600" aria-hidden>
            {" · "}
          </span>
        </>
      ) : null}
      <span className="text-zinc-500">{seasonLabel}</span>
    </p>
  );
}

function ObtainableIcon({ obtainable }: { obtainable: boolean }) {
  if (obtainable) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-300 sm:h-6 sm:w-6 sm:text-sm"
        title="Obtainable today"
        aria-label="Obtainable today"
      >
        ✓
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500 sm:h-6 sm:w-6 sm:text-sm"
      title="Not obtainable"
      aria-label="Not obtainable"
    >
      ✕
    </span>
  );
}

function DamageTypeCell({
  damageType,
}: {
  damageType: string | null | undefined;
}) {
  const iconPath = damageTypeIconPath(damageType);

  return (
    <div className={COL_DAMAGE}>
      {iconPath ? (
        <div
          className="flex items-center justify-center"
          role="img"
          aria-label={damageType ?? undefined}
          title={damageType ?? undefined}
        >
          <Image
            src={bungieIconUrl(iconPath)}
            alt=""
            width={20}
            height={20}
            className="h-4 w-4 object-contain sm:h-5 sm:w-5"
            aria-hidden
            unoptimized
          />
        </div>
      ) : (
        <p className="text-xs text-zinc-300 sm:text-sm">—</p>
      )}
    </div>
  );
}

function RarityCell({ rarity }: { rarity: string | null | undefined }) {
  const color = itemRarityColor(rarity);

  return (
    <div className={COL_RARITY}>
      <p
        className="truncate text-xs font-medium sm:text-sm"
        style={{ color }}
      >
        {rarity ?? "—"}
      </p>
    </div>
  );
}

function ClassOrWeaponTypeCell({
  value,
}: {
  value: string | null | undefined;
}) {
  const iconPath = classOrWeaponTypeIconPath(value);
  const isClass = isGuardianClass(value);
  const classIconSize =
    value === "Warlock" ? "h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" : "h-3.5 w-3.5 sm:h-4 sm:w-4";

  return (
    <div className={COL_CLASS_WEAPON}>
      {value ? (
        <p className="flex min-w-0 items-center gap-1 truncate text-xs text-zinc-300 sm:gap-2 sm:text-sm">
          {iconPath ? (
            // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
            <img
              src={iconPath}
              alt=""
              aria-hidden
              className={`shrink-0 object-contain object-left brightness-0 invert opacity-[0.85] ${
                isClass ? classIconSize : "h-4 w-6 sm:h-5 sm:w-8"
              }`}
            />
          ) : null}
          <span className="truncate">{value}</span>
        </p>
      ) : (
        <p className="text-xs text-zinc-300 sm:text-sm">—</p>
      )}
    </div>
  );
}

function SlotCell({
  type,
  slot,
  ammoType,
}: {
  type: string;
  slot: string | null | undefined;
  ammoType: string | null | undefined;
}) {
  const ammoIconPath = type === "Weapon" ? weaponAmmoIconPath(ammoType) : null;
  const ammoLabel = type === "Weapon" ? weaponAmmoLabel(ammoType) : null;

  return (
    <div className={COL_SLOT}>
      {slot ? (
        <p className="flex min-w-0 items-center justify-center gap-1 truncate text-xs text-zinc-300 max-sm:text-center sm:justify-start sm:gap-1.5 sm:text-sm">
          {ammoIconPath ? (
            // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
            <img
              src={ammoIconPath}
              alt=""
              aria-hidden
              title={ammoLabel ?? undefined}
              className="h-3.5 w-3.5 shrink-0 object-contain sm:h-4 sm:w-4"
            />
          ) : null}
          <span className="truncate">{slot}</span>
        </p>
      ) : (
        <p className="text-xs text-zinc-300 max-sm:text-center sm:text-sm">—</p>
      )}
    </div>
  );
}


export function AllLootRow({ item, owned, showOwnership }: AllLootRowProps) {
  const ownedStyles =
    showOwnership && owned
      ? "ring-1 ring-[rgb(255,188,0)] shadow-[0_0_4px_rgba(255,188,0,0.35)]"
      : showOwnership && !owned
        ? "opacity-75 saturate-75"
        : "";

  return (
    <article className={ALL_LOOT_ROW_LAYOUT}>
      <div className={`relative ${COL_ICON} ${ownedStyles}`}>
        <Image
          src={bungieIconUrl(item.iconPath)}
          alt=""
          width={48}
          height={48}
          className="h-8 w-8 border border-zinc-800 bg-zinc-900 object-cover sm:h-12 sm:w-12"
          unoptimized
        />
      </div>

      <div className={COL_ITEM}>
        <p className="truncate text-xs font-semibold text-zinc-100 sm:text-sm">
          {item.name}
        </p>
        <ItemMetaLine type={item.type} seasonLabel={item.seasonLabel} />
      </div>

      <RarityCell rarity={item.rarity} />
      <ClassOrWeaponTypeCell value={item.classOrWeaponType} />
      <DamageTypeCell damageType={item.damageType} />
      <SlotCell type={item.type} slot={item.slot} ammoType={item.ammoType} />

      <div className={COL_OBTAINABLE}>
        <ObtainableIcon obtainable={item.obtainable} />
      </div>
    </article>
  );
}

export function AllLootResultsHeader() {
  return (
    <div
      className={`${ALL_LOOT_ROW_LAYOUT} border-b border-zinc-800 pb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500`}
    >
      <span className={`${COL_ICON} block h-8 w-8 sm:h-12 sm:w-12`} aria-hidden />
      <span className={COL_ITEM}>Item</span>
      <span className={COL_RARITY}>Rarity</span>
      <span className={COL_CLASS_WEAPON}>Class / Weapon</span>
      <span className={`${COL_DAMAGE} text-center max-sm:text-[9px] max-sm:leading-tight`}>
        Dmg
      </span>
      <span className={`${COL_SLOT} max-sm:justify-self-center max-sm:text-center`}>
        Slot
      </span>
      <span
        className={`${COL_OBTAINABLE} max-sm:justify-center max-sm:text-center max-sm:text-[9px] max-sm:leading-tight sm:text-right`}
      >
        Obt.
      </span>
    </div>
  );
}
