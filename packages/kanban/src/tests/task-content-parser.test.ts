import test from 'ava';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  analyzeTaskContent,
  createBackup,
  findSection,
  generateDiff,
  parseTaskContent,
  updateTimestamp,
  validateTaskContent,
} from '../lib/task-content/parser.js';

const SAMPLE_CONTENT = `---
uuid: task-123
title: Sample Task
status: todo
labels:
  - kanban
---
# Description
This task has a description section that explains the work.

## Goals
- Deliver feature
- Maintain quality

## Acceptance Criteria
- Tests pass
- Documentation updated
`;

test('parseTaskContent extracts frontmatter and section metadata', (t) => {
  const result = parseTaskContent(SAMPLE_CONTENT);

  t.like(result.frontmatter, {
    uuid: 'task-123',
    title: 'Sample Task',
    status: 'todo',
  });
  t.truthy(result.body.startsWith('# Description'));
  t.is(result.sections.length, 3);
  const description = result.sections[0];
  t.truthy(description);
  if (description) {
    t.is(description.header, 'Description');
    t.is(description.startPosition, 0);
    t.true(description.endPosition > description.startPosition);
  }
});

test('findSection performs case-insensitive search', (t) => {
  const { sections } = parseTaskContent(SAMPLE_CONTENT);
  const found = findSection(sections, 'acceptance criteria');
  t.truthy(found);
  t.is(found?.header, 'Acceptance Criteria');
});

test('validateTaskContent surfaces errors, warnings, and suggestions', (t) => {
  const malformed = `
# Misc
Minimal info.
`;
  const result = validateTaskContent(malformed);
  t.false(result.valid);
  t.true(result.errors.some((error) => error.includes('UUID')));
  t.true(result.errors.some((error) => error.includes('title')));
  t.true(result.warnings.some((warning) => warning.includes('status')));
  t.true(result.warnings.some((warning) => warning.includes('too brief')));
  t.true(result.suggestions.some((suggestion) => suggestion.includes('description')));
});

test('analyzeTaskContent computes metrics and quality score', (t) => {
  const analysis = analyzeTaskContent(SAMPLE_CONTENT);

  t.like(analysis.frontmatter, { uuid: 'task-123' });
  t.is(analysis.sections.length, 3);
  t.true(analysis.wordCount > 20);
  t.true(analysis.readingTime >= 1);
  t.true(analysis.completeness > 0);
  t.true(analysis.qualityScore > 0.5);
});

test('createBackup copies files and returns backup path', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'kanban-parser-test-'));
  const filePath = path.join(dir, 'task.md');
  await writeFile(filePath, SAMPLE_CONTENT, 'utf8');

  const backupPath = await createBackup(filePath);
  t.truthy(backupPath);
  const backupContent = await readFile(backupPath, 'utf8');
  t.is(backupContent, SAMPLE_CONTENT);
});

test('updateTimestamp augments frontmatter with timestamp', (t) => {
  const updated = updateTimestamp({ uuid: 'task-123', title: 'Sample Task' });
  t.truthy(updated.updated_at);
  t.is(updated.uuid, 'task-123');
});

test('generateDiff reports line level differences', (t) => {
  const before = '# Heading\nOriginal line\n';
  const after = '# Heading\nUpdated line\nExtra line\n';
  const diff = generateDiff(before, after).split('\n');

  t.true(diff.some((line) => line.startsWith('- Original line')));
  t.true(diff.some((line) => line.startsWith('+ Updated line')));
  t.true(diff.some((line) => line.startsWith('+ Extra line')));
  t.true(diff.some((line) => line.startsWith('  # Heading')));
});
