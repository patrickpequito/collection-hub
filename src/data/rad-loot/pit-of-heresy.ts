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
      setName: "Dreambane",
      guardianClass: "hunter",
      pieces: {
        helmet: item(
          "1496857121",
          "Dreambane Cowl",
          "/common/destiny2_content/icons/085e55df8dd09a7b8d1d1cee0b039ad6.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "2293199928",
          "Dreambane Grips",
          "/common/destiny2_content/icons/74d044ab82964e40be33555424a08d87.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "3434445392",
          "Dreambane Vest",
          "/common/destiny2_content/icons/63f0f4fe8084877c47cc65eecde75653.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "328467570",
          "Dreambane Strides",
          "/common/destiny2_content/icons/7730902c179a7bee312acd924374aa46.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "2786161293",
          "Dreambane Cloak",
          "/common/destiny2_content/icons/e0415bf006d34565139f39bbb7474513.jpg",
          POH_SOURCE,
        ),
      },
    },
    {
      setName: "Dreambane",
      guardianClass: "titan",
      pieces: {
        helmet: item(
          "2813078109",
          "Dreambane Helm",
          "/common/destiny2_content/icons/f6b682f2c2b0e7c2621fc5e337d77674.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "1699964364",
          "Dreambane Gauntlets",
          "/common/destiny2_content/icons/53dae002fee93af7a751aa930306dcdf.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "175015316",
          "Dreambane Plate",
          "/common/destiny2_content/icons/c118c9eba7d7fc4abac1026848b678bb.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "2345799798",
          "Dreambane Greaves",
          "/common/destiny2_content/icons/dbeb556fa5693704d8ea2b58dbef4aaf.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "1343302889",
          "Dreambane Mark",
          "/common/destiny2_content/icons/77cb2688cad66007fff3a2b1cf401165.jpg",
          POH_SOURCE,
        ),
      },
    },
    {
      setName: "Dreambane",
      guardianClass: "warlock",
      pieces: {
        helmet: item(
          "1721938300",
          "Dreambane Hood",
          "/common/destiny2_content/icons/18ebc19c6a9ac34f3d6ff284ee26e17b.jpg",
          POH_SOURCE,
        ),
        gauntlets: item(
          "3118392309",
          "Dreambane Gloves",
          "/common/destiny2_content/icons/b87b610e106662fd06d8d119f940922e.jpg",
          POH_SOURCE,
        ),
        chest: item(
          "4235863403",
          "Dreambane Robes",
          "/common/destiny2_content/icons/89287c318b9854bd2f328bc29e3a5a8d.jpg",
          POH_SOURCE,
        ),
        legs: item(
          "399547095",
          "Dreambane Boots",
          "/common/destiny2_content/icons/d32e2313d866c96576654db4abc48344.jpg",
          POH_SOURCE,
        ),
        classItem: item(
          "2975563522",
          "Dreambane Bond",
          "/common/destiny2_content/icons/226898982ff262fc21fcc0b7475c4429.jpg",
          POH_SOURCE,
        ),
      },
    },
  ],
  weapons: [
    item(
      "208088207",
      "Premonition",
      "/common/destiny2_content/icons/e0799b8dec061ac16a8dc6c347bc45b4.jpg",
      POH_SOURCE,
    ),
    item(
      "3924212056",
      "Loud Lullaby",
      "/common/destiny2_content/icons/eb5af35de80a8396706aaf6ffd55a5e3.jpg",
      POH_SOURCE,
    ),
    item(
      "2723909519",
      "Arc Logic",
      "/common/destiny2_content/icons/d87860738feae841541c187618cdf0c8.jpg",
      POH_SOURCE,
    ),
    item(
      "4277547616",
      "Every Waking Moment",
      "/common/destiny2_content/icons/866df0ebd4053089043da4f30c87e174.jpg",
      POH_SOURCE,
    ),
    item(
      "2931957300",
      "Dream Breaker",
      "/common/destiny2_content/icons/76d28c45e392b1d3f94f6cdbbcae8f10.jpg",
      POH_SOURCE,
    ),
    item(
      "1645386487",
      "Tranquility",
      "/common/destiny2_content/icons/63741982bf430abc11bbf6561963c7f9.jpg",
      POH_SOURCE,
    ),
    item(
      "1016668089",
      "One Small Step",
      "/common/destiny2_content/icons/78a7c0769048bb3ed91ec929792ca3f8.jpg",
      POH_SOURCE,
    ),
    item(
      "2782847179",
      "Blasphemer",
      "/common/destiny2_content/icons/ecf8dd2ef1247260ebc509143c90482f.jpg",
      POH_SOURCE,
    ),
    item(
      "3690523502",
      "Love and Death",
      "/common/destiny2_content/icons/48671e8480c158ada396970fed801565.jpg",
      POH_SOURCE,
    ),
    item(
      "2164448701",
      "Apostate",
      "/common/destiny2_content/icons/b3b3538f2445cb51b46b829595f5dcdb.jpg",
      POH_SOURCE,
    ),
    item(
      "3325778512",
      "A Fine Memorial",
      "/common/destiny2_content/icons/23085d9f1093d2f52431f0513e2d7443.jpg",
      POH_SOURCE,
    ),
    item(
      "3870811754",
      "Night Terror",
      "/common/destiny2_content/icons/82752643e54291368409d8feca32de79.jpg",
      POH_SOURCE,
    ),
    item(
      "3067821200",
      "Heretic",
      "/common/destiny2_content/icons/11c64dd593413b7489406f06f90099ad.jpg",
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
