import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Leviathan, Eater of Worlds" Raid Lair';
const PRESTIGE_SOURCE =
  'Source: "Leviathan, Eater of Worlds" Raid Lair (Prestige)';

const LEVIATHAN_ICON =
  "/common/destiny2_content/icons/99dd675e20df42d2451400ceb3636223.png";

export const eaterOfWorldsLoot: ActivityLootPage = {
  slug: "eater-of-worlds",
  title: "Eater of Worlds",
  headerImageFile: "eater-of-worlds-header.webp",
  armorSetPreviewFiles: ["eater-of-worlds.webp"],
  completionsLabel: "Raid Lair Completions",
  triumphPanel: {
    name: "Eater of Worlds",
    description: 'Triumphs for the "Leviathan, Eater of Worlds" raid lair.',
    iconPath: LEVIATHAN_ICON,
    recordHashes: [],
    records: [
      {
        recordHash: "1418680653",
        name: "A Whole Buffet",
        description:
          'Complete the "Leviathan, Eater of Worlds" raid lair.',
        iconPath:
          "/common/destiny2_content/icons/cccae615320fc0f4cf1a848ac82e47d8.png",
        score: 0,
        forTitleGilding: false,
        progressStyle: "default",
        objectives: [],
        rewards: [],
      },
      {
        recordHash: "2295263731",
        name: "Fine Dining",
        description:
          'Complete the "Leviathan, Eater of Worlds" raid lair on Prestige difficulty.',
        iconPath:
          "/common/destiny2_content/icons/cccae615320fc0f4cf1a848ac82e47d8.png",
        score: 0,
        forTitleGilding: false,
        progressStyle: "default",
        objectives: [],
        rewards: [],
      },
    ],
  },
  armorSets: [
    {
      setName: "Feltroc",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "781488881",
          "Mask of Feltroc",
          "/common/destiny2_content/icons/c68a05baa99e6738f23526ce22cac243.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3693007688",
          "Grips of Feltroc",
          "/common/destiny2_content/icons/3848050dcd893353848aea51e0c30db9.jpg",
          SOURCE,
        ),
        chest: item(
          "4240859456",
          "Vest of Feltroc",
          "/common/destiny2_content/icons/f5409b6d4e268ae15f0a1e6d49f1fe23.jpg",
          SOURCE,
        ),
        legs: item(
          "75025442",
          "Boots of Feltroc",
          "/common/destiny2_content/icons/ed4ffee27161a6e95428f4a4436ec165.jpg",
          SOURCE,
        ),
        classItem: item(
          "3168014845",
          "Cloak of Feltroc",
          "/common/destiny2_content/icons/e11f0b33f7fdb804d13510adfc3b23eb.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Nohr",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "3731175213",
          "Mask of Nohr",
          "/common/destiny2_content/icons/00f026830789f2e7eb417e73120e2cf6.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "88873628",
          "Gauntlets of Nohr",
          "/common/destiny2_content/icons/b9432529571bc052d0b4fac48aa92f42.jpg",
          SOURCE,
        ),
        chest: item(
          "2938125956",
          "Plate of Nohr",
          "/common/destiny2_content/icons/dfca80f8265b17f62a682705b039ec15.jpg",
          SOURCE,
        ),
        legs: item(
          "3386768934",
          "Greaves of Nohr",
          "/common/destiny2_content/icons/231f343785adefba312e655809e52c6f.jpg",
          SOURCE,
        ),
        classItem: item(
          "3681852889",
          "Mark of Nohr",
          "/common/destiny2_content/icons/061aa3945be9ee11910e0bc6442e1a6c.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Sekris",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "161336786",
          "Mask of Sekris",
          "/common/destiny2_content/icons/b0bf556c8467ea57d0215b9c88968059.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "627690043",
          "Wraps of Sekris",
          "/common/destiny2_content/icons/96a6a802c7fb6452b58dc06ba1063df4.jpg",
          SOURCE,
        ),
        chest: item(
          "1877424533",
          "Robes of Sekris",
          "/common/destiny2_content/icons/2b9aa9b4b836946dfd6fe06814da8e8a.jpg",
          SOURCE,
        ),
        legs: item(
          "3331120813",
          "Boots of Sekris",
          "/common/destiny2_content/icons/ac2c77e1bebf74dc8aa0cb1c6a202816.jpg",
          SOURCE,
        ),
        classItem: item(
          "574916072",
          "Bond of Sekris",
          "/common/destiny2_content/icons/c1f4ecc5bcaba100d27a0dc00e15d7f1.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3886263130",
      "I Am Alive",
      "/common/destiny2_content/icons/4e653426fca30011fdeba6eb05f2bac9.jpg",
      SOURCE,
    ),
    item(
      "2707464805",
      "Zenith of Your Kind",
      "/common/destiny2_content/icons/ff4c10ccb8da555bd64bf15fb0d5d3aa.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "4261480751",
      "Emperor's Envy",
      "/common/destiny2_content/icons/2764c187b9825ab92fd04db8d06a41f3.jpg",
      SOURCE,
    ),
    item(
      "4261480750",
      "Covetous Emperor",
      "/common/destiny2_content/icons/0ac952bfff905b3cb44195a2400e2797.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "4242407217",
      "Calus's Elite",
      "/common/destiny2_content/icons/621d5e512f5cb507fdb670ec477b7c55.jpg",
      SOURCE,
    ),
    item(
      "4242407216",
      "Calus's Preferred",
      "/common/destiny2_content/icons/b6b00b9dbdc049f430c92213137a60de.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "113124080",
      "Contender's Shell",
      "/common/destiny2_content/icons/b4be50b8f7a198175de791f15932c2c7.jpg",
      SOURCE,
    ),
    item(
      "1928662068",
      "Eater of Worlds Ornament",
      "/common/destiny2_content/icons/6b18876fa6649bdb238de4044ca28117.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "2837735361",
      "Eater of Worlds Ornament",
      "/common/destiny2_content/icons/f8ba56c085baf89694805ef0fd9b7d65.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "3991114670",
      "Eater of Worlds Ornament",
      "/common/destiny2_content/icons/150a4a29838c9218638d271989f40ddf.jpg",
      PRESTIGE_SOURCE,
    ),
    item(
      "640058316",
      "Telesto Catalyst",
      "/common/destiny2_content/icons/3b8175fb92ee774d15d25fed58dca619.jpg",
      PRESTIGE_SOURCE,
    ),
  ],
};
