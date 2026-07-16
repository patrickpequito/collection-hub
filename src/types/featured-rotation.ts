export type FeaturedRotationSchedule = {
  epochMs: number;
  dungeonWeeks: readonly (readonly string[])[];
  raidFallbackWeeks: readonly (readonly string[])[];
};
