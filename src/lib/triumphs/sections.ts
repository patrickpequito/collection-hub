import { countTriumphProgress } from "@/lib/triumphs/record-progress";
import type {
  RecordInstance,
  TriumphProgress,
  TriumphSection,
} from "@/types/triumph";

export type TriumphLeafSection = TriumphSection & {
  parentName: string | null;
};

export function collectLeafSections(
  sections: TriumphSection[] | undefined,
  parentName: string | null = null,
): TriumphLeafSection[] {
  if (!sections?.length) return [];

  const leaves: TriumphLeafSection[] = [];

  for (const section of sections) {
    const children = section.children ?? [];
    const records = section.records ?? [];

    if (children.length > 0) {
      leaves.push(...collectLeafSections(children, section.name));
      if (records.length > 0) {
        leaves.push({ ...section, children: [], records, parentName });
      }
      continue;
    }

    if (records.length > 0) {
      leaves.push({ ...section, children: [], records, parentName });
    }
  }

  return leaves;
}

export function findLeafSection(
  sections: TriumphSection[],
  presentationNodeHash: string,
): TriumphLeafSection | undefined {
  return collectLeafSections(sections).find(
    (section) => section.presentationNodeHash === presentationNodeHash,
  );
}

export function getSectionBreadcrumb(
  groupName: string,
  sections: TriumphSection[],
  presentationNodeHash: string,
): string {
  const leaf = findLeafSection(sections, presentationNodeHash);
  if (!leaf) return groupName;
  if (leaf.parentName) return `${groupName} // ${leaf.parentName}`;
  return `${groupName} // ${leaf.name}`;
}

export function countSectionProgress(
  section: TriumphSection,
  recordInstances: Map<string, RecordInstance>,
): TriumphProgress {
  const children = section.children ?? [];
  const records = section.records ?? [];

  if (children.length === 0) {
    return countTriumphProgress(records, recordInstances);
  }

  const childProgress = children.reduce<TriumphProgress>(
    (total, child) => {
      const progress = countSectionProgress(child, recordInstances);
      return {
        completed: total.completed + progress.completed,
        total: total.total + progress.total,
      };
    },
    { completed: 0, total: 0 },
  );

  if (records.length === 0) return childProgress;

  const directProgress = countTriumphProgress(records, recordInstances);
  return {
    completed: childProgress.completed + directProgress.completed,
    total: childProgress.total + directProgress.total,
  };
}
