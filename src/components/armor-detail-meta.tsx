import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { armorSlotIconPath, armorSlotLabel } from "@/lib/armor-slot-icon";
import type { AllLootItem } from "@/types/all-loot";

function MetaDivider() {
  return <span className="h-4 w-px shrink-0 bg-zinc-700" aria-hidden />;
}

type ArmorDetailMetaProps = {
  armor: AllLootItem;
};

export function ArmorDetailMeta({ armor }: ArmorDetailMetaProps) {
  const slotIcon = armorSlotIconPath(armor.slot);
  const slotLabel = armorSlotLabel(armor.slot);
  const classIcon = classOrWeaponTypeIconPath(armor.classOrWeaponType);
  const classLabel = armor.classOrWeaponType;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
      {slotLabel ? (
        <span className="inline-flex items-center gap-2">
          {slotIcon ? (
            // eslint-disable-next-line @next/next/no-img-element -- local PNG slot icons
            <img
              src={slotIcon}
              alt=""
              aria-hidden
              className="h-4 w-4 shrink-0 object-contain"
            />
          ) : null}
          <span>{slotLabel}</span>
        </span>
      ) : null}

      {classLabel ? (
        <>
          <MetaDivider />
          <span className="inline-flex items-center gap-2">
            {classIcon ? (
              // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
              <img
                src={classIcon}
                alt=""
                aria-hidden
                className="h-4 w-6 shrink-0 object-contain brightness-0 invert opacity-[0.85]"
              />
            ) : null}
            <span>{classLabel}</span>
          </span>
        </>
      ) : null}
    </div>
  );
}
