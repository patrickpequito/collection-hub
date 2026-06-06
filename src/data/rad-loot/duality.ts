import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SOURCE = 'Source: "Duality" Dungeon';

export const dualityLoot: ActivityLootPage = {
  slug: "duality",
  title: "Duality",
  headerImageFile: "duality-header.webp",
  completionsLabel: "Dungeon Completions",
  armorSets: [
    {
      setName: "Deep Explorer",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "3262689948",
          "Deep Explorer Mask",
          "/common/destiny2_content/icons/59713a96f590ddd582a7defb6bf63532.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "322599957",
          "Deep Explorer Grasps",
          "/common/destiny2_content/icons/2cca2691f2c00eef1ef55bb5463e2aed.jpg",
          SOURCE,
        ),
        chest: item(
          "4289018379",
          "Deep Explorer Vest",
          "/common/destiny2_content/icons/6ee7d7e68daadda53a87e05a624ef44f.jpg",
          SOURCE,
        ),
        legs: item(
          "2364756343",
          "Deep Explorer Strides",
          "/common/destiny2_content/icons/470db91034af58352581823c6f387c33.jpg",
          SOURCE,
        ),
        classItem: item(
          "3070295330",
          "Deep Explorer Cloak",
          "/common/destiny2_content/icons/d1d88c2771f6329ade75f73bce102fc7.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Deep Explorer",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2610749098",
          "Deep Explorer Helmet",
          "/common/destiny2_content/icons/08487ead23df300f8123ded8f7eeb00e.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "2616310259",
          "Deep Explorer Gauntlets",
          "/common/destiny2_content/icons/ee0bd4b71c61589fec09c519ab7f1868.jpg",
          SOURCE,
        ),
        chest: item(
          "3570529565",
          "Deep Explorer Plate",
          "/common/destiny2_content/icons/018014859a1ddf8838f931785669dd65.jpg",
          SOURCE,
        ),
        legs: item(
          "2351264197",
          "Deep Explorer Greaves",
          "/common/destiny2_content/icons/5125df7348372048ad53f813a140e323.jpg",
          SOURCE,
        ),
        classItem: item(
          "737550160",
          "Deep Explorer Mark",
          "/common/destiny2_content/icons/43ded926d41e0e20be948c5de4a9b77f.jpg",
          SOURCE,
        ),
      },
    },
    {
      setName: "Deep Explorer",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "630469185",
          "Deep Explorer Hood",
          "/common/destiny2_content/icons/cf6ee97251ea760bed9e63b04fb45db8.jpg",
          SOURCE,
        ),
        gauntlets: item(
          "1468388696",
          "Deep Explorer Gloves",
          "/common/destiny2_content/icons/e15bd704f6871b90cb2df7cbc0d662ef.jpg",
          SOURCE,
        ),
        chest: item(
          "561897072",
          "Deep Explorer Vestments",
          "/common/destiny2_content/icons/a762edc85a391c03602de255951fb2eb.jpg",
          SOURCE,
        ),
        legs: item(
          "3798520466",
          "Deep Explorer Boots",
          "/common/destiny2_content/icons/b260b1b0071ad340eb21808a327ee739.jpg",
          SOURCE,
        ),
        classItem: item(
          "3742442925",
          "Deep Explorer Bond",
          "/common/destiny2_content/icons/9be1c60d1aaa6689f64e327c7163f858.jpg",
          SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "2194955522",
      "Fixed Odds",
      "/common/destiny2_content/icons/2f976faa5043ea86212e079c84ff6683.jpg",
      SOURCE,
    ),
    item(
      "3664831848",
      "Heartshadow",
      "/common/destiny2_content/icons/94c6933727fa885fb2002a8c7aee5e42.jpg",
      SOURCE,
    ),
    item(
      "2026087437",
      "Lingering Dread",
      "/common/destiny2_content/icons/c61e5c1014b290cb63026938ed4982fc.jpg",
      SOURCE,
    ),
    item(
      "1780464822",
      "New Purpose",
      "/common/destiny2_content/icons/4d74a4464b7712b94d7afadc9b740eb3.jpg",
      SOURCE,
    ),
    item(
      "3652506829",
      "Stormchaser",
      "/common/destiny2_content/icons/0b3c602c10a80fcc5c688f6298e53fc6.jpg",
      SOURCE,
    ),
    item(
      "2263839058",
      "The Epicurean",
      "/common/destiny2_content/icons/309be60672ad05a6feaf055fd6e9e6ab.jpg",
      SOURCE,
    ),
    item(
      "3000847393",
      "Unforgiven",
      "/common/destiny2_content/icons/debbcf7175b5cc3e25d80f01f13a9e8d.jpg",
      SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "488052106",
      "Mandate of Strength",
      "/common/destiny2_content/icons/e3a0f83fefdefade868ab130e86b2078.jpg",
      SOURCE,
    ),
    item(
      "383734239",
      "The Deepest Truth",
      "/common/destiny2_content/icons/7ca933ecdf6f9f08c3b6711190cce7a8.jpg",
      SOURCE,
    ),
    item(
      "383734232",
      "Untouched by Opulence",
      "/common/destiny2_content/icons/de052aec1306777be98e7a8050bcbfb4.jpg",
      SOURCE,
    ),
  ],
};
