import type { MetadataRoute } from "next";
import {
  activityPaths,
  destinationPaths,
  exoticItemPaths,
  expansionPaths,
  seasonPaths,
  STATIC_PATHS,
  triumphPaths,
} from "@/lib/seo-pages";

/** sitemap.xml: published pages only, rebuilt daily. */
export const revalidate = 86400;

const BASE = "https://d2collector.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [triumphs, exotics] = await Promise.all([triumphPaths(), exoticItemPaths()]);
  const entry = (path: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number) => ({
    url: `${BASE}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  });
  return [
    ...STATIC_PATHS.map((path) => entry(path, path === "/" ? "daily" : "weekly", path === "/" ? 1 : 0.8)),
    ...destinationPaths().map((path) => entry(path, "daily", 0.8)),
    ...activityPaths().map((path) => entry(path, "weekly", 0.7)),
    ...expansionPaths().map((path) => entry(path, "monthly", 0.7)),
    ...seasonPaths().map((path) => entry(path, "monthly", 0.6)),
    ...exotics.map((path) => entry(path, "monthly", 0.5)),
    ...triumphs.map((path) => entry(path, "monthly", 0.4)),
  ];
}
