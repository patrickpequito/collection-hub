import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const LW_SOURCE = 'Source: "Last Wish" Raid';

export const lastWishLoot: ActivityLootPage = {
  slug: "last-wish",
  title: "Last Wish",
  headerImageFile: "last-wish-header.webp",
  armorSets: [
    {
      setName: "Great Hunt",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "3423279826",
          "Mask of the Great Hunt",
          "/common/destiny2_content/icons/3d7149a61cd354d14f8bf6d2133c01b4.jpg",
          LW_SOURCE,
        ),
        gauntlets: item(
          "3889633083",
          "Grips of the Great Hunt",
          "/common/destiny2_content/icons/41a07585959355eab585d13df5583402.jpg",
          LW_SOURCE,
        ),
        chest: item(
          "2180477077",
          "Vest of the Great Hunt",
          "/common/destiny2_content/icons/937dfec4a744281d46946b0ccd58fb27.jpg",
          LW_SOURCE,
        ),
        legs: item(
          "2298096557",
          "Strides of the Great Hunt",
          "/common/destiny2_content/icons/456e19a43cd50d1cc137b44ba5485e7e.jpg",
          LW_SOURCE,
        ),
        classItem: item(
          "877968616",
          "Cloak of the Great Hunt",
          "/common/destiny2_content/icons/03aed4195f29dbfa3024b992af09f2ac.jpg",
          LW_SOURCE,
        ),
      },
    },
    {
      setName: "Great Hunt",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "3546379828",
          "Helm of the Great Hunt",
          "/common/destiny2_content/icons/f3cd900df3fdcf0eb24ec42a2f391c31.jpg",
          LW_SOURCE,
        ),
        gauntlets: item(
          "1952647501",
          "Gauntlets of the Great Hunt",
          "/common/destiny2_content/icons/966481b36642098933cb21711cc134d2.jpg",
          LW_SOURCE,
        ),
        chest: item(
          "1146451699",
          "Plate of the Great Hunt",
          "/common/destiny2_content/icons/884a53c9d1710e5accb185365675842d.jpg",
          LW_SOURCE,
        ),
        legs: item(
          "2623446543",
          "Greaves of the Great Hunt",
          "/common/destiny2_content/icons/fa1dbd614568db36bc850b28ae18be11.jpg",
          LW_SOURCE,
        ),
        classItem: item(
          "3351877674",
          "Mark of the Great Hunt",
          "/common/destiny2_content/icons/96f0dfb309fcae47e779f6d27586520a.jpg",
          LW_SOURCE,
        ),
      },
    },
    {
      setName: "Great Hunt",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1350126011",
          "Hood of the Great Hunt",
          "/common/destiny2_content/icons/d67fcc57ea9130643f2020598fc2df85.jpg",
          LW_SOURCE,
        ),
        gauntlets: item(
          "2850984298",
          "Gloves of the Great Hunt",
          "/common/destiny2_content/icons/9a6c1e477c13bebc658b2e77f84ddac0.jpg",
          LW_SOURCE,
        ),
        chest: item(
          "4241329310",
          "Robes of the Great Hunt",
          "/common/destiny2_content/icons/fb10acf6220b725be2444aba354895e0.jpg",
          LW_SOURCE,
        ),
        legs: item(
          "1890196228",
          "Boots of the Great Hunt",
          "/common/destiny2_content/icons/58b6b1dcdb64322e0d1761c6981bbf55.jpg",
          LW_SOURCE,
        ),
        classItem: item(
          "3570956455",
          "Bond of the Great Hunt",
          "/common/destiny2_content/icons/42a98e2899a0de554316233b2547c15e.jpg",
          LW_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "568515759",
      "Chattering Bone",
      "/common/destiny2_content/icons/886c1372ece5e30e6aee0fdfebf65bed.jpg",
      LW_SOURCE,
    ),
    item(
      "346136302",
      "Retold Tale",
      "/common/destiny2_content/icons/760fec20e7c73486d928294e71cab18c.jpg",
      LW_SOURCE,
    ),
    item(
      "686951703",
      "The Supremacy",
      "/common/destiny2_content/icons/57e762b0f41575efde3deaa79496f628.jpg",
      LW_SOURCE,
    ),
    item(
      "3799980700",
      "Transfiguration",
      "/common/destiny2_content/icons/4975d25cd6a8ce48ea04f346ee44b1bf.jpg",
      LW_SOURCE,
    ),
    item(
      "601592879",
      "Age-Old Bond",
      "/common/destiny2_content/icons/bbcfd3be25a188e62ebc82258ec1009e.jpg",
      LW_SOURCE,
    ),
    item(
      "654370424",
      "Nation of Beasts",
      "/common/destiny2_content/icons/02c39ef35d21b77989e1a4cd18e1d076.jpg",
      LW_SOURCE,
    ),
    item(
      "4094657108",
      "Techeun Force",
      "/common/destiny2_content/icons/3ddbd72bdfefd1475d069c562ef80747.jpg",
      LW_SOURCE,
    ),
    item(
      "2545083870",
      "Apex Predator",
      "/common/destiny2_content/icons/74e3e47ee5478055a662bd4083774119.jpg",
      LW_SOURCE,
    ),
    item(
      "2721249463",
      "Tyranny of Heaven",
      "/common/destiny2_content/icons/b4d39e31c777026b40e6acf2f7c6f720.jpg",
      LW_SOURCE,
    ),
    item(
      "2069224589",
      "One Thousand Voices",
      "/common/destiny2_content/icons/51c53df606cca474dce3cadbf7d5ce28.jpg",
      LW_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "2269373482",
      "Ermine TAC-717",
      "/common/destiny2_content/icons/29448521d1d41ed4bc5ab93fc89e6611.jpg",
      LW_SOURCE,
    ),
    item(
      "3862768196",
      "Wish-Maker Shell",
      "/common/destiny2_content/icons/becb8ad59793dd7f13071653c382012b.jpg",
      LW_SOURCE,
    ),
    item(
      "1059304051",
      "Wish No More",
      "/common/destiny2_content/icons/bd3acbaa5da9cb8a6d8ea3d4a6ff9aaf.jpg",
      LW_SOURCE,
    ),
    item(
      "1511214612",
      "Castle in the Clouds",
      "/common/destiny2_content/icons/ef018a5137e05b7fb3535777698d71f2.jpg",
      LW_SOURCE,
    ),
    item(
      "1511214613",
      "The Winding Tower",
      "/common/destiny2_content/icons/85f910c136124bac81969f5afc84164f.jpg",
      LW_SOURCE,
    ),
    item(
      "1053023441",
      "Apprentice Guide",
      "/common/destiny2_content/icons/27c8f3fbace3787383bff58838a2f80f.jpg",
      LW_SOURCE,
    ),
    item(
      "1053023440",
      "Journeyman Guide",
      "/common/destiny2_content/icons/bfc69f62a448947a6079ddba308585ef.jpg",
      LW_SOURCE,
    ),
    item(
      "2081719592",
      "Cleansing Knife",
      "/common/destiny2_content/icons/3681c6676cae1edcafc61cb330ca04b4.jpg",
      LW_SOURCE,
    ),
  ],
};
