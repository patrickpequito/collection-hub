import { bungieIconUrl } from "@/lib/bungie-icon";
import { classOrWeaponTypeIconPath } from "@/lib/class-weapon-type-icon";
import { damageTypeIconPath } from "@/lib/damage-type-icon";
import { weaponAmmoIconPath } from "@/lib/weapon-slot-icon";

/** Header band per rarity — the colour stands in for the rarity name. */
const RARITY_HEADER: Record<string, { band: string; title: string; subtitle: string }> = {
  exotic: { band: "bg-[#ceae33]", title: "text-[#1c1600]", subtitle: "text-[#4a3d05]" },
  legendary: { band: "bg-[#522f65]", title: "text-bone", subtitle: "text-[#d9c8e6]" },
  rare: { band: "bg-[#5076a3]", title: "text-white", subtitle: "text-[#dbe6f3]" },
  uncommon: { band: "bg-[#366f42]", title: "text-white", subtitle: "text-[#d3ead7]" },
  common: { band: "bg-[#c3bcb4]", title: "text-[#1d1a17]", subtitle: "text-[#4d4741]" },
};
const NEUTRAL_HEADER = { band: "bg-white/[0.06]", title: "text-bone", subtitle: "text-ash" };

const CLASS_NAMES = new Set(["Titan", "Hunter", "Warlock"]);

/** `Source: "Vesper's Host" Dungeon` → `Vesper's Host Dungeon`. */
function cleanSource(source: string): string {
  return source
    .replace(/^source:\s*/i, "")
    .replace(/["“”]/g, "")
    .trim();
}

type ItemTooltipProps = {
  name: string;
  source?: string;
  rarity?: string | null;
  itemType?: string | null;
  classOrWeaponType?: string | null;
  damageType?: string | null;
  ammoType?: string | null;
};

/** Director UI item tooltip: rarity-coloured header, weapon meta, source. */
export function ItemTooltip({
  name,
  source,
  rarity,
  itemType,
  classOrWeaponType,
  damageType,
  ammoType,
}: ItemTooltipProps) {
  const header = (rarity && RARITY_HEADER[rarity.toLowerCase()]) || NEUTRAL_HEADER;
  // Light bands (exotic / common) need the type icon dark, the rest light.
  const darkBand = header === RARITY_HEADER.exotic || header === RARITY_HEADER.common;

  const isClass = classOrWeaponType ? CLASS_NAMES.has(classOrWeaponType) : false;
  const typeLabel = classOrWeaponType
    ? isClass
      ? `${classOrWeaponType} armor`
      : classOrWeaponType
    : itemType && itemType !== "Weapon"
      ? itemType
      : null;
  const typeIcon = classOrWeaponTypeIconPath(classOrWeaponType);
  const damageIcon = damageTypeIconPath(damageType);
  const ammoIcon = weaponAmmoIconPath(ammoType);
  const sourceText = source ? cleanSource(source) : "";

  return (
    <div className="w-60 border border-white/[0.18] bg-[#12161c] shadow-lg">
      <div className={`px-3 py-2.5 ${header.band}`}>
        <p
          className={`font-display text-[17px] font-semibold uppercase leading-tight tracking-[0.05em] ${header.title}`}
        >
          {name}
        </p>
        {typeLabel ? (
          <p
            className={`mt-1 flex items-center gap-1.5 font-display text-xs uppercase tracking-[0.14em] ${header.subtitle}`}
          >
            {typeIcon ? (
              // eslint-disable-next-line @next/next/no-img-element -- local SVG icons
              <img
                src={typeIcon}
                alt=""
                aria-hidden
                className={`h-3.5 w-5 shrink-0 object-contain brightness-0 ${
                  darkBand ? "opacity-70" : "invert opacity-85"
                }`}
              />
            ) : null}
            {typeLabel}
          </p>
        ) : null}
      </div>

      {damageIcon || ammoIcon || sourceText ? (
        <div className="space-y-2 px-3 py-2.5">
          {damageIcon || ammoIcon ? (
            <div className="flex flex-wrap gap-1.5">
              {damageIcon ? (
                <span className="inline-flex items-center gap-1.5 border border-white/[0.18] px-1.5 py-0.5 text-xs text-bone/80">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Bungie icon */}
                  <img
                    src={bungieIconUrl(damageIcon)}
                    alt=""
                    aria-hidden
                    className="size-3.5 shrink-0 object-contain"
                  />
                  {damageType}
                </span>
              ) : null}
              {ammoIcon ? (
                <span className="inline-flex items-center gap-1.5 border border-white/[0.18] px-1.5 py-0.5 text-xs text-bone/80">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local SVG icons */}
                  <img
                    src={ammoIcon}
                    alt=""
                    aria-hidden
                    className="size-3.5 shrink-0 object-contain"
                  />
                  {ammoType}
                </span>
              ) : null}
            </div>
          ) : null}
          {sourceText ? (
            <p className="text-[13px] leading-snug text-ash">{sourceText}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
