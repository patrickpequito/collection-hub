import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const GOG_SOURCE = 'Source: "Garden of Salvation" Raid';

export const gardenOfSalvationLoot: ActivityLootPage = {
  slug: "garden-of-salvation",
  title: "Garden of Salvation",
  headerImageFile: "garden-of-salvation-header.webp",
  armorSets: [
    {
      setName: "Kentarch 3",
      guardianClass: "hunter",
      pieces: {
        helmet: item("407842012", "Cowl of Righteousness", "/common/destiny2_content/icons/644c9c0bee6b5bd3dcbd299f459b77b8.jpg", 'Source: "Garden of Salvation" Raid'),
        gauntlets: item("1653741426", "Grips of Exaltation", "/common/destiny2_content/icons/483072f839cb74f16abed279e5bc9c44.jpg", 'Source: "Garden of Salvation" Raid'),
        chest: item("210208587", "Vest of Transcendence", "/common/destiny2_content/icons/2154657997b57d335cda989fb4e37cfc.jpg", 'Source: "Garden of Salvation" Raid'),
        legs: item("2054979724", "Strides of Ascendancy", "/common/destiny2_content/icons/c32c663ece7c5f4ab0319f7f9a4bae85.jpg", 'Source: "Garden of Salvation" Raid'),
        classItem: item("2861892194", "Cloak of Temptation", "/common/destiny2_content/icons/1c2c0071ee278b3c5692d195da5dc6ab.jpg", 'Source: "Garden of Salvation" Raid'),
      },
    },
    {
      setName: "Kentarch 3",
      guardianClass: "titan",
      pieces: {
        helmet: item("519078295", "Helm of Righteousness", "/common/destiny2_content/icons/1b440c6fa8e365f79ab6414023dbca14.jpg", 'Source: "Garden of Salvation" Raid'),
        gauntlets: item("964752083", "Gauntlets of Exaltation", "/common/destiny2_content/icons/5609bc9d530471d72998f64ba835981e.jpg", 'Source: "Garden of Salvation" Raid'),
        chest: item("3876398589", "Plate of Transcendence", "/common/destiny2_content/icons/03ec932a9f1d8ae8405774e620d6b109.jpg", 'Source: "Garden of Salvation" Raid'),
        legs: item("11974904", "Greaves of Ascendancy", "/common/destiny2_content/icons/feab8b786f2deae8b14c9646eea7fd05.jpg", 'Source: "Garden of Salvation" Raid'),
        classItem: item("281660259", "Temptation\'s Mark", "/common/destiny2_content/icons/315065b74bb1871db12a792e409ec453.jpg", 'Source: "Garden of Salvation" Raid'),
      },
    },
    {
      setName: "Kentarch 3",
      guardianClass: "warlock",
      pieces: {
        helmet: item("2367878193", "Mask of Righteousness", "/common/destiny2_content/icons/9427da383703f82f0444d00ec55f871b.jpg", 'Source: "Garden of Salvation" Raid'),
        gauntlets: item("984532872", "Gloves of Exaltation", "/common/destiny2_content/icons/181c052708a0f9d816e33d7e7f6339b5.jpg", 'Source: "Garden of Salvation" Raid'),
        chest: item("1789501056", "Robes of Transcendence", "/common/destiny2_content/icons/44a1e4677e07055724d36805d8e06fd6.jpg", 'Source: "Garden of Salvation" Raid'),
        legs: item("2085872226", "Boots of Ascendancy", "/common/destiny2_content/icons/c894a9defb6bf02929416d2605922e06.jpg", 'Source: "Garden of Salvation" Raid'),
        classItem: item("1141217085", "Temptation\'s Bond", "/common/destiny2_content/icons/ca41a99b4cff4dae2b5e99921cdf6d69.jpg", 'Source: "Garden of Salvation" Raid'),
      },
    },
  ],
  weapons: [
    item("3621336854", "Accrued Redemption", "/common/destiny2_content/icons/adbd4c3544c36a8c94e976bbb806095d.jpg", 'Source: "Garden of Salvation" Raid'),
    item("48643186", "Ancient Gospel", "/common/destiny2_content/icons/41a5d5366017686c8619d18d53b1ca2d.jpg", 'Source: "Garden of Salvation" Raid'),
    item("147444292", "Omniscient Eye", "/common/destiny2_content/icons/26b41e620ad2359ba805e2c405233474.jpg", 'Source: "Garden of Salvation" Raid'),
    item("2145441168", "Prophet of Doom", "/common/destiny2_content/icons/cae4dbf2b458a0f0f85f61baa6a5ee36.jpg", 'Source: "Garden of Salvation" Raid'),
    item("1992309064", "Reckless Oracle", "/common/destiny2_content/icons/af58615844b44293f5911ccaae913804.jpg", 'Source: "Garden of Salvation" Raid'),
    item("2241507890", "Sacred Provenance", "/common/destiny2_content/icons/171e9f7193bb5619fbc49b3042f927db.jpg", 'Source: "Garden of Salvation" Raid'),
    item("2209003210", "Zealot's Reward", "/common/destiny2_content/icons/befe333b98c55b5c8dce6ba073ae1e92.jpg", 'Source: "Garden of Salvation" Raid'),
  ],
  timelostWeapons: [],
  other: [
    item("3996862462", "Ancient Believer", "/common/destiny2_content/icons/568e0ce4fe0d952ac5e48d27e284dec0.jpg", 'Source: "Garden of Salvation" Raid'),
    item("3996862463", "Ancient Defender", "/common/destiny2_content/icons/aa15737efbe2f98de70aedc078aa3cdb.jpg", 'Source: "Garden of Salvation" Raid'),
    item("298334058", "Dive into Darkness", "/common/destiny2_content/icons/93d971da9ec55e13095b86237a904cae.jpg", 'Source: "Garden of Salvation" Raid'),
    item("298334059", "Inherent Truth", "/common/destiny2_content/icons/8c6409c6afcba42c2afb4dd4ccb28311.jpg", 'Source: "Garden of Salvation" Raid'),
  ],
};
