import { ClientOwnership } from "@/components/client-ownership";
import { ExpansionsIndexContent } from "@/components/expansions/expansions-index-content";
import { SectionPageLayout } from "@/components/section-page-layout";
import {
  getExpansionHub,
  PUBLISHED_EXPANSION_SLUGS,
} from "@/data/expansions";
import { buildExpansionProgressInputs } from "@/lib/expansions/build-expansion-progress-inputs";
import { buildSeasonProgressInputs } from "@/lib/seasons/build-season-progress-inputs";
import { resolveExpansionLoot } from "@/lib/expansions/resolve-expansion-loot";
import { isBungieOAuthConfigured } from "@/lib/env";
import { getTitleEntry, loadTriumphCatalog } from "@/lib/triumphs/load";
import {
  getSeasonHub,
  PUBLISHED_SEASON_SLUGS,
} from "@/data/seasons";

export const revalidate = 3600;

export default async function ExpansionsPage() {
  const oauthConfigured = isBungieOAuthConfigured();

  const catalog = await loadTriumphCatalog();
  const [progressInputs, seasonProgressInputs] = await Promise.all([
    Promise.all(
      [...PUBLISHED_EXPANSION_SLUGS].map(async (slug) => {
        const hub = getExpansionHub(slug);
        if (!hub) {
          throw new Error(`Missing expansion hub: ${slug}`);
        }
        const loot = await resolveExpansionLoot(hub);
        const title = hub.titleSlug
          ? (getTitleEntry(catalog, hub.titleSlug) ?? null)
          : null;
        return buildExpansionProgressInputs(slug, loot, title);
      }),
    ),
    Promise.all(
      [...PUBLISHED_SEASON_SLUGS].map(async (slug) => {
        if (!getSeasonHub(slug)) {
          throw new Error(`Missing season hub: ${slug}`);
        }
        return buildSeasonProgressInputs(slug);
      }),
    ),
  ]);

  return (
    <SectionPageLayout
      title="Expansions & Seasons"
      imageUrl="/images/banners/expansions-seasons.webp"
      oauthConfigured={oauthConfigured}
      maxWidth="5xl"
    >
      <ClientOwnership showSignInHint={false}>
        <ExpansionsIndexContent
          progressInputs={progressInputs}
          seasonProgressInputs={seasonProgressInputs}
        />
      </ClientOwnership>
    </SectionPageLayout>
  );
}
