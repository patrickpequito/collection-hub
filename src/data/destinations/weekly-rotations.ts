/**
 * Weekly destination rotations Bungie does not expose in the API, filled in by hand.
 * `anchorWeek` = rotationWeekIndex() of a week where `order[0]` was active
 * (week 19 = Oct 20–27, 2026). null = not confirmed yet, so the card is hidden.
 * Europa week 19 confirmed in game: Eventide Ruins · The Dark Priestess · Survival.
 * Order of the other two weeks still provisional until the Oct 27 reset.
 */
export type ManualRotation = {
  label: string;
  anchorWeek: number | null;
  /** In-game order; the list repeats. */
  order: { name: string; detail: string }[];
};

export const EUROPA_ROTATIONS: ManualRotation[] = [
  {
    label: "Eclipsed zone",
    anchorWeek: 17,
    order: [
      { name: "Asterion Abyss", detail: "Europa" },
      { name: "Cadmus Ridge", detail: "Europa" },
      { name: "Eventide Ruins", detail: "Europa" },
    ],
  },
  {
    label: "Empire Hunt",
    anchorWeek: 17,
    order: [
      { name: "The Warrior", detail: "Phylaks" },
      { name: "The Technocrat", detail: "Praksis" },
      { name: "The Dark Priestess", detail: "Kridis" },
    ],
  },
  {
    label: "Exo Challenge",
    anchorWeek: 17,
    order: [
      { name: "Agility", detail: "Exo Simulation" },
      { name: "Safeguard", detail: "Exo Simulation" },
      { name: "Survival", detail: "Exo Simulation" },
    ],
  },
];

/**
 * Dreaming City: three-week curse cycle; Blind Well enemies and Petra's spot follow it.
 * Week 19 seen in game: curse Weak, Blind Well Scorn, Petra at The Strand,
 * Ascendant Challenge Agonarch Abyss (not fully confirmed). Later Blind Well /
 * Petra entries are provisional until checked after each reset.
 */
export const DREAMING_CITY_CURSE = {
  anchorWeek: 19 as number | null,
  levels: ["Weak", "Growing", "Strongest"],
};

export const DREAMING_CITY_ROTATIONS: ManualRotation[] = [
  {
    label: "Petra's location",
    anchorWeek: 19,
    order: [
      { name: "The Strand", detail: "Dreaming City" },
      { name: "Divalian Mists", detail: "Dreaming City" },
      { name: "Rheasilvia", detail: "Dreaming City" },
    ],
  },
  {
    label: "Blind Well",
    anchorWeek: 19,
    order: [
      { name: "Scorn", detail: "Changes with the curse" },
      { name: "Hive", detail: "Changes with the curse" },
      { name: "Taken", detail: "Changes with the curse" },
    ],
  },
  {
    // Six-week loop in the order the game runs it.
    label: "Ascendant Challenge",
    anchorWeek: 19,
    order: [
      { name: "Agonarch Abyss", detail: "Bay of Drowned Wishes" },
      { name: "Cimmerian Garrison", detail: "Chamber of Starlight" },
      { name: "Ouroborea", detail: "Aphelion's Rest" },
      { name: "Forfeit Shrine", detail: "Gardens of Esila" },
      { name: "Shattered Ruins", detail: "Spine of Keres" },
      { name: "Keep of Honed Edges", detail: "Harbinger's Seclude" },
    ],
  },
];

/**
 * Throne World: weekly Witch Queen campaign mission and the two Altars of Reflection.
 * Week 19 seen in game: The Cunning ("El engaño"); altars Insight + Choice.
 * Mission order follows the campaign and the altar pairing is provisional until checked.
 */
export const THRONE_WORLD_ROTATIONS: ManualRotation[] = [
  {
    label: "Weekly mission",
    anchorWeek: 14,
    order: [
      { name: "The Arrival", detail: "The Witch Queen campaign" },
      { name: "The Investigation", detail: "The Witch Queen campaign" },
      { name: "The Ghosts", detail: "The Witch Queen campaign" },
      { name: "The Communion", detail: "The Witch Queen campaign" },
      { name: "The Mirror", detail: "The Witch Queen campaign" },
      { name: "The Cunning", detail: "The Witch Queen campaign" },
      { name: "The Last Chance", detail: "The Witch Queen campaign" },
      { name: "The Ritual", detail: "The Witch Queen campaign" },
    ],
  },
  {
    label: "Altars of Reflection",
    anchorWeek: 19,
    order: [
      { name: "Insight · Choice", detail: "Tablet of Ruin · Crystal shard" },
      { name: "Pact · Catalyst", detail: "Sagira's shell · The Enigma" },
    ],
  },
];
