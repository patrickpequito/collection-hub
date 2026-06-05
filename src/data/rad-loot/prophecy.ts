import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const PROPHECY_SOURCE = 'Source: "Prophecy" Dungeon';

export const prophecyLoot: ActivityLootPage = {
  slug: "prophecy",
  title: "Prophecy",
  headerImageFile: "prophecy-header.webp",
  completionsLabel: "Dungeon Completions",
  triumphPanel: {
    name: "Prophecy",
    description: 'Triumphs for the "Prophecy" dungeon.',
    iconPath:
      "/common/destiny2_content/icons/1406f929d0c25506a5ab5ea73956fcb3.png",
    recordHashes: [
      "969826320",
      "2010041484",
      "3002642730",
      "3191784400",
      "4210255650",
      "1914189892",
      "529072376",
      "3767319773",
      "1743100318",
      "3035458839",
      "2511965200",
      "3817780576",
    ],
  },
  armorSets: [
    {
      setName: "Moonfang-X7",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "2623956730",
          "Moonfang-X7 Mask",
          "/common/destiny2_content/icons/9e9ff663ad6358862209bb0654f1f965.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "100226755",
          "Moonfang-X7 Grips",
          "/common/destiny2_content/icons/3258b928e78e43d56bc5fc119bac3eb9.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "4121885325",
          "Moonfang-X7 Rig",
          "/common/destiny2_content/icons/126c46bab9197786f36784496dce46d5.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "2487240821",
          "Moonfang-X7 Strides",
          "/common/destiny2_content/icons/bbcf89b61f50399698278e89588c3f2c.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "2701727616",
          "Moonfang-X7 Cloak",
          "/common/destiny2_content/icons/4589abfc3117072f9398ca783284a939.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
    {
      setName: "Moonfang-X7",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2234240008",
          "Moonfang-X7 Helm",
          "/common/destiny2_content/icons/a76455a06596f165b50c03f26f106bb8.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "1581574297",
          "Moonfang-X7 Gauntlets",
          "/common/destiny2_content/icons/000836203e4195622fc8ae0ae9351e4c.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "1571337215",
          "Moonfang-X7 Chassis",
          "/common/destiny2_content/icons/18eb106c9a2b6028dfc547410777716b.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "178689419",
          "Moonfang-X7 Greaves",
          "/common/destiny2_content/icons/9a4b41f44ef14d3816816a3aa8b88047.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "3242850062",
          "Moonfang-X7 Mark",
          "/common/destiny2_content/icons/79d254069b16f9bbe428f9ae25c7cebd.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
    {
      setName: "Moonfang-X7",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2288398391",
          "Moonfang-X7 Crown",
          "/common/destiny2_content/icons/42c2718f4df772d8b6b30477c205835d.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "1361912510",
          "Moonfang-X7 Gloves",
          "/common/destiny2_content/icons/7ff7771ef9b75972006d73d2aa86d986.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "1658294130",
          "Moonfang-X7 Robe",
          "/common/destiny2_content/icons/1f07f850f765f132fed2f423ab3bf1b0.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "1781294872",
          "Moonfang-X7 Boots",
          "/common/destiny2_content/icons/6f5a13f4c620d11263a834f0eb967372.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "2295111683",
          "Moonfang-X7 Bond",
          "/common/destiny2_content/icons/267cfe38e4242825c133ec83b82b556e.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
    {
      setName: "CODA",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "3075372781",
          "Flowing Cowl (CODA)",
          "/common/destiny2_content/icons/fd57a3302fb642bec2e6117ebb8d2c7d.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "4194072668",
          "Flowing Grips (CODA)",
          "/common/destiny2_content/icons/dfb39e8b090183ecb63c0c5e9827f302.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "508076356",
          "Flowing Vest (CODA)",
          "/common/destiny2_content/icons/b08432f60ddf40c2f1d7e2532ce03709.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "3155320806",
          "Flowing Boots (CODA)",
          "/common/destiny2_content/icons/ccdbf7e132a6fad6f62fcaa10f075228.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "1717940633",
          "Cloak Judgment (CODA)",
          "/common/destiny2_content/icons/2ae35bbadebcc05d75c5c92206a180b6.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
    {
      setName: "CODA",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "3976073347",
          "Crushing Helm (CODA)",
          "/common/destiny2_content/icons/8d84baf9f124cb6bb77c2344ccf1982a.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "818644818",
          "Crushing Guard (CODA)",
          "/common/destiny2_content/icons/7ba8a031148eca0c9e95df866f8e59cf.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "2570653206",
          "Crushing Plate (CODA)",
          "/common/destiny2_content/icons/9d74337d3fa479c9fea124166409d143.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "1219883244",
          "Crushing Greaves (CODA)",
          "/common/destiny2_content/icons/cb268e78b8c86d35db0a98e0a5b1e434.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "1900280383",
          "Mark Judgment (CODA)",
          "/common/destiny2_content/icons/41bf4d7c162e2add253ec609fab3f19b.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
    {
      setName: "CODA",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "2602907742",
          "Channeling Cowl (CODA)",
          "/common/destiny2_content/icons/ab3119c33f9f47deba0e12f5ba368f5b.jpg",
          PROPHECY_SOURCE,
        ),
        gauntlets: item(
          "1406846351",
          "Channeling Wraps (CODA)",
          "/common/destiny2_content/icons/aa4d96bc0b46130a6c157f06dc0e3371.jpg",
          PROPHECY_SOURCE,
        ),
        chest: item(
          "1652467433",
          "Channeling Robes (CODA)",
          "/common/destiny2_content/icons/90c4f4750c01812be9906f4a96f8f26a.jpg",
          PROPHECY_SOURCE,
        ),
        legs: item(
          "2022923313",
          "Channeling Treads (CODA)",
          "/common/destiny2_content/icons/41f34d9226db7bb36346ab413a8f0821.jpg",
          PROPHECY_SOURCE,
        ),
        classItem: item(
          "2966633380",
          "Bond Judgment (CODA)",
          "/common/destiny2_content/icons/c4636d84e0bc2715ba81feb864924dd7.jpg",
          PROPHECY_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "1013434963",
      "Adjudicator",
      "/common/destiny2_content/icons/f1a53b2ec55fdce10fe64683e1e8854f.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "507038823",
      "The Last Breath",
      "/common/destiny2_content/icons/b142865fe6d5459a4ccbc32de8b685ac.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "2969415423",
      "Judgment",
      "/common/destiny2_content/icons/3853698380b99524ba6b074d7265f325.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "435821041",
      "Relentless",
      "/common/destiny2_content/icons/1075e2db6a02be3910e7c00a993d7117.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "2855157553",
      "A Sudden Death",
      "/common/destiny2_content/icons/c41b9fe80c157e104c32cfbfbb90a7b5.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "1626503676",
      "A Swift Verdict",
      "/common/destiny2_content/icons/200080943f25aee56427767cc80dc40f.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "435821040",
      "Darkest Before",
      "/common/destiny2_content/icons/75c2fdd914f5ec532db62b33d8cab92d.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "2742490609",
      "Death Adder",
      "/common/destiny2_content/icons/242ccfe000ba534300e916a9d08b62f8.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "1200824700",
      "IKELOS_HC_v1.0.2",
      "/common/destiny2_content/icons/eb545cf6330f410dfaa5e65412757e5d.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "1096206669",
      "IKELOS_SG_v1.0.2",
      "/common/destiny2_content/icons/cba43299108f3b5fc2d599b6ec81b3ec.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "3483591058",
      "Prosecutor",
      "/common/destiny2_content/icons/7d8c2710ae61764012137e5c68beaf36.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "3326850591",
      "The Long Walk",
      "/common/destiny2_content/icons/6e31e137816e45bc572f573392f355b1.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "1271343896",
      "Widow's Bite",
      "/common/destiny2_content/icons/974e392d68dfd9baf47d0cd1c1521eaf.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "3669616453",
      "Hoosegow",
      "/common/destiny2_content/icons/7237fd2c64473782ef3807593aa9bb5e.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "3629968765",
      "Negative Space",
      "/common/destiny2_content/icons/b2b250cc421cd561373f89947fac7464.jpg",
      PROPHECY_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "732682038",
      "Hareball Shell",
      "/common/destiny2_content/icons/7281ba2f7cc31c9c16107f26efd3f0e1.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "2232750624",
      "Of Ten Suns",
      "/common/destiny2_content/icons/39436ee40cec949e3ca043d184e66687.jpg",
      PROPHECY_SOURCE,
    ),
    item(
      "1138508276",
      "Prophetic Visionary",
      "/common/destiny2_content/icons/092f537b01b33598f0434ba04894aa72.jpg",
      PROPHECY_SOURCE,
    ),
  ],
};
