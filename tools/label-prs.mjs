#!/usr/bin/env node

import { execSync } from 'node:child_process';

/**
 * Script to label PRs targeting dev/stealth based on their content and purpose
 */

const PRS = [
  { number: 1576, title: "Add mermaid inventory report to roadmap generator", labels: ["enhancement", "generator", "javascript", "documentation"] },
  { number: 1575, title: "Add task for mermaid diagram consolidation", labels: ["documentation", "markdown", "chore"] },
  { number: 1574, title: "fix(docops): sync rename sequencing", labels: ["docops", "bug"] },
  { number: 1573, title: "Fix wikilink conversion for markdown extensions", labels: ["bug", "markdown", "frontmatter"] },
  { number: 1572, title: "docs: sync duck-revival voice pipeline", labels: ["documentation", "markdown"] },
  { number: 1571, title: "Raise priority of duck-audio shared clamp task", labels: ["documentation", "chore"] },
  { number: 1570, title: "Fix glob escape handling in policy", labels: ["bug", "javascript"] },
  { number: 1569, title: "Fix PCM16k resampling and mic helper wiring", labels: ["bug", "documentation"] },
  { number: 1568, title: "feat: add Cephalon mode feature flag", labels: ["enhancement", "config", "javascript"] },
  { number: 1567, title: "feat: embed voice artifacts as buffers", labels: ["enhancement", "javascript"] },
  { number: 1566, title: "Prioritize Cephalon persistence backlog tasks", labels: ["documentation", "chore"] },
  { number: 1565, title: "Document cephalon guardrail payload metadata", labels: ["documentation", "enhancement"] },
  { number: 1564, title: "feat(shadow-conf): export automation metadata", labels: ["enhancement", "clj", "automation"] },
  { number: 1563, title: "Add task for daemon confirmation telemetry planning", labels: ["documentation", "chore"] },
  { number: 1562, title: "feat: formalize system markdown DSL parser", labels: ["enhancement", "javascript", "markdown", "frontmatter"] },
  { number: 1561, title: "docs: add telemetry capture task for daemon optimizations", labels: ["documentation", "chore"] },
  { number: 1560, title: "Fix simtasks and semverguard pipeline path handling", labels: ["bug", "javascript", "piper"] },
  { number: 1559, title: "Queue piper pipeline timeout task", labels: ["documentation", "chore", "piper"] },
  { number: 1558, title: "Fix docops rename step persistence", labels: ["bug", "docops", "javascript"] },
  { number: 1557, title: "Add regression test for Piper cache hash mode switching", labels: ["enhancement", "javascript", "piper"] },
  { number: 1556, title: "Normalize kanban tasks to FSM statuses", labels: ["enhancement", "documentation", "kanban", "markdown"] },
  { number: 1555, title: "Document Piper environment defaults and templates", labels: ["documentation", "config", "piper"] },
  { number: 1554, title: "Fix kanban repo detection and document usage", labels: ["bug", "kanban", "documentation", "javascript"] },
  { number: 1553, title: "docs: capture Kanban UI sync context", labels: ["documentation", "kanban", "markdown"] },
  { number: 1552, title: "Prioritize kanban dev command task in manual board", labels: ["enhancement", "kanban", "javascript"] },
  { number: 1551, title: "Improve Kanban task complexity typing", labels: ["enhancement", "kanban", "javascript", "documentation"] }
];

function runCommand(cmd, options = {}) {
  try {
    const result = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.trim() || ''
    };
  }
}

async function addLabelsToPR(pr) {
  console.log(`\n🏷️  Labeling PR #${pr.number}: ${pr.title}`);
  console.log(`   Adding labels: ${pr.labels.join(', ')}`);

  try {
    // Add labels one by one to handle cases where some labels might not exist
    for (const label of pr.labels) {
      const result = runCommand(`gh pr edit ${pr.number} --add-label "${label}"`);

      if (result.success) {
        console.log(`   ✅ Added label: ${label}`);
      } else {
        console.log(`   ⚠️  Could not add label "${label}": ${result.error}`);

        // Try to create the label if it doesn't exist
        if (result.error.includes('not found')) {
          console.log(`   📝 Attempting to create label: ${label}`);
          const createResult = runCommand(`gh label create "${label}" --color "CCCCCC" --description "Auto-created label"`);
          if (createResult.success) {
            console.log(`   ✅ Created and added label: ${label}`);
            // Retry adding the label
            const retryResult = runCommand(`gh pr edit ${pr.number} --add-label "${label}"`);
            if (retryResult.success) {
              console.log(`   ✅ Added new label: ${label}`);
            }
          } else {
            console.log(`   ❌ Could not create label: ${label}`);
          }
        }
      }
    }

    // Verify final labels
    const verifyResult = runCommand(`gh pr view ${pr.number} --json labels`);
    if (verifyResult.success) {
      const prData = JSON.parse(verifyResult.output);
      const currentLabels = prData.labels.map(l => l.name);
      console.log(`   📋 Current labels: ${currentLabels.join(', ')}`);
    }

    return true;

  } catch (error) {
    console.log(`   ❌ Failed to label PR #${pr.number}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting to label all PRs targeting dev/stealth...\n');

  let successCount = 0;
  let failureCount = 0;

  for (const pr of PRS) {
    if (await addLabelsToPR(pr)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  console.log(`\n📊 Labeling Summary:`);
  console.log(`✅ Successfully labeled: ${successCount} PRs`);
  console.log(`❌ Failed to label: ${failureCount} PRs`);

  if (failureCount === 0) {
    console.log(`\n🎉 All PRs have been labeled successfully!`);
  } else {
    console.log(`\n⚠️  Some PRs failed to label. Please check the errors above.`);
  }

  console.log(`\n💡 Next steps:`);
  console.log(`   - Review PRs that need attention`);
  console.log(`   - Check for any missing reviews`);
  console.log(`   - Verify CI status checks are passing`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}