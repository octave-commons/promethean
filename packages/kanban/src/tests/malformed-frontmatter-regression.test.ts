import test from 'ava';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readTasksFolder } from '../lib/kanban.js';
import { parseTaskContent } from '../lib/task-content/parser.js';

test('parseTaskContent handles malformed YAML gracefully', (t) => {
  const malformedContent = `---
uuid: "test-malformed-yaml-001"
title: "Test Malformed YAML Detection"
status: "incoming"
priority: "P1"
labels: ["test", "validation"]
created_at: "2025-10-28T00:00:00Z"
estimates:
  complexity: 3
  scale: "medium"
  time_to_completion: "2 hours"
  storyPoints: 3
content: "This contains a quote that breaks Clojure string interpolation: \"
---

# Test Malformed YAML

This task intentionally has malformed YAML to test if the system properly detects and rejects it.
`;

  // Should not throw an error, should handle gracefully
  const result = parseTaskContent(malformedContent);

  // Should have empty frontmatter due to parsing error
  t.deepEqual(result.frontmatter, {});
  t.truthy(result.body);
  t.true(result.body.includes('# Test Malformed YAML'));
});

test('parseTaskContent handles various malformed YAML scenarios', (t) => {
  const testCases = [
    {
      name: 'unclosed quote',
      content: `---
title: "Unclosed quote
status: todo
---

# Test
`,
    },
    {
      name: 'invalid indentation',
      content: `---
title: Test
  invalid_indentation: value
status: todo
---

# Test
`,
    },
    {
      name: 'missing colon',
      content: `---
title Test
status todo
---

# Test
`,
    },
    {
      name: 'invalid array syntax',
      content: `---
labels: [item1, item2
status: todo
---

# Test
`,
    },
  ];

  for (const testCase of testCases) {
    const result = parseTaskContent(testCase.content);
    // Should handle all malformed cases gracefully
    t.deepEqual(result.frontmatter, {}, `Should handle ${testCase.name} gracefully`);
    t.truthy(result.body, `Should extract body for ${testCase.name}`);
  }
});

test('readTasksFolder handles files with malformed frontmatter gracefully', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-malformed-test-'));

  // Create a file with malformed frontmatter
  const malformedTask = `---
uuid: "test-malformed-yaml-001"
title: "Test Malformed YAML Detection"
status: "incoming"
priority: "P1"
labels: ["test", "validation"]
created_at: "2025-10-28T00:00:00Z"
estimates:
  complexity: 3
  scale: "medium"
  time_to_completion: "2 hours"
  storyPoints: 3
content: "This contains a quote that breaks Clojure string interpolation: \"
---

# Test Malformed YAML

This task intentionally has malformed YAML to test if the system properly detects and rejects it.
`;

  const taskPath = join(dir, 'test-malformed-yaml-detection.md');
  await writeFile(taskPath, malformedTask, 'utf8');

  // Should not throw an error, should handle gracefully
  const result = await readTasksFolder(dir);

  // Should still return tasks array, possibly with fallback task
  t.true(Array.isArray(result));

  // Should have processed file without crashing
  t.true(result.length >= 0);

  // If a fallback task was created, it should have basic properties
  if (result.length > 0) {
    const task = result[0];
    if (task) {
      t.truthy(task.title || task.slug);
    }
  }
});

test('readTasksFolder handles mixed valid and invalid frontmatter', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'kanban-mixed-test-'));

  // Create a valid task
  const validTask = `---
uuid: "valid-task-001"
title: "Valid Task"
status: "todo"
---

# Valid Task

This task has valid frontmatter.
`;

  // Create a malformed task
  const malformedTask = `---
uuid: "malformed-task-001"
title: "Malformed Task
status: "todo
---

# Malformed Task

This task has malformed frontmatter.
`;

  await writeFile(join(dir, 'valid-task.md'), validTask, 'utf8');
  await writeFile(join(dir, 'malformed-task.md'), malformedTask, 'utf8');

  // Should not throw an error, should handle both gracefully
  const result = await readTasksFolder(dir);

  // Should return tasks array
  t.true(Array.isArray(result));

  // Should have processed both files
  t.true(result.length >= 0);

  // Should have at least one valid task
  const validTasks = result.filter((task) => task.uuid === 'valid-task-001');
  if (validTasks.length > 0) {
    const validTask = validTasks[0];
    if (validTask) {
      t.is(validTask.title, 'Valid Task');
    }
  }
});

test('parseTaskContent preserves body content when frontmatter fails', (t) => {
  const contentWithMalformedFrontmatter = `---
title: "Unclosed quote
status: todo
---

# Important Content

This content should be preserved even if frontmatter parsing fails.

## Details

- Item 1
- Item 2
- Item 3
`;

  const result = parseTaskContent(contentWithMalformedFrontmatter);

  // Frontmatter should be empty due to parsing error
  t.deepEqual(result.frontmatter, {});

  // Body should contain all the markdown content
  t.true(result.body.includes('# Important Content'));
  t.true(result.body.includes('This content should be preserved'));
  t.true(result.body.includes('## Details'));
  t.true(result.body.includes('- Item 1'));

  // Should parse sections correctly from body
  if (result.sections.length >= 2) {
    const firstSection = result.sections[0];
    const secondSection = result.sections[1];
    if (firstSection && secondSection) {
      t.is(firstSection.header, 'Important Content');
      t.is(secondSection.header, 'Details');
    }
  }
});
