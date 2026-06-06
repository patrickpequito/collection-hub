import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Grasp of Avarice" Dungeon';

export const graspOfAvariceLoot: ActivityLootPage = {
  slug: "grasp-of-avarice",
  title: "Grasp of Avarice",
  headerImageFile: "grasp-of-avarice-header.webp",
  completionsLabel: "Dungeon Completions",
  triumphPanel: {
    name: "Grasp of Avarice",
    description: 'Triumphs for the "Grasp of Avarice" dungeon.',
    iconPath:
      "/common/destiny2_content/icons/1406f929d0c25506a5ab5ea73956fcb3.png",
    recordHashes: [
      "4001408878",
      "2693589427",
      "678858776",
      "3718971745",
      "2411018844",
      "1770021330",
      "4233323731",
    ],
  },
  armorSets: [
    {
      setName: "Twisting Echo",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "2744480004",
          "Twisting Echo Mask",
          "/common/destiny2_content/icons/5744ada76daa869bc1845424670a437a.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2308793821",
          "Twisting Echo Grips",
          "/common/destiny2_content/icons/ac0ef0bfb6dabb1a1768725308b6f70c.jpg",
          SOURCE,
        ),
        chest: item(
          "3587911011",
          "Twisting Echo Vest",
          "/common/destiny2_content/icons/a1eb1f7b193aada9810afc8c80a509c9.jpg",
          SOURCE,
        ),
        legs: item(
          "337875583",
          "Twisting Echo Strides",
          "/common/destiny2_content/icons/5b6ff64b8b4b8243c69b9a4a1dea7b84.jpg",
          SOURCE,
        ),
        classItem: item(
          "2486733914",
          "Twisting Echo Cloak",
          "/common/destiny2_content/icons/b5fb765d8f4d4ee9fb48f918ba4444c7.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Descending Echo",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "3473581026",
          "Descending Echo Helm",
          "/common/destiny2_content/icons/c055cf24b07476cde7337ec766fa3ed2.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2771648715",
          "Descending Echo Gauntlets",
          "/common/destiny2_content/icons/0485b8492db2dc90ba67d410eeb3aaa9.jpg",
          SOURCE,
        ),
        chest: item(
          "549825413",
          "Descending Echo Cage",
          "/common/destiny2_content/icons/06096e59a10220fe5ab41fd326e32874.jpg",
          SOURCE,
        ),
        legs: item(
          "4287863773",
          "Descending Echo Greaves",
          "/common/destiny2_content/icons/67cbf27bbfe8e2fc2d1f8ff408d7f009.jpg",
          SOURCE,
        ),
        classItem: item(
          "3500810712",
          "Descending Echo Mark",
          "/common/destiny2_content/icons/752721f26c9b3d13a739db3d46524f7f.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Corrupting Echo",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1832715465",
          "Corrupting Echo Cover",
          "/common/destiny2_content/icons/2a73d17c98fd11a3bf985e1756cdb56a.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3536211008",
          "Corrupting Echo Gloves",
          "/common/destiny2_content/icons/43139ceb360f81cde34b0a3f0f8b4ba8.jpg",
          SOURCE,
        ),
        chest: item(
          "2515293448",
          "Corrupting Echo Robes",
          "/common/destiny2_content/icons/5d73b037a5a82e711b513dd725f70de1.jpg",
          SOURCE,
        ),
        legs: item(
          "2231150714",
          "Corrupting Echo Boots",
          "/common/destiny2_content/icons/55c010ec9ea72f2984234da863f7e415.jpg",
          SOURCE,
        ),
        classItem: item(
          "4217390949",
          "Corrupting Echo Bond",
          "/common/destiny2_content/icons/ebf18f8f101534ec7c76c44deae6f0d7.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "4164201232",
      "1000 Yard Stare",
      "/common/destiny2_content/icons/3759e2601c29fef3c6b9a29f95d53694.jpg",
      SOURCE,
    ),
    item(
      "235827225",
      "Eyasluna",
      "/common/destiny2_content/icons/9385daf600d89dd759c3b3f690edbc03.jpg",
      SOURCE,
    ),
    item(
      "2139640995",
      "Hero of Ages",
      "/common/destiny2_content/icons/ed519f6031aedd209acd61bbd52bb9b9.jpg",
      SOURCE,
    ),
    item(
      "2563012876",
      "Matador 64",
      "/common/destiny2_content/icons/f6bdd6d3f42abeb57770a4006475499e.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "3800278197",
      "Absolutely Cursed",
      "/common/destiny2_content/icons/4b4f1ab72cf309112748faa6940e8a41.jpg",
      SOURCE,
    ),
    item(
      "2716058777",
      "Ensilvered Snare",
      "/common/destiny2_content/icons/7d5c320a084b4fecc45b480459fa1f93.jpg",
      SOURCE,
    ),
    item(
      "983635618",
      "Gjallarswift",
      "/common/destiny2_content/icons/04dbe32dec6d27d9b74dcfb568db53a0.jpg",
      SOURCE,
    ),
    item(
      "3800278198",
      "Piratical Ambitions",
      "/common/destiny2_content/icons/5f3614bd64c0668febb1ff1ae3d1632b.jpg",
      SOURCE,
    ),
  ],
};
