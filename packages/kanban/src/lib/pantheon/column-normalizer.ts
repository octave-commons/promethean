import { columnKey } from '../kanban.js';
import type { Board, ColumnData } from '../types.js';
import { runPantheonComputation } from './runtime.js';

const COLUMN_KEY_EQUAL = (a: string, b: string): boolean => columnKey(a) === columnKey(b);

type ColumnNormalizationRequest = {
  columnNames: string[];
  canonicalStatuses: string[];
};

type ColumnMember = {
  originalName: string;
  key: string;
  reason: string;
};

export type ColumnNormalizationAction = 'keep' | 'rename' | 'merge';

export type ColumnNormalizationGroup = {
  canonicalStatus: string;
  canonicalKey: string;
  canonicalName: string;
  members: Array<{
    originalName: string;
    action: ColumnNormalizationAction;
    reason: string;
  }>;
};

export type ColumnNormalizationAnalysis = {
  groups: ColumnNormalizationGroup[];
};

const TITLE_CASE = (value: string): string =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const SYNONYM_MAP: Record<string, string[]> = {
  review: ['in_review', 'qa_review', 'peer_review', 'ready_for_review', 'code_review'],
  in_progress: ['progress', 'doing', 'wip', 'inprocess'],
  todo: ['to_do', 'backlog', 'ready_to_start'],
  ready: ['ready_for_dev', 'ready_for_work', 'triage', 'ready_to_start'],
  blocked: ['on_hold', 'blocked_on', 'waiting', 'stuck', 'impeded'],
  done: ['completed', 'complete', 'shipped', 'released', 'finished'],
  testing: ['qa', 'qa_verification', 'in_testing', 'test', 'verification'],
  document: ['docs', 'documentation', 'doc', 'in_documentation'],
  incoming: ['inbox', 'triage_pending', 'new_requests'],
  accepted: ['approved', 'validated', 'committed'],
};

const PREFIXES = ['in_', 'qa_', 'ready_for_', 'awaiting_', 'pending_', 'pre_', 'code_'];
const SUFFIXES = ['_phase', '_stage', '_column', '_queue'];

type CanonicalEntry = {
  status: string;
  key: string;
  displayName: string;
};

const buildCanonicalEntries = (canonicalStatuses: string[]): CanonicalEntry[] => {
  const unique = new Map<string, CanonicalEntry>();
  for (const status of canonicalStatuses) {
    const key = columnKey(status);
    if (unique.has(key)) continue;
    const displayName = TITLE_CASE(status);
    unique.set(key, { status, key, displayName });
  }
  return Array.from(unique.values());
};

const stripPrefixesAndSuffixes = (value: string): Set<string> => {
  const variants = new Set<string>([value]);
  for (const prefix of PREFIXES) {
    if (value.startsWith(prefix)) {
      variants.add(value.slice(prefix.length));
    }
  }
  for (const suffix of SUFFIXES) {
    if (value.endsWith(suffix)) {
      variants.add(value.slice(0, -suffix.length));
    }
  }
  return variants;
};

const findCanonical = (
  entryMap: Map<string, CanonicalEntry>,
  synonyms: Map<string, string[]>,
  columnName: string,
): { canonical: CanonicalEntry; reason: string } | null => {
  const key = columnKey(columnName);

  // Exact match
  const exact = entryMap.get(key);
  if (exact) {
    return { canonical: exact, reason: 'exact canonical match' };
  }

  // Synonym match
  for (const [canonicalKey, aliasList] of synonyms) {
    if (aliasList.includes(key)) {
      const canonical = entryMap.get(canonicalKey);
      if (canonical) {
        return { canonical, reason: `maps via alias "${key}"` };
      }
    }
  }

  // Prefix/suffix stripping
  const variants = stripPrefixesAndSuffixes(key);
  for (const variant of variants) {
    const canonical = entryMap.get(variant);
    if (canonical) {
      return { canonical, reason: `normalized by prefix/suffix removal ("${variant}")` };
    }
  }

  // Substring containment heuristics
  for (const canonical of entryMap.values()) {
    if (key.includes(canonical.key) || canonical.key.includes(key)) {
      return { canonical, reason: `shares canonical fragment "${canonical.key}"` };
    }
  }

  return null;
};

const computeNormalization = (request: ColumnNormalizationRequest): ColumnNormalizationAnalysis => {
  const canonicalEntries = buildCanonicalEntries(request.canonicalStatuses);
  const entryMap = new Map<string, CanonicalEntry>();
  canonicalEntries.forEach((entry) => entryMap.set(entry.key, entry));

  const synonyms = new Map<string, string[]>();
  canonicalEntries.forEach((entry) => {
    const aliases = SYNONYM_MAP[entry.key] ?? SYNONYM_MAP[entry.status] ?? [];
    if (aliases.length > 0) {
      synonyms.set(entry.key, aliases);
    }
  });

  const groups = new Map<string, { canonical: CanonicalEntry; members: ColumnMember[] }>();

  for (const columnName of request.columnNames) {
    const match = findCanonical(entryMap, synonyms, columnName);
    if (!match) {
      continue;
    }

    const groupKey = match.canonical.key;
    const existing = groups.get(groupKey);
    const member: ColumnMember = {
      originalName: columnName,
      key: columnKey(columnName),
      reason: match.reason,
    };

    if (existing) {
      existing.members.push(member);
      // Prefer existing display name from board if it matches canonical key
      if (
        COLUMN_KEY_EQUAL(existing.canonical.displayName, columnName) &&
        existing.canonical.displayName !== columnName
      ) {
        existing.canonical = {
          ...existing.canonical,
          displayName: columnName,
        };
      }
    } else {
      const displayName = COLUMN_KEY_EQUAL(match.canonical.displayName, columnName)
        ? columnName
        : match.canonical.displayName;
      groups.set(groupKey, {
        canonical: { ...match.canonical, displayName },
        members: [member],
      });
    }
  }

  const resultGroups: ColumnNormalizationGroup[] = [];

  for (const { canonical, members } of groups.values()) {
    const hasCanonicalColumn = members.some((member) => member.key === canonical.key);
    if (!hasCanonicalColumn && members.length === 1) {
      const [onlyMember] = members;
      if (!onlyMember) {
        continue;
      }
      if (onlyMember.key === canonical.key) {
        continue;
      }
      resultGroups.push({
        canonicalStatus: canonical.status,
        canonicalKey: canonical.key,
        canonicalName: canonical.displayName,
        members: [
          {
            originalName: onlyMember.originalName,
            action: 'rename',
            reason: onlyMember.reason,
          },
        ],
      });
      continue;
    }

    const groupMembers = members.map((member) => {
      if (member.key === canonical.key) {
        return {
          originalName: member.originalName,
          action: 'keep' as ColumnNormalizationAction,
          reason: member.reason,
        };
      }
      return {
        originalName: member.originalName,
        action: 'merge' as ColumnNormalizationAction,
        reason: member.reason,
      };
    });

    if (!hasCanonicalColumn && groupMembers.length > 1) {
      const [firstMember, ...rest] = groupMembers;
      if (firstMember) {
        groupMembers[0] = {
          ...firstMember,
          action: 'rename',
        };
        rest.forEach((_, index) => {
          const targetIndex = index + 1;
          const current = groupMembers[targetIndex];
          if (!current) {
            return;
          }
          groupMembers[targetIndex] = {
            ...current,
            action: 'merge',
          };
        });
      }
    }

    const requiresChange = groupMembers.some((member) => member.action !== 'keep');
    if (!requiresChange) {
      continue;
    }

    resultGroups.push({
      canonicalStatus: canonical.status,
      canonicalKey: canonical.key,
      canonicalName: canonical.displayName,
      members: groupMembers,
    });
  }

  return { groups: resultGroups };
};

export const analyzeColumnNormalization = async (
  columnNames: string[],
  canonicalStatuses: string[],
): Promise<ColumnNormalizationAnalysis> => {
  if (columnNames.length === 0 || canonicalStatuses.length === 0) {
    return { groups: [] };
  }

  return runPantheonComputation<ColumnNormalizationRequest, ColumnNormalizationAnalysis>({
    actorName: 'kanban-column-normalizer',
    goal: 'analyze kanban column naming for duplicates',
    request: { columnNames, canonicalStatuses },
    compute: async ({ request }) =>
      computeNormalization(request ?? { columnNames: [], canonicalStatuses: [] }),
  });
};

export const applyColumnNormalization = (
  board: Board,
  analysis: ColumnNormalizationAnalysis,
): number => {
  let changes = 0;

  const findColumn = (name: string): ColumnData | undefined =>
    board.columns.find((col) => COLUMN_KEY_EQUAL(col.name, name));

  for (const group of analysis.groups) {
    const canonicalKey = group.canonicalKey;
    const canonicalName = group.canonicalName;
    const existingCanonical = board.columns.find((col) => columnKey(col.name) === canonicalKey);

    let targetColumn: ColumnData | undefined = existingCanonical;

    if (!targetColumn) {
      const renameCandidate = group.members.find((member) => member.action === 'rename');
      if (renameCandidate) {
        targetColumn = findColumn(renameCandidate.originalName);
        if (targetColumn) {
          targetColumn.name = canonicalName;
          targetColumn.tasks.forEach((task) => {
            task.status = canonicalName;
          });
          targetColumn.count = targetColumn.tasks.length;
          changes++;
        }
      }
    } else if (!COLUMN_KEY_EQUAL(targetColumn.name, canonicalName)) {
      targetColumn.name = canonicalName;
      targetColumn.tasks.forEach((task) => {
        task.status = canonicalName;
      });
      targetColumn.count = targetColumn.tasks.length;
      changes++;
    }

    if (!targetColumn) {
      continue;
    }

    for (const member of group.members) {
      if (COLUMN_KEY_EQUAL(member.originalName, targetColumn.name)) {
        continue;
      }
      const source = findColumn(member.originalName);
      if (!source || source === targetColumn) {
        continue;
      }
      source.tasks.forEach((task) => {
        task.status = canonicalName;
        targetColumn.tasks.push(task);
      });
      targetColumn.count = targetColumn.tasks.length;
      if (targetColumn.limit == null && source.limit != null) {
        targetColumn.limit = source.limit;
      }
      const index = board.columns.indexOf(source);
      if (index >= 0) {
        board.columns.splice(index, 1);
      }
      changes++;
    }
  }

  return changes;
};
