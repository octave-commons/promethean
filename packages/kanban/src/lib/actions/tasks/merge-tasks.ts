import { promises as fs } from 'fs';
import path from 'path';
import { stringify as yamlStringify } from 'yaml';
import { readTaskFile, createBackup, generateDiff } from '../../task-content/parser.js';

export type MergeTasksInput = {
  tasksDir: string;
  sourceUuid: string;
  targetUuid: string;
  options?: { createBackup?: boolean };
};

export type MergeTasksResult = {
  success: boolean;
  targetPath?: string;
  sourcePath?: string;
  backupPaths?: string[];
  diff?: string;
};

const findTaskFile = async (tasksDir: string, uuid: string): Promise<string | null> => {
  const files = await fs.readdir(tasksDir);
  const byName = files.find((f) => f.includes(uuid));
  if (byName) return path.join(tasksDir, byName);

  for (const f of files) {
    const p = path.join(tasksDir, f);
    try {
      const { frontmatter } = await readTaskFile(p);
      if (frontmatter && frontmatter.uuid === uuid) return p;
    } catch (_) {
      // ignore
    }
  }

  return null;
};

export const mergeTasks = async (input: MergeTasksInput): Promise<MergeTasksResult> => {
  const { tasksDir, sourceUuid, targetUuid, options } = input;

  if (sourceUuid === targetUuid) {
    throw new Error('source and target UUID must differ');
  }

  const sourcePath = await findTaskFile(tasksDir, sourceUuid);
  const targetPath = await findTaskFile(tasksDir, targetUuid);

  if (!sourcePath) throw new Error(`source task file for ${sourceUuid} not found`);
  if (!targetPath) throw new Error(`target task file for ${targetUuid} not found`);

  const beforeTargetRaw = await fs.readFile(targetPath, 'utf8');
  const sourceParsed = await readTaskFile(sourcePath);
  const targetParsed = await readTaskFile(targetPath);

  const sourceFront = sourceParsed.frontmatter ?? {};
  const targetFront = targetParsed.frontmatter ?? {};

  // Merge simple fields: labels, tags, contributors
  const mergedLabels = Array.from(
    new Set([...(targetFront.labels || []), ...(sourceFront.labels || [])]),
  );
  const mergedTags = Array.from(
    new Set([...(targetFront.tags || []), ...(sourceFront.tags || [])]),
  );

  const mergedFront = { ...targetFront, labels: mergedLabels, tags: mergedTags } as Record<
    string,
    any
  >;

  // Compose merged body: keep target body then append a merged section with source content
  const mergedBody = `${targetParsed.body || ''}

---
### Merged from ${sourceFront.title || sourceUuid}
_Original UUID: ${sourceUuid}_

${sourceParsed.body || ''}
`;

  const yaml = yamlStringify(mergedFront).trim();
  const newTargetRaw = `---\n${yaml}\n---\n\n${mergedBody}`;

  const backupPaths: string[] = [];
  if (options?.createBackup) {
    const b1 = await createBackup(targetPath);
    const b2 = await createBackup(sourcePath);
    if (b1) backupPaths.push(b1);
    if (b2) backupPaths.push(b2);
  }

  await fs.writeFile(targetPath, newTargetRaw, 'utf8');

  // delete source file after merging
  try {
    await fs.unlink(sourcePath);
  } catch (err) {
    // best-effort; if it fails, leave it
  }

  const diff = generateDiff(beforeTargetRaw, newTargetRaw);

  return { success: true, targetPath, sourcePath, backupPaths, diff };
};
