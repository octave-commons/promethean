#!/usr/bin/env node

/**
 * Test script for GitHub project sync tool
 * Tests the conversion functions with sample data
 */

import { convertWikilinksToGithubMarkdown, parseKanbanBoard } from './github-project-sync.mjs';

// Sample kanban content for testing
const sampleKanbanContent = `---
kanban-plugin: board
---

## icebox

- [ ] [[obsidian-replacement|obsidian replacement md]] #obsidian #replacement #can #than prio:P3 (uuid:ddad0e6a-9019-4cc8-900e-93549b5ee845)
- [ ] [[structure_vault_to_mirror_services_agents_docs|structure vault to mirror services agents docs md md]] #structure #mirror #docs #vault prio:P3 (uuid:c6139027-bd0a-4f44-a200-c04829e35220)

## incoming

- [ ] [[cephalon_feature_flag_path_selection|cephalon feature flag path selection]] #cephalon #flag #feature #path prio:P3 (uuid:1f5f505f-155d-4a1b-ba1b-73cb1dd0ea97)
- [ ] [[implement-kanban-dev-command-with-real-time-sync-and-ui-hosting|Implement kanban dev command with real-time sync and UI hosting]] #kanban #dev-experience #file-watching #real-time-sync #ui-hosting #cli-enhancement prio:P1 (uuid:7b8c9d0e-1f2a-3b4c-5d6e-7f8g9h0i1j2k)

## ready

- [ ] [[add-docker-compose-files-to-services|add docker compose files to services]] #add #docker #compose #files prio:p3 (uuid:0a4d6f50-753a-48ef-a9a0-10f279eb621b)
`;

// Sample task content with wikilinks
const sampleTaskContent = `---
uuid: "1f5f505f-155d-4a1b-ba1b-73cb1dd0ea97"
title: "cephalon feature flag path selection"
status: "incoming"
priority: "P3"
labels: ["cephalon", "flag", "feature", "path"]
---

Cephalon: Feature-flag classic vs ECS path

Goal: Add a feature flag to select between the classic \`AIAgent\` flow and the newer ECS orchestrator flow to simplify debugging and rollout.

Why: Codebase is in-between worlds; a flag allows toggling behavior while we complete persistence and context wiring.

Scope:
- Env var \`CEPHALON_MODE\` in [[services/ts/cephalon/src/index.ts]] to choose startup path.
- Document behavior and defaults; add note in [[README]] for temporary nature.

See also:
- [[ecs-migration-path-docs]]
- [[cephalon-persist-llm-replies-to-agent-messages]]

## Implementation Details

### Configuration
Add to [[env-config]]:
\`\`\`toml
[cephalon]
mode = "ecs" # or "classic"
\`\`\`

### Migration Path
1. [[step-1]]: Add flag parsing
2. [[step-2]]: Update [[bootstrap-flow]]
3. [[step-3]]: Test both paths

#incoming #cephalon #feature-flag #migration
`;

console.log('🧪 Testing GitHub Project Sync Tool\n');

console.log('1️⃣ Testing wikilink conversion...');
const convertedContent = convertWikilinksToGithubMarkdown(sampleTaskContent);
console.log('✅ Wikilink conversion successful');
console.log('Sample converted content:');
console.log(convertedContent.slice(0, 300) + '...\n');

console.log('2️⃣ Testing kanban board parsing...');
const { columns, columnOrder } = parseKanbanBoard(sampleKanbanContent);
console.log('✅ Kanban board parsing successful');
console.log('Found columns:', columnOrder);
console.log('Tasks per column:');
columnOrder.forEach(column => {
  console.log(`  ${column}: ${columns[column].length} tasks`);
});

if (columns['icebox'] && columns['icebox'].length > 0) {
  const sampleTask = columns['icebox'][0];
  console.log('\n3️⃣ Sample parsed task:');
  console.log(JSON.stringify(sampleTask, null, 2));
}

console.log('\n🎉 All tests passed!');
console.log('\n💡 To run the full sync:');
console.log('   GITHUB_TOKEN=your_token node tools/github-project-sync.mjs');
console.log('   GITHUB_TOKEN=your_token DRY_RUN=true node tools/github-project-sync.mjs');