import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const POH_SOURCE = 'Source: "Pit of Heresy" Dungeon';

export const pitOfHeresyLoot: ActivityLootPage = {
  slug: "pit-of-heresy",
  title: "Pit of Heresy",
  headerImageFile: "pit-of-heresy-header.webp",
  triumphPanel: {
    name: "Pit of Heresy",
    description: 'Triumphs for the "Pit of Heresy" dungeon.',
    iconPath:
      "/common/destiny2_content/icons/1406f929d0c25506a5ab5ea73956fcb3.png",
    recordHashes: [
      "243544347",
      "245952203",
      "3841336511",
      "3950599483",
      "1810876745",
      "3465086611",
      "1966601634",
      "2355577143",
      "3749686478",
      "3464843861",
      "1534224343",
    ],
  },
  armorSets: [
    {
      setName: "Apostate's Blade",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "834580249",
          "Apostate's Blade Mask",
          "/common/destiny2_content/icons/6fa208b5ed2cd7c956284f54d87e4b70.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "306365328",
          "Apostate's Blade Grips",
          "/common/destiny2_content/icons/fa6a3329981ad379b3c10b3c277d0795.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "2817890488",
          "Apostate's Blade Vest",
          "/common/destiny2_content/icons/baab3c1221d28778ecf184fda5b5ae26.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "665000682",
          "Apostate's Blade Strides",
          "/common/destiny2_content/icons/94d9788eb091b71fce6e1506d8a1aa25.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "1213384789",
          "Apostate's Blade Cloak",
          "/common/destiny2_content/icons/7a10b1658a1ba91e1af2c1ec57a7cae7.jpg",
          POH_SOURCE,
        ),
      },
    },
    {
      setName: "Apostate's Blade",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "1393530461",
          "Apostate's Blade Helm",
          "/common/destiny2_content/icons/7351d41c982ad05d4b5f1159fe005a1b.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "280416716",
          "Apostate's Blade Gauntlets",
          "/common/destiny2_content/icons/28059c8db2e13dd9e3436cd79721c234.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "3622930836",
          "Apostate's Blade Plate",
          "/common/destiny2_content/icons/35dbd275635ccdad16c508a69cce6b1f.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "926252150",
          "Apostate's Blade Greaves",
          "/common/destiny2_content/icons/69fda58f34290731b98860b2a4b718b0.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "496251113",
          "Apostate's Blade Mark",
          "/common/destiny2_content/icons/bc0b495a8e566927b753742920fe9387.jpg",
          POH_SOURCE,
        ),
      },
    },
    {
      setName: "Apostate's Blade",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "3602570948",
          "Apostate's Blade Hood",
          "/common/destiny2_content/icons/239a0ba341514eaf97b98a8df300d4ed.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "3549765533",
          "Apostate's Blade Gloves",
          "/common/destiny2_content/icons/e5c8e50fc8d576ac78ee04c4d68c4296.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "2621477411",
          "Apostate's Blade Robe",
          "/common/destiny2_content/icons/37f138c807950f94f38e233c2bc2ee29.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "1195966527",
          "Apostate's Blade Boots",
          "/common/destiny2_content/icons/7ff4c7ed87ebdc1fb56fb385399127d1.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "1903284250",
          "Apostate's Blade Bond",
          "/common/destiny2_content/icons/0be1cce11ec0843d141efa53e04a12be.jpg",
          POH_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "621450049",
      "Adamantite",
      "/common/destiny2_content/icons/1986d831face6f7a188204509383574f.jpg",
      POH_SOURCE,
    ),
    item(
      "4147428506",
      "Eyes Unveiled",
      "/common/destiny2_content/icons/1ffa0c9fba4b3cd1d64315760fe6978d.jpg",
      POH_SOURCE,
    ),
    item(
      "1835232052",
      "Psychopomp",
      "/common/destiny2_content/icons/598311bfa0d3aaf60581688019fe096f.jpg",
      POH_SOURCE,
    ),
    item(
      "1541324871",
      "Refusal of the Call",
      "/common/destiny2_content/icons/8aeced509e6d7bc990fe7ff67ad27d52.jpg",
      POH_SOURCE,
    ),
    item(
      "1395261499",
      "Xenophage",
      "/common/destiny2_content/icons/de34570a93281dc201690cfd146e6d24.jpg",
      POH_SOURCE,
    ),
  ],
  timelostWeapons: [],
  other: [
    item(
      "4023500750",
      "Bane of Tyrants",
      "/common/destiny2_content/icons/38fd0ac442b4f8470b9fea39b4aa2485.jpg",
      POH_SOURCE,
    ),
    item(
      "298334060",
      "Crimson Echoes",
      "/common/destiny2_content/icons/bf9b9247278e8f8186b75fd1577e665f.jpg",
      POH_SOURCE,
    ),
    item(
      "298334061",
      "Sanguine Static",
      "/common/destiny2_content/icons/18dc6c427a49dc411027a22b413b8b7c.jpg",
      POH_SOURCE,
    ),
  ],
};
