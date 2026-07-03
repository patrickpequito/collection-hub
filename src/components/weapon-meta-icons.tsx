import Image from "next/image";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import {
  weaponAmmoIconPath,
  weaponAmmoLabel,
} from "@/lib/weapon-slot-icon";

type WeaponMetaIconsProps = {
  classOrWeaponType?: string | null;
  damageType?: string | null;
  ammoType?: string | null;
  className?: string;
};

export function WeaponMetaIcons({
  classOrWeaponType,
  damageType,
  ammoType,
  className = "",
}: WeaponMetaIconsProps) {
  const weaponTypeIcon = classOrWeaponTypeIconPath(classOrWeaponType);
  const damageIcon = damageTypeIconPath(damageType);
  const ammoIcon = weaponAmmoIconPath(ammoType);
  const ammoLabel = weaponAmmoLabel(ammoType);

  if (!weaponTypeIcon && !damageIcon && !ammoIcon) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      aria-hidden
    >
      {weaponTypeIcon ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
        <img
          src={weaponTypeIcon}
          alt=""
          className="h-3.5 w-5 shrink-0 object-contain brightness-0 invert opacity-[0.85]"
        />
      ) : null}
      {damageIcon ? (
        <Image
          src={bungieIconUrl(damageIcon)}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 shrink-0 object-contain"
          unoptimized
        />
      ) : null}
      {ammoIcon ? (
        // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
        <img
          src={ammoIcon}
          alt=""
          title={ammoLabel ?? undefined}
          className="h-3.5 w-3.5 shrink-0 object-contain"
        />
      ) : null}
    </div>
  );
}
