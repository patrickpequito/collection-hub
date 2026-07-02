"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ObtainableIcon } from "@/components/obtainable-icon";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath, isGuardianClass } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import { itemRarityColor } from "@/lib/item-rarity-color";
import {
  weaponAmmoIconPath,
  weaponAmmoLabel,
} from "@/lib/weapon-slot-icon";
import { weaponPageHref } from "@/lib/weapons/paths";
import { armorPageHref } from "@/lib/armor/paths";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";
import { resolveVersionDisplayLabel } from "@/lib/all-loot/season-badges";
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

function ItemIconWithSeasonBadge({
  iconPath,
  seasonIconPath,
  size = "row",
  className = "",
}: {
  iconPath: string;
  seasonIconPath?: string | null;
  size?: "row" | "popover";
  className?: string;
}) {
  const iconClass =
    size === "popover"
      ? "h-8 w-8 border border-zinc-800 bg-zinc-900 object-cover sm:h-9 sm:w-9"
      : "h-8 w-8 border border-zinc-800 bg-zinc-900 object-cover sm:h-12 sm:w-12";

  return (
    <div className={`relative shrink-0 ${className}`}>
      <Image
        src={bungieIconUrl(iconPath)}
        alt=""
        width={48}
        height={48}
        className={`${iconClass} transition-transform duration-200 group-hover:scale-105`}
        unoptimized
      />
      {seasonIconPath ? (
        <Image
          src={bungieIconUrl(seasonIconPath)}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute left-0 top-0 size-full"
          unoptimized
        />
      ) : null}
    </div>
  );
}

function ItemMetaLine({
  type,
  seasonLabel,
  onHover,
}: {
  type: string;
  seasonLabel: string;
  onHover?: (active: boolean) => void;
}) {
  const showType = shouldShowItemType(type);

  return (
    <p
      className="truncate text-[10px] sm:text-xs"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
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

function AllLootVersionsPopover({
  versions,
  open,
  onHover,
}: {
  versions: AllLootItemVersion[];
  open: boolean;
  onHover: (active: boolean) => void;
}) {
  if (!open || versions.length <= 1) return null;

  return (
    <div
      className="absolute left-0 top-full z-50 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-zinc-700 bg-zinc-950/98 p-2 shadow-xl backdrop-blur-sm"
      role="tooltip"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        All versions
      </p>
      <ul className="max-h-56 space-y-1 overflow-y-auto">
        {versions.map((version) => (
          <li
            key={version.itemHash}
            className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-zinc-900/80"
          >
            <ItemIconWithSeasonBadge
              iconPath={version.iconPath}
              seasonIconPath={version.seasonIconPath}
              size="popover"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-zinc-100 sm:text-sm">
                {version.name}
              </p>
              <p className="truncate text-[10px] text-zinc-500 sm:text-xs">
                {resolveVersionDisplayLabel(version)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useVersionsHover(versions: AllLootItemVersion[] | undefined) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasVersions = Boolean(versions && versions.length > 1);

  const setHover = useCallback(
    (active: boolean) => {
      if (!hasVersions) return;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (active) {
        setOpen(true);
        return;
      }
      closeTimerRef.current = setTimeout(() => setOpen(false), 120);
    },
    [hasVersions],
  );

  return { open, setHover, hasVersions, versions: versions ?? [] };
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
  const pathname = usePathname();
  const { open, setHover, hasVersions, versions } = useVersionsHover(
    item.versions,
  );
  const itemHref =
    item.type === "Weapon" && item.slug
      ? weaponPageHref(item.slug, pathname)
      : item.type === "Armor" && item.slug
        ? armorPageHref(item.slug, pathname)
        : null;
  const isItemLink = Boolean(itemHref);

  const ownedStyles =
    showOwnership && owned
      ? "ring-1 ring-[rgb(255,188,0)] shadow-[0_0_4px_rgba(255,188,0,0.35)]"
      : showOwnership && !owned
        ? "opacity-75 saturate-75"
        : "";

  const rowClass = isItemLink
    ? "group -mx-2 cursor-pointer rounded-md px-2 transition-[background-color,box-shadow] duration-200 hover:bg-zinc-800/90 hover:shadow-[inset_3px_0_0_0_rgba(251,191,36,0.55)]"
    : "";

  const nameClass = [
    "truncate text-xs font-semibold text-zinc-100 sm:text-sm",
    hasVersions &&
      "underline decoration-zinc-700 decoration-dotted underline-offset-2",
    isItemLink && "transition-colors duration-200 group-hover:text-amber-200",
  ]
    .filter(Boolean)
    .join(" ");

  const nameContent = (
    <p
      className={nameClass}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {item.name}
    </p>
  );

  return (
    <article className={`${ALL_LOOT_ROW_LAYOUT} ${rowClass}`}>
      <div
        className={`relative ${COL_ICON} ${ownedStyles}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {itemHref ? (
          <Link href={itemHref} aria-label={item.name}>
            <ItemIconWithSeasonBadge
              iconPath={item.iconPath}
              seasonIconPath={item.seasonIconPath}
            />
          </Link>
        ) : (
          <ItemIconWithSeasonBadge
            iconPath={item.iconPath}
            seasonIconPath={item.seasonIconPath}
          />
        )}
      </div>

      <div className={`relative ${COL_ITEM}`}>
        {itemHref ? (
          <Link href={itemHref} className="block min-w-0">
            {nameContent}
          </Link>
        ) : (
          nameContent
        )}
        <ItemMetaLine
          type={item.type}
          seasonLabel={item.seasonLabel}
          onHover={setHover}
        />
        <AllLootVersionsPopover
          versions={versions}
          open={open}
          onHover={setHover}
        />
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
