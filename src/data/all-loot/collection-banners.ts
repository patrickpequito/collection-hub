export type AllLootCollectionBanner = {
  title: string;
  href?: string;
  comingSoon?: boolean;
  imageFile?: string;
};

export const ALL_LOOT_COLLECTION_BANNERS: AllLootCollectionBanner[] = [
  {
    title: "Monument of Triumph",
    comingSoon: true,
    imageFile: "monument-of-triumph.webp",
  },
  {
    title: "RAD Loot",
    href: "/rad-loot",
    imageFile: "rad-loot.webp",
  },
  {
    title: "Exotics",
    href: "/exotics",
    imageFile: "exotics.webp",
  },
  {
    title: "Collections",
    comingSoon: true,
    imageFile: "collections.webp",
  },
  {
    title: "Armor sets",
    href: "/sets",
    imageFile: "armor-sets.webp",
  },
  {
    title: "Expansions/Seasons",
    comingSoon: true,
    imageFile: "expansions-seasons.webp",
  },
  {
    title: "PvE Activities",
    comingSoon: true,
    imageFile: "pve-activities.webp",
  },
  {
    title: "PvP Activities",
    comingSoon: true,
    imageFile: "pvp-activities.webp",
  },
  {
    title: "Destinations",
    comingSoon: true,
    imageFile: "destinations.webp",
  },
];
