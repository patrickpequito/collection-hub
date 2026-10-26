export type YearOfProphecyPlaylist = "vanguard-ops" | "crucible";

/** Year of Prophecy armor sets per playlist page (fixed display order, newest season first). */
export const YEAR_OF_PROPHECY_ARMOR_SETS: readonly {
  catalogName: string;
  displayName: string;
  equipableItemSetHash: string;
  previewFile: string;
  playlists: readonly YearOfProphecyPlaylist[];
}[] = [
  {
    catalogName: "Ferropotent",
    displayName: "Ferropotent set",
    equipableItemSetHash: "3734029045",
    previewFile: "ferropotent.webp",
    playlists: ["vanguard-ops"],
  },
  {
    catalogName: "Swordmaster's",
    displayName: "Swordmaster set",
    equipableItemSetHash: "2391762223",
    previewFile: "swordmaster.webp",
    playlists: ["vanguard-ops"],
  },
  {
    // Crucible, S28 Season: Lawless.
    catalogName: "Wild Anthem",
    displayName: "Wild Anthem",
    equipableItemSetHash: "2258577662",
    previewFile: "wild-anthem.webp",
    playlists: ["crucible"],
  },
  {
    catalogName: "Bushido",
    displayName: "Bushido set",
    equipableItemSetHash: "1083114430",
    previewFile: "bushido.webp",
    playlists: ["vanguard-ops"],
  },
  {
    catalogName: "Techsec",
    displayName: "Techsec set",
    equipableItemSetHash: "239346083",
    previewFile: "techsec.webp",
    playlists: ["vanguard-ops"],
  },
  {
    catalogName: "Smoke Jumper",
    displayName: "Smoke Jumper set",
    equipableItemSetHash: "2751989785",
    previewFile: "smoke-jumper-set.webp",
    playlists: ["vanguard-ops"],
  },
  {
    // Crucible, S27 Season: Reclamation.
    catalogName: "Disaster Corps",
    displayName: "Disaster Corps set",
    equipableItemSetHash: "2947197258",
    previewFile: "disaster-corps-set.webp",
    playlists: ["crucible"],
  },
  {
    // Crucible and Vanguard Ops, S27 Season: Reclamation.
    catalogName: "Last Discipline",
    displayName: "Last Discipline",
    equipableItemSetHash: "3252452908",
    previewFile: "last-discipline.webp",
    playlists: ["vanguard-ops", "crucible"],
  },
];

export const YEAR_OF_PROPHECY_ARMOR_SECTION_TITLE =
  "Year of the Prophecy armor sets";
