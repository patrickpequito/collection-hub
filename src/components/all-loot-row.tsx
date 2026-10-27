"use client";

import Link from "@/components/app-link";
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
import { armorSlotIconPath } from "@/lib/armor-slot-icon";
import { armorPageHref } from "@/lib/armor/paths";
import type { AllLootItem, AllLootItemVersion } from "@/types/all-loot";
import { resolveVersionDisplayLabel, dedupeVersionsForDisplay } from "@/lib/all-loot/season-badges";
import { isItemOwned } from "@/lib/all-loot/ownership";

export { isItemOwned };

/**
 * Shared grid layout for header + rows. Below sm (640px) rarity hides and
 * class / weapon type and slot shrink to icons, leaving room for the item.
 */
export const ALL_LOOT_ROW_LAYOUT = [
  "grid items-center gap-x-2 border-b border-zinc-800/80 py-2 sm:gap-x-4 sm:py-3",
  "grid-cols-[3rem_minmax(0,1fr)_1.75rem_1.375rem_2.25rem_1.375rem]",
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
      ? "h-9 w-9 border border-white/[0.14] bg-[#14181e] object-cover"
      : "h-12 w-12 border border-zinc-800 bg-zinc-900 object-cover";

  return (
    <div className={`relative shrink-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bungieIconUrl(iconPath)}
        alt=""
        width={48}
        height={48}
        className={`${iconClass} transition-transform duration-200 group-hover:scale-105`}
        decoding="async"
      />
      {seasonIconPath ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bungieIconUrl(seasonIconPath)}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute -left-px -top-px h-[calc(100%+2px)] w-[calc(100%+2px)] max-w-none"
          decoding="async"
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
      className="truncate text-xs"
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
      className="absolute left-0 top-full z-50 mt-1.5 w-[min(18rem,calc(100vw-2rem))] border border-white/30 bg-[#12161c] p-2.5 shadow-lg"
      role="tooltip"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <p className="ui-label mb-2 text-[10px]!">All versions</p>
      <ul className="max-h-56 space-y-0.5 overflow-y-auto">
        {versions.map((version) => (
          <li key={version.itemHash} className="flex items-center gap-2.5 px-1 py-1 hover:bg-white/[0.04]">
            <ItemIconWithSeasonBadge
              iconPath={version.iconPath}
              seasonIconPath={version.seasonIconPath}
              size="popover"
            />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-bone">{version.name}</p>
              <p className="truncate text-xs text-ash">{resolveVersionDisplayLabel(version)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useVersionsHover(item: AllLootItem) {
  const versions = dedupeVersionsForDisplay(item);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasVersions = versions.length > 1;

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

  return { open, setHover, hasVersions, versions };
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
        <p className="flex min-w-0 items-center gap-1 truncate text-xs text-zinc-300 max-sm:justify-center sm:gap-2 sm:text-sm" title={value}>
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
          <span className="hidden truncate sm:inline">{value}</span>
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
  // Phones: armor slot icon, or the weapon slot's first letter (P / E / H).
  const slotIconPath = armorSlotIconPath(slot);
  const compact = slotIconPath ? (
    // eslint-disable-next-line @next/next/no-img-element -- local slot icons
    <img src={slotIconPath} alt="" aria-hidden className="h-4 w-4 shrink-0 object-contain" />
  ) : type === "Weapon" && slot ? (
    <span className="font-display text-sm text-bone/85">{slot.charAt(0)}</span>
  ) : null;

  return (
    <div className={COL_SLOT}>
      {slot ? (
        <p
          className="flex min-w-0 items-center justify-center gap-1 truncate text-xs text-zinc-300 max-sm:text-center sm:justify-start sm:gap-1.5 sm:text-sm"
          title={slot}
        >
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
          {compact ? <span className="flex items-center sm:hidden">{compact}</span> : null}
          <span className={`truncate ${compact ? "hidden sm:inline" : ""}`}>{slot}</span>
        </p>
      ) : (
        <p className="text-xs text-zinc-300 max-sm:text-center sm:text-sm">—</p>
      )}
    </div>
  );
}


export function AllLootRow({ item, owned, showOwnership }: AllLootRowProps) {
  const pathname = usePathname();
  const { open, setHover, hasVersions, versions } = useVersionsHover(item);
  const itemHref =
    item.type === "Weapon" && item.slug
      ? weaponPageHref(item.slug, pathname)
      : item.type === "Armor" && item.slug
        ? armorPageHref(item.slug, pathname)
        : null;
  const isItemLink = Boolean(itemHref);

  const ownedStyles =
    showOwnership && owned
      ? "outline outline-2 outline-owned"
      : showOwnership && !owned
        ? "opacity-75 saturate-75"
        : "";

  const rowClass = isItemLink
    ? "group -mx-2 cursor-pointer px-2 transition-[background-color,box-shadow] duration-200 hover:bg-white/[0.04] hover:shadow-[inset_3px_0_0_0_rgba(233,231,226,0.7)]"
    : "";

  const nameClass = [
    "truncate text-[15px] font-semibold text-zinc-100 sm:text-sm",
    hasVersions &&
      "underline decoration-zinc-700 decoration-dotted underline-offset-2",
    isItemLink && "transition-colors duration-200 group-hover:text-white",
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
          seasonLabel={resolveVersionDisplayLabel(item)}
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
      <span className={`${COL_ICON} block h-12 w-12`} aria-hidden />
      <span className={COL_ITEM}>Item</span>
      <span className={COL_RARITY}>Rarity</span>
      <span className={`${COL_CLASS_WEAPON} max-sm:text-center max-sm:text-[9px] max-sm:leading-tight`}>
        <span className="sm:hidden">Type</span>
        <span className="hidden sm:inline">Class / Weapon</span>
      </span>
      <span className={`${COL_DAMAGE} text-center max-sm:text-[9px] max-sm:leading-tight`}>
        Dmg
      </span>
      <span className={`${COL_SLOT} max-sm:justify-self-center max-sm:text-center max-sm:text-[9px] max-sm:leading-tight`}>
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

function MetaIcon({ src, label, invert = true, className = "h-3.5 w-5" }: {
  src: string | null;
  label: string;
  invert?: boolean;
  className?: string;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
        <img
          src={src}
          alt=""
          aria-hidden
          className={`shrink-0 object-contain ${invert ? "brightness-0 invert opacity-85" : ""} ${className}`}
        />
      ) : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Grid view card: icon, name, source and the weapon / armor meta as icons. */
export function AllLootGridCard({ item, owned, showOwnership }: AllLootRowProps) {
  const pathname = usePathname();
  const href =
    item.type === "Weapon" && item.slug
      ? weaponPageHref(item.slug, pathname)
      : item.type === "Armor" && item.slug
        ? armorPageHref(item.slug, pathname)
        : null;
  const damageIcon = damageTypeIconPath(item.damageType);

  let meta: React.ReactNode;
  if (item.type === "Weapon") {
    meta = (
      <>
        {item.classOrWeaponType ? (
          <MetaIcon src={classOrWeaponTypeIconPath(item.classOrWeaponType)} label={item.classOrWeaponType} />
        ) : null}
        {damageIcon ? (
          <Image
            src={bungieIconUrl(damageIcon)}
            alt={item.damageType ?? ""}
            title={item.damageType ?? undefined}
            width={14}
            height={14}
            className="size-3.5 shrink-0 object-contain"
            unoptimized
          />
        ) : null}
        {item.slot ? (
          <MetaIcon src={weaponAmmoIconPath(item.ammoType)} label={item.slot} invert={false} className="size-3.5" />
        ) : null}
      </>
    );
  } else if (item.type === "Armor") {
    meta = (
      <>
        {item.classOrWeaponType ? (
          <MetaIcon
            src={classOrWeaponTypeIconPath(item.classOrWeaponType)}
            label={item.classOrWeaponType}
            className="size-3.5"
          />
        ) : null}
        {item.slot ? <MetaIcon src={armorSlotIconPath(item.slot)} label={item.slot} invert={false} className="size-3.5" /> : null}
      </>
    );
  } else {
    meta = <span>{item.classOrWeaponType ? `${item.type} · ${item.classOrWeaponType}` : item.type}</span>;
  }

  const body = (
    <>
      <span
        className={`shrink-0 ${
          showOwnership && owned ? "outline outline-2 outline-owned" : showOwnership ? "opacity-75 saturate-75" : ""
        }`}
      >
        <ItemIconWithSeasonBadge iconPath={item.iconPath} seasonIconPath={item.seasonIconPath} className="[&_img:first-child]:size-16!" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[15px] font-medium text-bone">{item.name}</span>
        <span className="truncate text-xs text-ash">{resolveVersionDisplayLabel(item)}</span>
        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-bone/75">
          {meta}
        </span>
      </span>
    </>
  );

  const className = "flex min-w-0 gap-3 border border-l-[3px] border-hairline bg-panel/85 p-2.5 transition";
  const style = { borderLeftColor: itemRarityColor(item.rarity) };
  return href ? (
    <Link href={href} className={`${className} hover:border-bone`} style={style}>
      {body}
    </Link>
  ) : (
    <div className={className} style={style}>
      {body}
    </div>
  );
}
