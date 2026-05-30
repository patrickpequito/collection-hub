import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const CE_SOURCE = 'Source: "Crota\'s End" Raid';

export const crotasEndLoot: ActivityLootPage = {
  slug: "crotas-end",
  title: "Crota's End",
  headerImageFile: "crotas-end-header.webp",
  armorSets: [
    {
      setName: "God-Knight Armor",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "859929450",
          "Unyielding Casque",
          "/common/destiny2_content/icons/77b0ff81d37850be2ac4d2e87a96d1b1.jpg",
          CE_SOURCE,
        ),
        gauntlets: item(
          "441033139",
          "Dogged Gage",
          "/common/destiny2_content/icons/f9d72b7f79a1f4c023e333e6424aa8bb.jpg",
          CE_SOURCE,
        ),
        chest: item(
          "3714937821",
          "Relentless Harness",
          "/common/destiny2_content/icons/3b1eb7ccc9f031b8f1543c9ea3e0e42d.jpg",
          CE_SOURCE,
        ),
        legs: item(
          "175883909",
          "Tireless Striders",
          "/common/destiny2_content/icons/569e1a220961bb0a3901b62ccc2bc34b.jpg",
          CE_SOURCE,
        ),
        classItem: item(
          "1306415888",
          "Shroud of Flies",
          "/common/destiny2_content/icons/8d1ec71cff9024b2e5b322a953773470.jpg",
          CE_SOURCE,
        ),
      },
    },
    {
      setName: "Willbreaker Armor",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "1328334240",
          "Willbreaker's Watch",
          "/common/destiny2_content/icons/8483dd383731573ac8921490f1721f75.jpg",
          CE_SOURCE,
        ),
        gauntlets: item(
          "3189374833",
          "Willbreaker's Fists",
          "/common/destiny2_content/icons/4586c65813639d37c11e665ae45cfc98.jpg",
          CE_SOURCE,
        ),
        chest: item(
          "1261894567",
          "Willbreaker's Resolve",
          "/common/destiny2_content/icons/085588e2060e44767daae207d9c01369.jpg",
          CE_SOURCE,
        ),
        legs: item(
          "3020524483",
          "Willbreaker's Greaves",
          "/common/destiny2_content/icons/703249d766dfbd8aadce845c23848d14.jpg",
          CE_SOURCE,
        ),
        classItem: item(
          "2401746614",
          "Mark of the Pit",
          "/common/destiny2_content/icons/21f1c9f587e4270478bbf3ad5aa660b8.jpg",
          CE_SOURCE,
        ),
      },
    },
    {
      setName: "Deathsinger Suit",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1964816829",
          "Deathsinger's Gaze",
          "/common/destiny2_content/icons/b1076f64ca9750cdd42d03a02d174444.jpg",
          CE_SOURCE,
        ),
        gauntlets: item(
          "427348780",
          "Deathsinger's Grip",
          "/common/destiny2_content/icons/92e8578445595c92f81d8bfcdf279bc0.jpg",
          CE_SOURCE,
        ),
        chest: item(
          "1386180724",
          "Deathsinger's Mantle",
          "/common/destiny2_content/icons/3271c4fdf695197f008f2b83549f2afd.jpg",
          CE_SOURCE,
        ),
        legs: item(
          "1497538390",
          "Deathsinger's Herald",
          "/common/destiny2_content/icons/95b400d68b70a019b124bb49c8aeb43a.jpg",
          CE_SOURCE,
        ),
        classItem: item(
          "2130010697",
          "Bone Circlet",
          "/common/destiny2_content/icons/3c40c1e45681702be23259b413555561.jpg",
          CE_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "1098171824",
      "Oversoul Edict",
      "/common/destiny2_content/icons/f2b7dd064b3eab5d01f72db64de7f164.jpg",
      CE_SOURCE,
    ),
    item(
      "833898322",
      "Abyss Defiant",
      "/common/destiny2_content/icons/3a166cd64dc18fff429e9e5992e44055.jpg",
      CE_SOURCE,
    ),
    item(
      "120706239",
      "Word of Crota",
      "/common/destiny2_content/icons/4b9f5e2f929b5f7c1730e28ec880b989.jpg",
      CE_SOURCE,
    ),
    item(
      "1432682459",
      "Fang of Ir Yût",
      "/common/destiny2_content/icons/094c55dee2ab8993e85bf60d8fa3ee62.jpg",
      CE_SOURCE,
    ),
    item(
      "3163900678",
      "Swordbreaker",
      "/common/destiny2_content/icons/ba9f551c34fa8117141628d47d7d0c78.jpg",
      CE_SOURCE,
    ),
    item(
      "2828278545",
      "Song of Ir Yût",
      "/common/destiny2_content/icons/a6b444748bd7c8fc2e5cc1b33678cc7d.jpg",
      CE_SOURCE,
    ),
    item(
      "1034055198",
      "Necrochasm",
      "/common/destiny2_content/icons/52e8bb636771f4731da3f73f06fcad04.jpg",
      CE_SOURCE,
    ),
  ],
  timelostWeaponsTitle: "Adept Weapons",
  timelostWeapons: [
    item(
      "578105049",
      "Oversoul Edict (Adept)",
      "/common/destiny2_content/icons/08c074ad8c8d45149c7cb3c99a240790.jpg",
      CE_SOURCE,
    ),
    item(
      "3782662983",
      "Abyss Defiant (Adept)",
      "/common/destiny2_content/icons/db7c65c5bd370356d349dcb7ded3c371.jpg",
      CE_SOURCE,
    ),
    item(
      "3926103986",
      "Word of Crota (Adept)",
      "/common/destiny2_content/icons/03a1915a306349df1aac7eaf8bbc7961.jpg",
      CE_SOURCE,
    ),
    item(
      "128782990",
      "Fang of Ir Yût (Adept)",
      "/common/destiny2_content/icons/2353e92a5c3704ab8e7c682901057d4e.jpg",
      CE_SOURCE,
    ),
  ],
  other: [
    item(
      "1934481780",
      "War's Lament",
      "/common/destiny2_content/icons/9189b3a0d4d690b6805f6a373feb2f0e.jpg",
      CE_SOURCE,
    ),
    item(
      "2091889892",
      "Crota's Exile",
      "/common/destiny2_content/icons/344a3dae7b19c5d1d2826594d508ad98.jpg",
      CE_SOURCE,
    ),
    item(
      "634576124",
      "Warped Rachis",
      "/common/destiny2_content/icons/1f552084d6b74e6d15bbae8cad16b91f.jpg",
      CE_SOURCE,
    ),
    item(
      "634576125",
      "Shed Carapace",
      "/common/destiny2_content/icons/250591294023bd788bbf8978eef82e70.jpg",
      CE_SOURCE,
    ),
  ],
};
