import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const SE_SOURCE = 'Source: "Salvation\'s Edge" Raid';

export const salvationsEdgeLoot: ActivityLootPage = {
  slug: "salvations-edge",
  title: "Salvation's Edge",
  headerImageFile: "salvations-edge-header.webp",
  armorSets: [
    {
      setName: "Promised Reign",
      guardianClass: "hunter",
      pieces: {
        helmet: item("1026610441", "Promised Reign Mask", "/common/destiny2_content/icons/f36719e6f9a7c946a0f7999558e75eee.jpg", 'Source: "Salvation\'s Edge" Raid'),
        gauntlets: item("2730105984", "Promised Reign Grips", "/common/destiny2_content/icons/ec76b5b8f71acd4c5091cd3e1b05b098.jpg", 'Source: "Salvation\'s Edge" Raid'),
        chest: item("2256359240", "Promised Reign Vest", "/common/destiny2_content/icons/dabd995dce9fb6e90ad0f3382fd97500.jpg", 'Source: "Salvation\'s Edge" Raid'),
        legs: item("1807926458", "Promised Reign Strides", "/common/destiny2_content/icons/0ad63b674ee3a408f5223b03a454dbaf.jpg", 'Source: "Salvation\'s Edge" Raid'),
        classItem: item("87946917", "Promised Reign Cloak", "/common/destiny2_content/icons/fe2d607ebe1efcc2603193b11cb356e9.jpg", 'Source: "Salvation\'s Edge" Raid'),
      },
    },
    {
      setName: "Promised Reunion",
      guardianClass: "titan",
      pieces: {
        helmet: item("659074261", "Promised Reunion Helm", "/common/destiny2_content/icons/feb168f388b2204938d54d15c091dc89.jpg", 'Source: "Salvation\'s Edge" Raid'),
        gauntlets: item("3629884836", "Promised Reunion Gauntlets", "/common/destiny2_content/icons/79387f8b554615540e418160e6d44c11.jpg", 'Source: "Salvation\'s Edge" Raid'),
        chest: item("3725435036", "Promised Reunion Plate", "/common/destiny2_content/icons/f431387f149fd212c85350f4c67dfa1d.jpg", 'Source: "Salvation\'s Edge" Raid'),
        legs: item("1265563470", "Promised Reunion Greaves", "/common/destiny2_content/icons/763be34b15ca48074a5a0ae87b3abb41.jpg", 'Source: "Salvation\'s Edge" Raid'),
        classItem: item("1140861969", "Promised Reunion Mark", "/common/destiny2_content/icons/ac1b3858885da7455c199604b8ba853e.jpg", 'Source: "Salvation\'s Edge" Raid'),
      },
    },
    {
      setName: "Promised Victory",
      guardianClass: "warlock",
      pieces: {
        helmet: item("930168404", "Promised Victory Hood", "/common/destiny2_content/icons/899abb99b97dd76adf2dd34858b0a648.jpg", 'Source: "Salvation\'s Edge" Raid'),
        gauntlets: item("4055964141", "Promised Victory Wraps", "/common/destiny2_content/icons/f0d1494777cf7cc1d29f26a6465b3cbc.jpg", 'Source: "Salvation\'s Edge" Raid'),
        chest: item("1806218131", "Promised Victory Robes", "/common/destiny2_content/icons/a4cce84d42891ba6bb06db6a1d985fc3.jpg", 'Source: "Salvation\'s Edge" Raid'),
        legs: item("7338415", "Promised Victory Boots", "/common/destiny2_content/icons/03e5ec1cd17373f4006e85ac0211d4f7.jpg", 'Source: "Salvation\'s Edge" Raid'),
        classItem: item("141134282", "Promised Victory Bond", "/common/destiny2_content/icons/79aae4f3576c7ffde51b26ee0152b81b.jpg", 'Source: "Salvation\'s Edge" Raid'),
      },
    },
  ],
  weapons: [
    item("445197843", "Critical Anomaly", "/common/destiny2_content/icons/64ce229d4c03c5cca04e9de5855146a2.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("3284383335", "Euphony", "/common/destiny2_content/icons/fe16110003f0cc75145eed012458a667.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("535198113", "Forthcoming Deviance", "/common/destiny2_content/icons/3383698dee3df48089b8d18f956f9476.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("1258168956", "Imminence", "/common/destiny2_content/icons/0a636f8e1f115bcb825e7ab60ef6c302.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("1770490683", "Non-Denouement", "/common/destiny2_content/icons/e56caaf523a140ff834905da55d3b046.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("859869931", "Nullify", "/common/destiny2_content/icons/03de9a5e297c2a9521e9ef360066417a.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("3569407878", "Summum Bonum", "/common/destiny2_content/icons/e6087e2af1907deb1f7d28e5b90195dd.jpg", 'Source: "Salvation\'s Edge" Raid'),
  ],
  timelostWeaponsTitle: "Adept Weapons",
  timelostWeapons: [
    item("172461430", "Critical Anomaly (Adept)", "/common/destiny2_content/icons/7f33cbe8c35c2e64f2cf9a35f2376145.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("3123651616", "Forthcoming Deviance (Adept)", "/common/destiny2_content/icons/d3c2a59a1616f65a0dcbaf383950229e.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("3951511045", "Imminence (Adept)", "/common/destiny2_content/icons/875a840683f5d16aa2ff551922504055.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("1039915310", "Non-Denouement (Adept)", "/common/destiny2_content/icons/0edfda82aae0711829afe50b7835797a.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("892183998", "Nullify (Adept)", "/common/destiny2_content/icons/5811f7bd2abb7a2c553361e582d1bd3f.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("2001697739", "Summum Bonum (Adept)", "/common/destiny2_content/icons/33b8fee089070992bc8f22c014f497f1.jpg", 'Source: "Salvation\'s Edge" Raid'),
  ],
  other: [
    item("2412329836", "Diametric Crush", "/common/destiny2_content/icons/b1edac58d316cd3b97054a9568113284.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("2847579026", "Edification", "/common/destiny2_content/icons/c36f1f9e05dce8df3bf9e38cd813d696.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("2847579025", "Hunker Down", "/common/destiny2_content/icons/9ff68d7e426609bc954550a0dbab31db.jpg", 'Source: "Salvation\'s Edge" Raid'),
    item("2412329837", "Resonant Cellweave", "/common/destiny2_content/icons/d13b2ea94b453e3e5553ba61290b1eaa.jpg", 'Source: "Salvation\'s Edge" Raid'),
  ],
};
