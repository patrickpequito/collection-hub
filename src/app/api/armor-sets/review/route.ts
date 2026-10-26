import { NextResponse } from "next/server";
import { loadArmorSetCollection } from "@/lib/armor-sets/collection";

/** TEMPORARY local check: what the Armor sets page gathered + the review list. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const { sets, review } = await loadArmorSetCollection();
  const byGroup: Record<string, number> = {};
  for (const set of sets) {
    const key = set.subgroup ? `${set.group} / ${set.subgroup}` : `${set.group} (${set.kind})`;
    byGroup[key] = (byGroup[key] ?? 0) + 1;
  }
  return NextResponse.json({
    total: sets.length,
    withBonus: sets.filter((set) => set.bonus).length,
    withPreview: sets.filter((set) => set.previewUrl).length,
    byGroup,
    review,
    noBonusRaidDungeon: sets
      .filter((set) => (set.group === "raids" || set.group === "dungeons") && !set.bonus)
      .map((set) => `${set.name} | ${set.originLabel} | ${Object.values(set.classes.hunter ?? {})[0]?.itemHash}`),
    sample: sets.slice(0, 3).map((set) => ({ name: set.name, origin: set.originLabel, kind: set.kind })),
  });
}
