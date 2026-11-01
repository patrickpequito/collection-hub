/**
 * Weekly destination rotations Bungie does not expose in the API, filled in by hand.
 * `anchorWeek` = rotationWeekIndex() of a week where `order[0]` was active
 * (week 19 = Oct 20–27, 2026). null = not confirmed yet, so the card is hidden.
 * Europa week 19 confirmed in game: Eventide Ruins · The Dark Priestess · Survival;
 * week 20 (Oct 27): Asterion Abyss · The Warrior · Agility, so the order below is confirmed.
 */
const PGCR = "/img/destiny_content/pgcr/";
/** Activities Bungie has no art for: the owner's screenshots / tinted destination art. */
const ECLIPSED = "/images/destinations/weekly/europa-eclipsed-zone.webp";
const PETRA = "/images/destinations/weekly/dreaming-city-petra.webp";
const BLIND_WELL = "/images/destinations/weekly/dreaming-city-blind-well.webp";
const ASCENDANT = "/images/destinations/weekly/dreaming-city-ascendant-challenge.webp";

export type ManualRotation = {
  label: string;
  anchorWeek: number | null;
  /** Order confirmed in game over a full cycle (admin shows it as "Confirmed"). */
  confirmed?: boolean;
  /** In-game order; the list repeats. `image`: Bungie pgcr path or /images/… art for the card. */
  order: { name: string; detail: string; image?: string }[];
};

export const EUROPA_ROTATIONS: ManualRotation[] = [
  {
    label: "Eclipsed zone",
    confirmed: true,
    anchorWeek: 17,
    order: [
      { name: "Asterion Abyss", detail: "Europa", image: ECLIPSED },
      { name: "Cadmus Ridge", detail: "Europa", image: ECLIPSED },
      { name: "Eventide Ruins", detail: "Europa", image: ECLIPSED },
    ],
  },
  {
    label: "Empire Hunt",
    confirmed: true,
    anchorWeek: 17,
    order: [
      { name: "The Warrior", detail: "Phylaks", image: `${PGCR}empire-hunt-chowder.jpg` },
      { name: "The Technocrat", detail: "Praksis", image: `${PGCR}empire-hunt-chili.jpg` },
      { name: "The Dark Priestess", detail: "Kridis", image: `${PGCR}empire-hunt-gumbo.jpg` },
    ],
  },
  {
    label: "Exo Challenge",
    confirmed: true,
    anchorWeek: 17,
    order: [
      { name: "Agility", detail: "Exo Simulation", image: `${PGCR}exo-challenge-parkour.jpg` },
      { name: "Safeguard", detail: "Exo Simulation", image: `${PGCR}exo-challenge-defense.jpg` },
      { name: "Survival", detail: "Exo Simulation", image: `${PGCR}exo-challenge-survival.jpg` },
    ],
  },
];

/**
 * Dreaming City: three-week curse cycle; Blind Well enemies and Petra's spot follow it.
 * Week 19 seen in game: curse Weak, Blind Well Scorn, Petra at The Strand,
 * Ascendant Challenge Agonarch Abyss (not fully confirmed). Week 20 (Oct 27): curse
 * Growing, Blind Well Hive, Petra at Divalian Mists (Ascendant Challenge not checked).
 */
export const DREAMING_CITY_CURSE = {
  anchorWeek: 19 as number | null,
  levels: ["Weak", "Growing", "Strongest"],
};

export const DREAMING_CITY_ROTATIONS: ManualRotation[] = [
  {
    label: "Petra's location",
    confirmed: true,
    anchorWeek: 19,
    order: [
      { name: "The Strand", detail: "Dreaming City", image: PETRA },
      { name: "Divalian Mists", detail: "Dreaming City", image: PETRA },
      { name: "Rheasilvia", detail: "Dreaming City", image: PETRA },
    ],
  },
  {
    label: "Blind Well",
    confirmed: true,
    anchorWeek: 19,
    order: [
      { name: "Scorn", detail: "Changes with the curse", image: BLIND_WELL },
      { name: "Hive", detail: "Belhor, Teraph, Mholoch · final boss Cragur", image: BLIND_WELL },
      { name: "Taken", detail: "Changes with the curse", image: BLIND_WELL },
    ],
  },
  {
    // Six-week loop in the order the game runs it.
    label: "Ascendant Challenge",
    anchorWeek: 19,
    order: [
      { name: "Agonarch Abyss", detail: "Bay of Drowned Wishes", image: ASCENDANT },
      { name: "Cimmerian Garrison", detail: "Chamber of Starlight", image: ASCENDANT },
      { name: "Ouroborea", detail: "Aphelion's Rest", image: ASCENDANT },
      { name: "Forfeit Shrine", detail: "Gardens of Esila", image: ASCENDANT },
      { name: "Shattered Ruins", detail: "Spine of Keres", image: ASCENDANT },
      { name: "Keep of Honed Edges", detail: "Harbinger's Seclude", image: ASCENDANT },
    ],
  },
];

/**
 * Throne World: weekly Witch Queen campaign mission and the two Altars of Reflection.
 * Week 19 seen in game: The Cunning ("El engaño"); altars Insight + Choice.
 * Week 20 (Oct 27): The Last Chance; altars Insight + Catalyst. Insight looks fixed and the
 * second altar rotates; Pact as the third week is a guess until checked.
 */
export const THRONE_WORLD_ROTATIONS: ManualRotation[] = [
  {
    label: "Weekly mission",
    confirmed: true,
    anchorWeek: 14,
    order: [
      { name: "The Arrival", detail: "The Witch Queen campaign", image: `${PGCR}mission_genesis.jpg` },
      { name: "The Investigation", detail: "The Witch Queen campaign", image: `${PGCR}mission_lost.jpg` },
      { name: "The Ghosts", detail: "The Witch Queen campaign", image: `${PGCR}mission_tangle.jpg` },
      { name: "The Communion", detail: "The Witch Queen campaign", image: `${PGCR}mission_igloo.jpg` },
      { name: "The Mirror", detail: "The Witch Queen campaign", image: `${PGCR}mission_recall.jpg` },
      { name: "The Cunning", detail: "The Witch Queen campaign", image: `${PGCR}mission_brimstone.jpg` },
      { name: "The Last Chance", detail: "The Witch Queen campaign", image: `${PGCR}mission_escalade.jpg` },
      { name: "The Ritual", detail: "The Witch Queen campaign", image: `${PGCR}mission_dethrone.jpg` },
    ],
  },
  {
    label: "Altars of Reflection",
    anchorWeek: 19,
    order: [
      { name: "Insight · Choice", detail: "Tablet of Ruin · Crystal shard", image: `${PGCR}shrine_a.jpg` },
      { name: "Insight · Catalyst", detail: "Tablet of Ruin · The Enigma", image: `${PGCR}shrine_b.jpg` },
      { name: "Insight · Pact", detail: "Tablet of Ruin · Sagira's shell", image: `${PGCR}shrine_a.jpg` },
    ],
  },
];

/**
 * Neomuna: the weekly Vex Incursion Zone district and Partition mission (needs Nimbus's weekly
 * Polymorphic Shellcode).
 * Week 20 (Oct 27, 2026): Ordnance, seen in game. The order of the other two is a guess
 * until the next resets confirm it.
 */
export const NEOMUNA_ROTATIONS: ManualRotation[] = [
  {
    // Week 20 (Oct 27, 2026): Ahimsa Park, seen in game. The other two districts' order is a guess.
    label: "Vex Incursion Zone",
    anchorWeek: 20,
    order: [
      { name: "Ahimsa Park", detail: "Vex reality fractures · Neomuna", image: `${PGCR}neomuna_terminal_overload_frontline.jpg` },
      { name: "Límíng Harbor", detail: "Vex reality fractures · Neomuna", image: `${PGCR}neomuna_terminal_overload_harbor.jpg` },
      { name: "Zephyr Concourse", detail: "Vex reality fractures · Neomuna", image: `${PGCR}neomuna_terminal_overload_avenue.jpg` },
    ],
  },
  {
    label: "Partition",
    anchorWeek: 20,
    order: [
      { name: "Ordnance", detail: "Upload a virus through VexNet defenses", image: `${PGCR}partition_ordinance.jpg` },
      { name: "Hard Reset", detail: "Chase a Shadow Legionary in the VexNet", image: `${PGCR}partition_hard_reset.jpg` },
      { name: "Backdoor", detail: "Defeat a Vex Mind in its stronghold", image: `${PGCR}partition_backdoor.jpg` },
    ],
  },
];

/** Destinations whose weekly rotations are entered by hand (admin panel), in page order. */
export const MANUAL_ROTATION_GROUPS: { destination: string; name: string; rotations: ManualRotation[] }[] = [
  { destination: "neomuna", name: "Neomuna", rotations: NEOMUNA_ROTATIONS },
  { destination: "throne-world", name: "Throne World", rotations: THRONE_WORLD_ROTATIONS },
  { destination: "europa", name: "Europa", rotations: EUROPA_ROTATIONS },
  { destination: "dreaming-city", name: "Dreaming City", rotations: DREAMING_CITY_ROTATIONS },
];

/** Admin / history key for a rotation, e.g. "europa:Empire Hunt". */
export const rotationKey = (destination: string, rotation: ManualRotation) => `${destination}:${rotation.label}`;
