import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const TDP_SOURCE = 'Source: "The Desert Perpetual" Raid';

export const theDesertPerpetualLoot: ActivityLootPage = {
  slug: "the-desert-perpetual",
  title: "The Desert Perpetual",
  headerImageFile: "the-desert-perpetual-header.webp",
  armorSets: [
    {
      setName: "Collective Psyche",
      guardianClass: "hunter",
      pieces: {
        helmet: item("899555156", "Collective Psyche Casque", "/common/destiny2_content/icons/75d2b1b707dc3eeba293c143b235a464.jpg", 'Source: "The Desert Perpetual" Raid'),
        gauntlets: item("739528549", "Collective Psyche Sleeves", "/common/destiny2_content/icons/4998ffdcf965e9f9207c9d425c66ec29.jpg", 'Source: "The Desert Perpetual" Raid'),
        chest: item("920675796", "Collective Psyche Cuirass", "/common/destiny2_content/icons/df0210e8c47af92cfcc10cde395663b2.jpg", 'Source: "The Desert Perpetual" Raid'),
        legs: item("100528251", "Collective Psyche Strides", "/common/destiny2_content/icons/a9e018626027a983489784576d83090a.jpg", 'Source: "The Desert Perpetual" Raid'),
        classItem: item("423598240", "Collective Psyche Cloak", "/common/destiny2_content/icons/bdcc595dfe3be37c64e880aa5532fa69.jpg", 'Source: "The Desert Perpetual" Raid'),
      },
    },
    {
      setName: "Collective Psyche",
      guardianClass: "titan",
      pieces: {
        helmet: item("329855166", "Collective Psyche Helm", "/common/destiny2_content/icons/04fb8637f82f72da8dfdb9b8ca3e7339.jpg", 'Source: "The Desert Perpetual" Raid'),
        gauntlets: item("794256631", "Collective Psyche Gauntlets", "/common/destiny2_content/icons/f5cdbdfb22f0f78b7acd318ddb2ad035.jpg", 'Source: "The Desert Perpetual" Raid'),
        chest: item("650699328", "Collective Psyche Plate", "/common/destiny2_content/icons/9aa352f1b4fd2a5b048f747e1cbf280e.jpg", 'Source: "The Desert Perpetual" Raid'),
        legs: item("835524739", "Collective Psyche Greaves", "/common/destiny2_content/icons/5699d12f27dbcbd2d74322ce7fa33e27.jpg", 'Source: "The Desert Perpetual" Raid'),
        classItem: item("471989682", "Collective Psyche Mark", "/common/destiny2_content/icons/408d0fd1de8b6c2d3b8558709d15ccdf.jpg", 'Source: "The Desert Perpetual" Raid'),
      },
    },
    {
      setName: "Collective Psyche",
      guardianClass: "warlock",
      pieces: {
        helmet: item("872347580", "Collective Psyche Cover", "/common/destiny2_content/icons/f32fcbe2c97296a246f7f32d976f4927.jpg", 'Source: "The Desert Perpetual" Raid'),
        gauntlets: item("285521900", "Collective Psyche Gloves", "/common/destiny2_content/icons/168a8e46548fcd4c58bf789589034dcd.jpg", 'Source: "The Desert Perpetual" Raid'),
        chest: item("434741789", "Collective Psyche Robes", "/common/destiny2_content/icons/a96253e4a3f28b388cccb79332840aa4.jpg", 'Source: "The Desert Perpetual" Raid'),
        legs: item("931254038", "Collective Psyche Boots", "/common/destiny2_content/icons/c0821c700e1490edbd1c49ba6f2aab1e.jpg", 'Source: "The Desert Perpetual" Raid'),
        classItem: item("751083501", "Collective Psyche Bond", "/common/destiny2_content/icons/66a3ae8e127737f17f0af8a0871aa439.jpg", 'Source: "The Desert Perpetual" Raid'),
      },
    },
  ],
  weapons: [
    item("1435808083", "Antedate", "/common/destiny2_content/icons/2ab789069deeb4032b8ad2ee108b9a3b.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("2579693381", "Cusp Sempiternal", "/common/destiny2_content/icons/c85a9ea48178254bb7dbc0eeb58e1f47.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("3241217409", "Finite Maybe", "/common/destiny2_content/icons/eccf5db0879acd1368922f84e1538b74.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("2725426834", "Intercalary", "/common/destiny2_content/icons/cde5d2f3e66b5aba3deb0d49def6cfa5.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("688593230", "Lance Ephemeral", "/common/destiny2_content/icons/5170b2f63a5513ccca64e08283e55581.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("1553681400", "Opaque Hourglass", "/common/destiny2_content/icons/493661e8d5c3a58cd9afbc33a88bc02b.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("3868973291", "Starscape Null", "/common/destiny2_content/icons/ba50baf6a02c5923c8f825ce4594c053.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("3177074192", "The Ever-Present", "/common/destiny2_content/icons/e9d7741fb1f7c45805f2851944939ed1.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("1090936013", "The When and Where", "/common/destiny2_content/icons/5e88ee0539b499089a0bc4c2caf4f4f3.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("1202007252", "Whirling Ovation", "/common/destiny2_content/icons/b91ed8db52e1a3c52e0f9bd69b290b9f.jpg", 'Source: "The Desert Perpetual" Raid'),
  ],
  timelostWeapons: [],
  other: [
    item("2565108501", "After the Unknown", "/common/destiny2_content/icons/ae0d447f4faac76276a30fb2a089310a.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("3220576444", "Envoy\'s Togs", "/common/destiny2_content/icons/13ca1b56bfccfd6bf53528c8d2856f7a.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("3220576445", "Mediant Flourish", "/common/destiny2_content/icons/7b15975590f35f035c3238da5f3e33a7.jpg", 'Source: "The Desert Perpetual" Raid'),
    item("4178714190", "Third Unknown", "/common/destiny2_content/icons/1ea55ee3b7a2a984f98c80356e3ada03.jpg", 'Source: "The Desert Perpetual" Raid'),
  ],
};
