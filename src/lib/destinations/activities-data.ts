import rawActivities from "../../../data/destination-activities.json";
import type { DestinationActivities } from "@/lib/destinations/activities";

/** Server only: the page passes one destination's blocks to the client section. */
const ACTIVITIES = rawActivities as unknown as Record<string, DestinationActivities>;

export function getDestinationActivities(slug: string): DestinationActivities | null {
  return ACTIVITIES[slug] ?? null;
}
