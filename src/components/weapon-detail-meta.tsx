import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import {
  weaponAmmoIconPath,
  weaponAmmoLabel,
} from "@/lib/weapon-slot-icon";
import type { AllLootItem } from "@/types/all-loot";

function MetaDivider({ dark }: { dark: boolean }) {
  return <span className={`h-4 w-px shrink-0 ${dark ? "bg-black/30" : "bg-zinc-700"}`} aria-hidden />;
}

type WeaponDetailMetaProps = {
  weapon: AllLootItem;
  /** Light background (exotic header): dark text and icons. */
  dark?: boolean;
  /** Phones: one line — type · ammo icon + slot letter (P / E / H) · element. */
  compact?: boolean;
};

export function WeaponDetailMeta({ weapon, dark = false, compact = false }: WeaponDetailMetaProps) {
  const weaponTypeIcon = classOrWeaponTypeIconPath(weapon.classOrWeaponType);
  const damageIcon = damageTypeIconPath(weapon.damageType);
  const ammoIcon = weaponAmmoIconPath(weapon.ammoType);
  const ammoLabel = weaponAmmoLabel(weapon.ammoType);

  if (compact) {
    return (
      <div className={`flex min-w-0 items-center gap-2 whitespace-nowrap ${dark ? "text-[#4a3d05]" : ""}`}>
        {weaponTypeIcon ? (
          // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
          <img
            src={weaponTypeIcon}
            alt=""
            aria-hidden
            className={`h-3.5 w-5 shrink-0 object-contain brightness-0 ${dark ? "opacity-70" : "invert opacity-[0.85]"}`}
          />
        ) : null}
        <span className="truncate">{weapon.classOrWeaponType}</span>
        {weapon.slot ? (
          <>
            <MetaDivider dark={dark} />
            <span className="inline-flex items-center gap-1" title={ammoLabel ?? weapon.slot}>
              {ammoIcon ? (
                // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
                <img src={ammoIcon} alt="" aria-hidden className={`h-3.5 w-3.5 object-contain ${dark ? "brightness-0 opacity-70" : ""}`} />
              ) : null}
              {weapon.slot.charAt(0)}
            </span>
          </>
        ) : null}
        {damageIcon ? (
          <>
            <MetaDivider dark={dark} />
            <Image
              src={bungieIconUrl(damageIcon)}
              alt={weapon.damageType ?? ""}
              title={weapon.damageType ?? undefined}
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
              unoptimized
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 text-sm ${dark ? "text-[#4a3d05]" : "text-zinc-300"}`}>
      {weapon.classOrWeaponType ? (
        <span className="inline-flex items-center gap-2">
          {weaponTypeIcon ? (
            // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
            <img
              src={weaponTypeIcon}
              alt=""
              aria-hidden
              className={`h-4 w-6 shrink-0 object-contain brightness-0 ${dark ? "opacity-70" : "invert opacity-[0.85]"}`}
            />
          ) : null}
          <span>{weapon.classOrWeaponType}</span>
        </span>
      ) : null}

      {weapon.slot ? (
        <>
          <MetaDivider dark={dark} />
          <span>{weapon.slot}</span>
        </>
      ) : null}

      {damageIcon ? (
        <>
          <MetaDivider dark={dark} />
          <span
            className="inline-flex items-center"
            role="img"
            aria-label={weapon.damageType ?? undefined}
            title={weapon.damageType ?? undefined}
          >
            <Image
              src={bungieIconUrl(damageIcon)}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              unoptimized
            />
          </span>
        </>
      ) : null}

      {ammoIcon ? (
        <>
          <MetaDivider dark={dark} />
          <span
            className="inline-flex items-center"
            role="img"
            aria-label={ammoLabel ?? undefined}
            title={ammoLabel ?? undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG icons */}
            <img
              src={ammoIcon}
              alt=""
              aria-hidden
              className={`h-4 w-4 object-contain ${dark ? "brightness-0 opacity-70" : ""}`}
            />
          </span>
        </>
      ) : null}
    </div>
  );
}
