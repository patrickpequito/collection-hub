import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import {
  weaponAmmoIconPath,
  weaponAmmoLabel,
} from "@/lib/weapon-slot-icon";
import type { AllLootItem } from "@/types/all-loot";

function MetaDivider() {
  return <span className="h-4 w-px shrink-0 bg-zinc-700" aria-hidden />;
}

type WeaponDetailMetaProps = {
  weapon: AllLootItem;
};

export function WeaponDetailMeta({ weapon }: WeaponDetailMetaProps) {
  const weaponTypeIcon = classOrWeaponTypeIconPath(weapon.classOrWeaponType);
  const damageIcon = damageTypeIconPath(weapon.damageType);
  const ammoIcon = weaponAmmoIconPath(weapon.ammoType);
  const ammoLabel = weaponAmmoLabel(weapon.ammoType);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
      {weapon.classOrWeaponType ? (
        <span className="inline-flex items-center gap-2">
          {weaponTypeIcon ? (
            // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
            <img
              src={weaponTypeIcon}
              alt=""
              aria-hidden
              className="h-4 w-6 shrink-0 object-contain brightness-0 invert opacity-[0.85]"
            />
          ) : null}
          <span>{weapon.classOrWeaponType}</span>
        </span>
      ) : null}

      {weapon.slot ? (
        <>
          <MetaDivider />
          <span>{weapon.slot}</span>
        </>
      ) : null}

      {damageIcon ? (
        <>
          <MetaDivider />
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
          <MetaDivider />
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
              className="h-4 w-4 object-contain"
            />
          </span>
        </>
      ) : null}
    </div>
  );
}
