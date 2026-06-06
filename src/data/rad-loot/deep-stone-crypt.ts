import type { ActivityLootPage } from "@/types/activity-loot";

function item(
  itemHash: string,
  name: string,
  iconPath: string,
  source: string,
) {
  return { itemHash, name, iconPath, source };
}

const DSC_SOURCE = 'Source: "Deep Stone Crypt" Raid';

export const deepStoneCryptLoot: ActivityLootPage = {
  slug: "deep-stone-crypt",
  title: "Deep Stone Crypt",
  headerImageFile: "deep-stone-crypt-header.webp",
  armorSets: [
    {
      setName: "Legacy's Oath",
      guardianClass: "hunter",
      pieces: {
        helmet: item("893751566", "Legacy\'s Oath Mask", "/common/destiny2_content/icons/df1b5f30b9f8f0f3de16d8f91524ac4f.jpg", 'Source: "Deep Stone Crypt" Raid'),
        gauntlets: item("172353448", "Legacy\'s Oath Grips", "/common/destiny2_content/icons/2fb3a18d334cc836c63e916120b84381.jpg", 'Source: "Deep Stone Crypt" Raid'),
        chest: item("2643943456", "Legacy\'s Oath Vest", "/common/destiny2_content/icons/d71f8d103ff809c856f2b80d54d6b11a.jpg", 'Source: "Deep Stone Crypt" Raid'),
        legs: item("807761666", "Legacy\'s Oath Strides", "/common/destiny2_content/icons/13bdf076be15bb6d00b4973da60ddfb9.jpg", 'Source: "Deep Stone Crypt" Raid'),
        classItem: item("1021060724", "Legacy\'s Oath Cloak", "/common/destiny2_content/icons/61c552eeec49e985fc0b130aa17da805.jpg", 'Source: "Deep Stone Crypt" Raid'),
      },
    },
    {
      setName: "Legacy's Oath",
      guardianClass: "titan",
      pieces: {
        helmet: item("2118858423", "Legacy\'s Oath Helm", "/common/destiny2_content/icons/2e43c0325063750172c6c51b1ef0a85b.jpg", 'Source: "Deep Stone Crypt" Raid'),
        gauntlets: item("1192372542", "Legacy\'s Oath Gauntlets", "/common/destiny2_content/icons/d874653d69ca08699f4f9893a66979f5.jpg", 'Source: "Deep Stone Crypt" Raid'),
        chest: item("751162931", "Legacy\'s Oath Plate", "/common/destiny2_content/icons/9ed0ee27a295dddad1e5cd070446c5b8.jpg", 'Source: "Deep Stone Crypt" Raid'),
        legs: item("1611754904", "Legacy\'s Oath Greaves", "/common/destiny2_content/icons/bdd939c72721db01184cdd4ea512d9ca.jpg", 'Source: "Deep Stone Crypt" Raid'),
        classItem: item("542497667", "Legacy\'s Oath Mark", "/common/destiny2_content/icons/75f481aa2758181c7f71d594a31f6066.jpg", 'Source: "Deep Stone Crypt" Raid'),
      },
    },
    {
      setName: "Legacy's Oath",
      guardianClass: "warlock",
      pieces: {
        helmet: item("653350778", "Legacy\'s Oath Cowl", "/common/destiny2_content/icons/1862f38a8fb74634082cbed46761e94b.jpg", 'Source: "Deep Stone Crypt" Raid'),
        gauntlets: item("79460168", "Legacy\'s Oath Gloves", "/common/destiny2_content/icons/bd15c2dbf85a4d8dd9888843fffcd118.jpg", 'Source: "Deep Stone Crypt" Raid'),
        chest: item("2389152781", "Legacy\'s Oath Robes", "/common/destiny2_content/icons/2518a7bba9de2ced04ef2b5631655a2d.jpg", 'Source: "Deep Stone Crypt" Raid'),
        legs: item("516634869", "Legacy\'s Oath Boots", "/common/destiny2_content/icons/a1e39c6f259c2ab40190a1dc0412dddf.jpg", 'Source: "Deep Stone Crypt" Raid'),
        classItem: item("968995072", "Legacy\'s Oath Bond", "/common/destiny2_content/icons/7cae3eb18f9352a0c7b3765357c24dc5.jpg", 'Source: "Deep Stone Crypt" Raid'),
      },
    },
  ],
  weapons: [
    item("3366545721", "Bequest", "/common/destiny2_content/icons/c51dd26c9db21b789afa7d24d96e39fa.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("4230965989", "Commemoration", "/common/destiny2_content/icons/9820c9c3714bdd7f6fb7c2b83143041b.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("2399110176", "Eyes of Tomorrow", "/common/destiny2_content/icons/9caeff89015f02ad52e6fefe95398b01.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("4248569242", "Heritage", "/common/destiny2_content/icons/07619f9f7115a2295c080f08179deb98.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("3281285075", "Posterity", "/common/destiny2_content/icons/90586409f639d65ee1c91fbce534aa81.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("2990047042", "Succession", "/common/destiny2_content/icons/86b418d0b9f753883931354137ede858.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("1392919471", "Trustee", "/common/destiny2_content/icons/575aa36e701cfc4fe4e62a83f423ae97.jpg", 'Source: "Deep Stone Crypt" Raid'),
  ],
  timelostWeapons: [],
  other: [
    item("1230660644", "Crypt Reawakened", "/common/destiny2_content/icons/0a44354edea097bdca9b0681fd4b33d1.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("2357830696", "Cryptic Insignia", "/common/destiny2_content/icons/fcb8c9ecdd6a409b0efd38df4cdfc6dd.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("2357830697", "Cryptic Legacy", "/common/destiny2_content/icons/13b2194058c1243f837b6dba9abfe0fc.jpg", 'Source: "Deep Stone Crypt" Raid'),
    item("1230660645", "Long Slow Whisper", "/common/destiny2_content/icons/b138b34d13fb5170e5a7e6301f5d9dbb.jpg", 'Source: "Deep Stone Crypt" Raid'),
  ],
};
