import type { Metadata } from "next";
import { AdminWeekForm, type AdminRotationRow, type AdminSelectOption } from "@/components/admin/admin-week-form";
import { DUNGEONS, RAIDS } from "@/data/rad-loot/activities";
import { MANUAL_ROTATION_GROUPS, rotationKey } from "@/data/destinations/weekly-rotations";
import { isAdminMembership, readRotationHistory, readWeekOverride } from "@/lib/admin/weekly-store";
import { resolveRotation } from "@/lib/destinations/rotation-learning";
import { loadFeaturedActivities } from "@/lib/rad-loot/featured-activities";
import { EXCLUDED_FEATURED_RAID_SLUGS, rotationWeekIndex, weekBounds } from "@/lib/rad-loot/featured-rotation";
import { formatShareWeek } from "@/lib/share/reset";
import { getSession } from "@/lib/session";

/** Weekly admin panel (owner only): featured activities and hand-entered destination rotations. */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getSession();
  if (!isAdminMembership(session?.membershipId)) {
    return (
      <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.06em] text-bone">Admin</h1>
        <p className="mt-4 text-sm text-ash">
          {session
            ? `This account can't open the admin panel. Bungie.net membership id: ${session.membershipId}`
            : "Sign in with Bungie to open the admin panel."}
        </p>
      </main>
    );
  }

  const week = rotationWeekIndex(new Date());
  const { weekStart, weekEnd } = weekBounds(week);
  const [featured, override, history] = await Promise.all([
    loadFeaturedActivities(),
    readWeekOverride(week),
    readRotationHistory(),
  ]);

  const options = (entries: typeof RAIDS): AdminSelectOption[] =>
    entries
      .filter((entry) => entry.available && !EXCLUDED_FEATURED_RAID_SLUGS.has(entry.slug))
      .map((entry) => ({ value: entry.slug, label: entry.title }));

  const groups = MANUAL_ROTATION_GROUPS.map((group) => ({
    name: group.name,
    rows: group.rotations.map((rotation): AdminRotationRow => {
      const key = rotationKey(group.destination, rotation);
      const predicted = resolveRotation(rotation, week, history[key], undefined);
      const picked = override?.rotations?.[key];
      return {
        key,
        label: rotation.label,
        options: rotation.order.map((entry) => entry.name),
        predicted: predicted.entry.name,
        value: picked ?? predicted.entry.name,
        status: predicted.status,
        length: rotation.order.length,
        seen: predicted.seen,
        history: predicted.history.slice(-4).map((entry) => `${entry.name} (wk ${entry.week})`),
        savedThisWeek: Boolean(history[key]?.[String(week)]),
      };
    }),
  }));

  return (
    <main className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6">
      <AdminWeekForm
        week={week}
        dates={formatShareWeek(weekStart, weekEnd)}
        raids={options(RAIDS)}
        dungeons={options(DUNGEONS)}
        featuredRaids={featured.featuredRaids}
        featuredDungeons={featured.featuredDungeons}
        featuredFromAdmin={{
          raids: (override?.featuredRaids?.length ?? 0) === 2,
          dungeons: (override?.featuredDungeons?.length ?? 0) === 2,
        }}
        groups={groups}
      />
    </main>
  );
}
