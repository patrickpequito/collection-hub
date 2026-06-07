export type TriumphObjective = {
  objectiveHash: string;
  progressDescription: string;
  completionValue: number;
};

export type TriumphReward = {
  itemHash: string;
  name: string;
  itemType: string;
  iconPath: string;
};

export type TriumphRecord = {
  recordHash: string;
  name: string;
  description: string;
  iconPath: string;
  score: number;
  forTitleGilding: boolean;
  /** Interval triumphs — stepped thresholds on one cumulative counter. */
  progressStyle?: "default" | "interval";
  objectives: TriumphObjective[];
  rewards: TriumphReward[];
};

export type TriumphSection = {
  presentationNodeHash: string;
  name: string;
  iconPath: string;
  children: TriumphSection[];
  records: TriumphRecord[];
};

export type TriumphGroup = {
  slug: string;
  presentationNodeHash: string;
  name: string;
  iconPath: string;
  /** Nested presentation-node tree (e.g. Activities → Abilities). */
  sections: TriumphSection[];
  records: TriumphRecord[];
};

export type TitleEntry = {
  slug: string;
  presentationNodeHash: string;
  name: string;
  description: string;
  iconPath: string;
  /** In-game title text (e.g. "Iron Lord"), distinct from the seal name. */
  guardianTitle: string | null;
  /** Lower = shown first (newest titles in the manifest). */
  sortOrder: number;
  /** Limited-time event title — progress resets when the event ends. */
  isSeasonal: boolean;
  /** Seal record — redeemed when the title is earned (persists across seasons). */
  completionRecordHash: string | null;
  /** Gilding seal record — redeemed when the title is gilded. */
  gildingTrackingRecordHash: string | null;
  records: TriumphRecord[];
};

export type TriumphCatalog = {
  generatedAt: string;
  groups: TriumphGroup[];
  titles: TitleEntry[];
};

export type TriumphProgress = {
  completed: number;
  total: number;
};

export type TitleCompletionTier = "none" | "base" | "gilded";

export type RecordObjectiveProgress = {
  objectiveHash: string;
  progress: number;
  completionValue: number;
  complete: boolean;
};

export type RecordInstance = {
  state: number;
  objectives: RecordObjectiveProgress[];
};

/** Bungie profile StringVariables — resolves {var:hash} in objective text. */
export type TriumphStringVariables = {
  profile: Record<string, number>;
  byCharacter: Record<string, Record<string, number>>;
};

export const EMPTY_TRIUMPH_STRING_VARIABLES: TriumphStringVariables = {
  profile: {},
  byCharacter: {},
};
