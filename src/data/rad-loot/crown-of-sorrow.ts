import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Acquired from the raid "Crown of Sorrow."';

const CROWN_ICON =
  "/common/destiny2_content/icons/d08f27b6273edf99a245b762255863b2.png";

export const crownOfSorrowLoot: ActivityLootPage = {
  slug: "crown-of-sorrow",
  title: "Crown of Sorrow",
  headerImageFile: "crown-of-sorrow-header.webp",
  armorSetPreviewFiles: ["crown-of-sorrow.webp"],
  triumphPanel: {
    name: "Crown of Sorrow",
    description: 'Triumphs for the "Crown of Sorrow" raid.',
    iconPath: CROWN_ICON,
    recordHashes: [],
    records: [
      {
        recordHash: "3292013047",
        name: "In the Shadow of the Kingdom of Sorrow",
        description: 'Complete the "Crown of Sorrow" raid.',
        iconPath:
          "/common/destiny2_content/icons/f956c407353c4371b5d234ba98de3e7d.png",
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
      setName: "Shadow of Silence",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "326149062",
          "Shadow's Mask",
          "/common/destiny2_content/icons/a4216ff2fbd20a77c85f919a54b357cb.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "4017853847",
          "Shadow's Grips",
          "/common/destiny2_content/icons/7ca9fd030e99467eac7d66f13bc891ab.jpg",
          SOURCE,
        ),
        chest: item(
          "942205921",
          "Shadow's Vest",
          "/common/destiny2_content/icons/13e0b1e8a06c6882454cd9f5ba03ca5a.jpg",
          SOURCE,
        ),
        legs: item(
          "1107067065",
          "Shadow's Strides",
          "/common/destiny2_content/icons/17c67d2d6ff6839c57dd63d7820ce54f.jpg",
          SOURCE,
        ),
        classItem: item(
          "2149271612",
          "Penumbral Cloak",
          "/common/destiny2_content/icons/b773d7a27b6e3312764ed45c1bc249db.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Shadow of War",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "1129634130",
          "Shadow's Helm",
          "/common/destiny2_content/icons/7bda10a27ec0571c12663bd88bed4bac.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1595987387",
          "Shadow's Gauntlets",
          "/common/destiny2_content/icons/939241f23f452bfb996ceab1db3acd8d.jpg",
          SOURCE,
        ),
        chest: item(
          "3406713877",
          "Shadow's Plate",
          "/common/destiny2_content/icons/847c144bb379f365b8b4cc0d60fa7fc0.jpg",
          SOURCE,
        ),
        legs: item(
          "4450861",
          "Shadow's Greaves",
          "/common/destiny2_content/icons/75e3af034764f29c9d92d227e60015ae.jpg",
          SOURCE,
        ),
        classItem: item(
          "2104205416",
          "Penumbral Mark",
          "/common/destiny2_content/icons/e425e5dbbb30a8d0e8db457aa6ba8ec1.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Shadow of Judgment",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2472794149",
          "Shadow's Mind",
          "/common/destiny2_content/icons/b7c7f250d1155521c9c1e08e2c4337fc.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "3211894260",
          "Shadow's Gloves",
          "/common/destiny2_content/icons/3e77fad56b9c109e942658ea16cb8911.jpg",
          SOURCE,
        ),
        chest: item(
          "3381758732",
          "Shadow's Robes",
          "/common/destiny2_content/icons/bee7786e1bf71ff7a4ddd41d66a014b5.jpg",
          SOURCE,
        ),
        legs: item(
          "3499632894",
          "Shadow's Boots",
          "/common/destiny2_content/icons/9aa711718dee67794ddf9719a4afcec3.jpg",
          SOURCE,
        ),
        classItem: item(
          "1319515713",
          "Penumbral Bond",
          "/common/destiny2_content/icons/a011a4967fd4b4e5aa224cadd33583b6.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "3110698812",
      "Tarrabah",
      "/common/destiny2_content/icons/88ea7e35e14f29c4cda6588cb258333b.jpg",
      SOURCE,
    ),
    item(
      "1496419775",
      "Bane of Sorrow",
      "/common/destiny2_content/icons/fd47d816b0142673c275a716c7c0ad1e.jpg",
      SOURCE,
    ),
    item(
      "2338088853",
      "Calusea Noblesse",
      "/common/destiny2_content/icons/6e582dd0d6c845dc49739a0d4a76b5cb.jpg",
      SOURCE,
    ),
    item(
      "3861448240",
      "Emperor's Courtesy",
      "/common/destiny2_content/icons/180d93d2e77bf57dc92b6411cc789c9b.jpg",
      SOURCE,
    ),
    item(
      "1286686760",
      "Gahlran's Right Hand",
      "/common/destiny2_content/icons/25114e19e04692005e46509e6055cc48.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "1661191193",
      "Crown of Sorrow",
      "/common/destiny2_content/icons/75d4d1578bce1bb04def8c498f6508bf.jpg",
      SOURCE,
    ),
    item(
      "1661191198",
      "Heavy Is the Crown",
      "/common/destiny2_content/icons/47be45970780f576ae0aa7e0cd4593f2.jpg",
      SOURCE,
    ),
    item(
      "2027598066",
      "Imperial Opulence",
      "/common/destiny2_content/icons/0b24b8f75b789fee9062318b089bcf81.jpg",
      SOURCE,
    ),
    item(
      "2027598067",
      "Imperial Dress",
      "/common/destiny2_content/icons/26a6278b49dd8fb2095a2ecbca94bb3c.jpg",
      SOURCE,
    ),
  ],
};
