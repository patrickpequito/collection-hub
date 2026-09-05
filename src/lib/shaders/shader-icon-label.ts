import { resolveDisplayLabelFromIconPath } from "@/lib/all-loot/season-icon-label";
import { resolveVersionDisplayLabel } from "@/lib/all-loot/season-badges";
import type { AllLootItem } from "@/types/all-loot";

/**
 * Section label for a shader: icon watermark first (event or season), then
 * catalog event/season fields after icon-first overrides.
 */
export function resolveShaderSectionLabel(item: AllLootItem): string {
  return (
    resolveDisplayLabelFromIconPath(item.seasonIconPath) ||
    resolveVersionDisplayLabel(item) ||
    item.seasonLabel ||
    "Unknown"
  );
}
