"use client";

import { ActivityBannerSmall } from "@/components/activity-banner-small";
import {
  CRUCIBLE,
  getPvpActivityHref,
  IRON_BANNER,
  PVP_ACTIVITY_IMAGE_BASE_PATH,
  TRIALS_OF_OSIRIS,
} from "@/data/pvp-activities/activities";

export function PvpActivitiesPageContent() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
      <section className="order-1 w-full min-w-0 md:col-span-2 md:row-start-1">
        <ActivityBannerSmall
          entry={CRUCIBLE}
          imageBasePath={PVP_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPvpActivityHref}
        />
      </section>

      <section className="order-2 w-full min-w-0 md:col-start-1 md:row-start-2">
        <ActivityBannerSmall
          entry={IRON_BANNER}
          imageBasePath={PVP_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPvpActivityHref}
        />
      </section>

      <section className="order-3 w-full min-w-0 md:col-start-2 md:row-start-2">
        <ActivityBannerSmall
          entry={TRIALS_OF_OSIRIS}
          imageBasePath={PVP_ACTIVITY_IMAGE_BASE_PATH}
          getHref={getPvpActivityHref}
        />
      </section>
    </div>
  );
}
