"use client";

import { ActivityBannerSmall } from "@/components/activity-banner-small";
import {
  GAMBIT,
  getPveActivityHref,
  PVE_ACTIVITY_IMAGE_BASE_PATH,
  RAD_LOOT,
  VANGUARD_OPS,
} from "@/data/pve-activities/activities";

export function PveActivitiesPageContent() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
      <section className="order-1 w-full min-w-0 md:col-span-2 md:row-start-1">
        <ActivityBannerSmall
          entry={VANGUARD_OPS}
          imageBasePath={PVE_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPveActivityHref}
        />
      </section>

      <section className="order-2 w-full min-w-0 md:col-start-1 md:row-start-2">
        <ActivityBannerSmall
          entry={GAMBIT}
          imageBasePath={PVE_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPveActivityHref}
        />
      </section>

      <section className="order-3 w-full min-w-0 md:col-start-2 md:row-start-2">
        <ActivityBannerSmall
          entry={RAD_LOOT}
          imageBasePath={PVE_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPveActivityHref}
        />
      </section>
    </div>
  );
}
