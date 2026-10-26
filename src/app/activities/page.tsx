import type { ReactNode } from "react";
import { ActivitiesProgressProvider } from "@/components/activities/activities-progress-provider";
import { ActivityCard } from "@/components/activities/activity-card";
import { ActivityCardProgress } from "@/components/activities/activity-card-progress";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  DUNGEONS,
  LEGACY_RAIDS,
  PANTHEON,
  RAID_LAIRS,
  RAIDS,
} from "@/data/rad-loot/activities";
import { activityEraLabel, sortNewestFirst } from "@/data/rad-loot/activity-eras";
import { isBungieOAuthConfigured } from "@/lib/env";
import { loadHomeThisWeek } from "@/lib/home/this-week";
import { PAGE_HEADERS } from "@/lib/page-headers";
import type { ActivityEntry } from "@/types/activity-loot";

export const revalidate = 1800;

const SECTIONS = [
  { id: "raids", label: "Raids" },
  { id: "dungeons", label: "Dungeons" },
  { id: "playlists", label: "Playlists" },
  { id: "destinations", label: "Destinations" },
  { id: "endgame", label: "Endgame" },
  { id: "events", label: "Events" },
] as const;

const EVENTS = [
  { title: "Festival of the Lost", icon: "festival-of-the-lost.png" },
  { title: "The Dawning", icon: "the-dawning.png" },
  { title: "Guardian Games", icon: "guardian-games.png" },
  { title: "Solstice", icon: "solstice.png" },
  { title: "Crimson Days", icon: "crimson-days.png" },
] as const;

function activityImage(entry: ActivityEntry): string | undefined {
  const file = entry.wideImageFile ?? entry.imageFile;
  return file ? `/images/rad-loot/activities/${file}` : undefined;
}

function formatDay(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(ms));
}

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-2.5">
        <h2 className="text-[26px] font-semibold uppercase tracking-[0.06em] text-bone">
          {title}
        </h2>
        {note ? <span className="ui-label">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

export default async function ActivitiesPage() {
  const oauthConfigured = isBungieOAuthConfigured();
  const week = await loadHomeThisWeek();
  const featuredSlugs = new Set([
    ...week.raids.map((entry) => entry.slug),
    ...week.dungeons.map((entry) => entry.slug),
  ]);

  const raids = sortNewestFirst(RAIDS);
  // Not playable right now. When Bungie unvaults one, move it into RAIDS.
  const retiredRaids = sortNewestFirst([...LEGACY_RAIDS, ...RAID_LAIRS]);
  const dungeons = sortNewestFirst(DUNGEONS);

  const card = (entry: ActivityEntry, size: "lg" | "md" | "sm" = "lg", muted = false) => (
    <ActivityCard
      key={entry.slug}
      href={entry.available ? `/activities/${entry.slug}` : undefined}
      title={entry.title}
      label={activityEraLabel(entry.slug)}
      imageUrl={activityImage(entry)}
      featured={featuredSlugs.has(entry.slug)}
      size={size}
      muted={muted}
      tone="home"
    >
      <ActivityCardProgress slug={entry.slug} variant="bar" />
    </ActivityCard>
  );

  return (
    <SectionPageLayout
      title="Activities"
      imageUrl={PAGE_HEADERS.radLoot}
      oauthConfigured={oauthConfigured}
      maxWidth="wide"
    >
      <ActivitiesProgressProvider>
        <div className="space-y-12">
          <nav aria-label="Jump to" className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="inline-flex h-10 items-center border border-white/[0.22] px-4 font-display text-sm uppercase tracking-[0.12em] text-bone/80 transition hover:border-bone hover:text-white"
              >
                {section.label}
              </a>
            ))}
          </nav>

          <Section
            id="this-week"
            title="This week"
            note="Weekly reset Tuesday 17:00 UTC"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[...week.raids, ...week.dungeons].map((entry) => (
                <ActivityCard
                tone="home"
                  key={entry.slug}
                  href={`/activities/${entry.slug}`}
                  title={entry.title}
                  label={
                    week.raids.includes(entry) ? "Featured raid" : "Featured dungeon"
                  }
                  imageUrl={activityImage(entry)}
                  size="sm"
                  highlight
                />
              ))}
            </div>
          </Section>

          <Section id="raids" title="Raids" note={`${raids.length} playable`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {raids.map((entry) => card(entry))}
            </div>
            {retiredRaids.length > 0 ? (
              <details open className="ui-panel group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <span className="ui-label">
                    Vaulted Raids &amp; Raid Lairs
                  </span>
                  <span className="ui-label">{retiredRaids.length}</span>
                </summary>
                <div className="grid gap-2.5 px-4 pb-4 sm:grid-cols-3 lg:grid-cols-5">
                  {retiredRaids.map((entry) => card(entry, "sm", true))}
                </div>
              </details>
            ) : null}
          </Section>

          <Section
            id="dungeons"
            title="Dungeons"
            note={`${dungeons.length} dungeons`}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dungeons.map((entry) => card(entry, "md"))}
            </div>
          </Section>

          <Section id="playlists" title="Playlists">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ActivityCard
                tone="home"
                href="/activities/vanguard-ops"
                title="Vanguard Ops"
                label="PvE"
                imageUrl="/images/pve-activities/activities/vanguard-ops.webp"
                size="md"
              />
              <ActivityCard
                tone="home"
                href="/activities/gambit"
                title="Gambit"
                label="PvE · PvP"
                imageUrl="/images/pve-activities/activities/gambit.webp"
                size="md"
              />
              <ActivityCard
                tone="home"
                href="/activities/crucible"
                title="Crucible"
                label="PvP"
                imageUrl="/images/pvp-activities/activities/crucible.webp"
                size="md"
              />
              <ActivityCard
                tone="home"
                href="/activities/trials-of-osiris"
                title="Trials of Osiris"
                label={
                  week.trials.maps.length > 0
                    ? "PvP · this weekend"
                    : week.trials.source === "iron-banner"
                      ? "PvP · paused for Iron Banner"
                      : "PvP · returns Friday"
                }
                imageUrl="/images/pvp-activities/activities/trials-of-osiris.webp"
                size="md"
              >
                {week.trials.maps.length > 0 ? (
                  <span className="text-on-art relative text-[13px] text-bone/80">
                    {week.trials.maps.map((map) => map.name).join(" · ")}
                  </span>
                ) : null}
              </ActivityCard>
              <ActivityCard
                tone="home"
                href="/activities/iron-banner"
                title="Iron Banner"
                label={
                  week.ironBanner.live
                    ? `PvP · live until ${formatDay(week.ironBanner.endMs)}`
                    : `PvP · next ${formatDay(week.ironBanner.nextStartMs)}`
                }
                imageUrl="/images/pvp-activities/activities/iron-banner.webp"
                size="md"
              />
              <ActivityCard
                tone="home"
                href="/activities/sparrow-racing-league"
                title="Sparrow Racing League"
                label="Racing · Monument of Triumph"
                imageUrl="/images/pve-activities/activities/sparrow-racing-league.webp"
                size="md"
              />
            </div>
          </Section>

          <Section id="destinations" title="Destinations" note="10 destinations · 5 vaulted">
            <ActivityCard
                tone="home"
              href="/activities/destinations"
              title="Destinations"
              label="Loot, triumphs and seals per destination"
              imageUrl={PAGE_HEADERS.destinations}
            />
          </Section>

          <Section id="endgame" title="Endgame">
            <div className="grid gap-3 sm:grid-cols-2">
              <ActivityCard
                href={`/activities/${PANTHEON.slug}`}
                title="Pantheon"
                label={activityEraLabel(PANTHEON.slug)}
                imageUrl={activityImage(PANTHEON)}
                imagePosition="72% center"
                featured={featuredSlugs.has(PANTHEON.slug)}
                tone="home"
              >
                <ActivityCardProgress slug={PANTHEON.slug} variant="bar" />
              </ActivityCard>
              <ActivityCard
                tone="home"
                href="/activities/monument-of-triumph"
                title="Monument of Triumph"
                label="Triumphs & loot"
                imageUrl="/images/banners/monument-of-triumph.webp"
              />
            </div>
          </Section>

          <Section id="events" title="Events" note="Coming soon">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {EVENTS.map((event) => (
                <div
                  key={event.title}
                  className="flex min-h-[104px] items-center gap-3 border border-white/[0.14] bg-panel/70 px-4 opacity-60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/images/seasons/${event.icon}`}
                    alt=""
                    aria-hidden
                    className="h-9 w-9 shrink-0 object-contain"
                  />
                  <span className="font-display text-base font-semibold uppercase leading-tight tracking-[0.06em] text-bone">
                    {event.title}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </ActivitiesProgressProvider>
    </SectionPageLayout>
  );
}
