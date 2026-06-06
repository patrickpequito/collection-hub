import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Ghosts of the Deep" Dungeon';

export const ghostsOfTheDeepLoot: ActivityLootPage = {
  slug: "ghosts-of-the-deep",
  title: "Ghosts of the Deep",
  headerImageFile: "ghosts-of-the-deep-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Taken King",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "896458489",
          "Mask of the Taken King",
          "/common/destiny2_content/icons/12906f842e4ec39b154abc63714a2930.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "409820272",
          "Grasps of the Taken King",
          "/common/destiny2_content/icons/f3e9c08fad250b37f4bc80e1cf27330d.jpg",
          SOURCE,
        ),
        chest: item(
          "42941848",
          "Vest of the Taken King",
          "/common/destiny2_content/icons/3c0070209fc20151d36aafeb136e4eb4.jpg",
          SOURCE,
        ),
        legs: item(
          "726878794",
          "Strides of the Taken King",
          "/common/destiny2_content/icons/3b3899f918f114584e9fcabcc5172d44.jpg",
          SOURCE,
        ),
        classItem: item(
          "2733403573",
          "Cloak of the Taken King",
          "/common/destiny2_content/icons/1dbc67cd91c80f3900316d4a893eb98a.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Taken King",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2324998093",
          "Helm of the Taken King",
          "/common/destiny2_content/icons/e19bcdecea18a1f340da743af65f5cdf.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2977663932",
          "Gauntlets of the Taken King",
          "/common/destiny2_content/icons/d8c62f419bbe312cc99a07394b110f95.jpg",
          SOURCE,
        ),
        chest: item(
          "2978918436",
          "Plate of the Taken King",
          "/common/destiny2_content/icons/2a6fdaefc9c8e3995a175797ad92523c.jpg",
          SOURCE,
        ),
        legs: item(
          "2363472582",
          "Greaves of the Taken King",
          "/common/destiny2_content/icons/eb008cf5ac5d8e89d79e30f48ae9822b.jpg",
          SOURCE,
        ),
        classItem: item(
          "3722748537",
          "Mark of the Taken King",
          "/common/destiny2_content/icons/969039fa3ca3acf8ac8ac24d48f3a1d8.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Taken King",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "540625098",
          "Hood of the Taken King",
          "/common/destiny2_content/icons/f1d38cbf2695a86a0f7bff8cb1764fd0.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "587762963",
          "Gloves of the Taken King",
          "/common/destiny2_content/icons/a1a4e139a5e2d4226446bdb4649ba3d0.jpg",
          SOURCE,
        ),
        chest: item(
          "457617725",
          "Vestment of the Taken King",
          "/common/destiny2_content/icons/132a7e3c25198f5a800bb842291e273e.jpg",
          SOURCE,
        ),
        legs: item(
          "322717029",
          "Boots of the Taken King",
          "/common/destiny2_content/icons/c81ddc9f121d569d11ffe6d1fb624b06.jpg",
          SOURCE,
        ),
        classItem: item(
          "1961182320",
          "Bond of the Taken King",
          "/common/destiny2_content/icons/8728b0c2212501ad4af818f4b9217c41.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "839786290",
      "Cold Comfort",
      "/common/destiny2_content/icons/59fd706fd8c7493275c14e316c5d05e8.jpg",
      SOURCE,
    ),
    item(
      "1757202961",
      "Greasy Luck",
      "/common/destiny2_content/icons/38548bbbcec406376de3c1a032f0ac3a.jpg",
      SOURCE,
    ),
    item(
      "1125217994",
      "New Pacific Epitaph",
      "/common/destiny2_content/icons/8badd2112f3bb7431f7d218e3ef10b33.jpg",
      SOURCE,
    ),
    item(
      "3262192268",
      "No Survivors",
      "/common/destiny2_content/icons/68e6dcff48514d8b331072aad550e923.jpg",
      SOURCE,
    ),
    item(
      "1081724548",
      "Rapacious Appetite",
      "/common/destiny2_content/icons/bfd7f8d9a9ab08749b0e67458f93ba87.jpg",
      SOURCE,
    ),
    item(
      "1441805468",
      "The Navigator",
      "/common/destiny2_content/icons/4984c634a7d2eca3baafc000a121263d.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "2069797998",
      "A Grave Matter",
      "/common/destiny2_content/icons/cb01f3cbfd11000b1d19537e73922f55.jpg",
      SOURCE,
    ),
    item(
      "2274944459",
      "Recalcitrant Host",
      "/common/destiny2_content/icons/36fe7820314774ba1e0d1ae657f1021d.jpg",
      SOURCE,
    ),
    item(
      "2069797999",
      "Regicide",
      "/common/destiny2_content/icons/0ce20cb371a88b4421203eae65ff2058.jpg",
      SOURCE,
    ),
  ],
};
