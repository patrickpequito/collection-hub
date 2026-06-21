import { ExpandableImage } from "@/components/expandable-image";
import { ObtainableIcon } from "@/components/obtainable-icon";
import { WeaponDetailMeta } from "@/components/weapon-detail-meta";
import { WeaponPerksSection } from "@/components/weapon-perks-section";
import { WeaponSeasonBadges } from "@/components/weapon-season-badges";
import { WeaponStatsPanel } from "@/components/weapon-stats-panel";
import { resolveSeasonBadges } from "@/lib/all-loot/season-badges";
import { bungieIconUrl } from "@/lib/bungie-icon";
import { resolveWeaponPerkColumns } from "@/lib/weapons/perks";
import type { AllLootItem, WeaponPlugDefinition } from "@/types/all-loot";
import type { ResolvedWeaponGodRoll } from "@/types/weapon-god-rolls";

type WeaponDetailContentProps = {
  weapon: AllLootItem;
  plugIndex?: Record<string, WeaponPlugDefinition>;
  godRoll?: ResolvedWeaponGodRoll | null;
};

export function WeaponDetailContent({
  weapon,
  plugIndex = {},
  godRoll = null,
}: WeaponDetailContentProps) {
  const seasonBadges = resolveSeasonBadges(weapon);
  const perkColumns = resolveWeaponPerkColumns(weapon, plugIndex);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 sm:gap-4">
        <h1 className="min-w-0 text-3xl font-semibold leading-none text-zinc-100 sm:text-4xl">
          {weapon.name}
        </h1>
        <WeaponSeasonBadges badges={seasonBadges} className="ml-auto" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <WeaponDetailMeta weapon={weapon} />

          <div className="space-y-2">
            {weapon.description ? (
              <p className="text-sm italic leading-relaxed text-zinc-400">
                {weapon.description}
              </p>
            ) : null}

            <div
              className={`flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1 ${
                weapon.obtainable
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <span
                className={`text-xs ${weapon.obtainable ? "text-emerald-200/90" : "text-zinc-400"}`}
              >
                {weapon.obtainable ? "Obtainable" : "Not obtainable"}
              </span>
              <ObtainableIcon obtainable={weapon.obtainable} size="compact" />
            </div>

            {weapon.source ? (
              <p className="text-sm leading-relaxed text-zinc-300">
                {weapon.source}
              </p>
            ) : null}
          </div>

          {weapon.stats?.length ? (
            <WeaponStatsPanel stats={weapon.stats} />
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {weapon.screenshotPath ? (
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
              <ExpandableImage
                src={bungieIconUrl(weapon.screenshotPath)}
                alt={weapon.name}
                expandLabel={`Expand ${weapon.name} preview`}
              />
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 text-sm text-zinc-500">
              No preview image available.
            </div>
          )}

          {perkColumns.length ? (
            <WeaponPerksSection columns={perkColumns} godRoll={godRoll} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
