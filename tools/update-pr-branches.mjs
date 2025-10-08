#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/**
 * Script to update all PR branches targeting dev/stealth with latest changes
 * This ensures all PRs have the latest lock file fixes
 */

const PRS = [
  { number: 1576, branch: "codex/extend-script-to-emit-inventory-report" },
  { number: 1575, branch: "codex/consolidate-and-normalize-mermaid-diagrams" },
  { number: 1574, branch: "codex/fix-link-bug-in-docops-pipeline" },
  { number: 1573, branch: "codex/record-failing-sample-and-regression-test" },
  { number: 1572, branch: "codex/synchronize-diagrams-and-documentation" },
  { number: 1571, branch: "codex/move-duck-audio-shared-clamp-documentation" },
  { number: 1570, branch: "codex/run-ava-suite-after-audio-tweaks" },
  { number: 1569, branch: "codex/prioritize-documentation-for-p1-tasks" },
  { number: 1568, branch: "codex/align-execution-path-with-feature-flag-docs" },
  { number: 1567, branch: "codex/update-integration-tests-for-legacy-storage" },
  { number: 1566, branch: "codex/address-history-and-persistence-gaps" },
  { number: 1565, branch: "codex/improve-api-documentation-clarity" },
  { number: 1564, branch: "codex/schedule-unit-tests-for-pm2-daemons" },
  { number: 1563, branch: "codex/add-telemetry-for-daemon/condition-workflows" },
  { number: 1562, branch: "codex/formalize-markdown-grammar-and-parser" },
  { number: 1561, branch: "codex/add-telemetry-for-daemon-condition-workflows" },
  { number: 1560, branch: "codex/restore-scanning-accuracy-for-pipelines" },
  { number: 1559, branch: "codex/optimize-piper-pipeline-performance" },
  { number: 1558, branch: "codex/fix-docops-pipeline-file-reference-issue" },
  { number: 1557, branch: "codex/fix-piper-pipeline-caching-issues" },
  { number: 1556, branch: "codex/pair-refactor-with-hygiene-for-automation" },
  { number: 1555, branch: "codex/configure-environment-variables-for-ai-pipelines" },
  { number: 1554, branch: "codex/fix-kanban-config-path-resolution" },
  { number: 1553, branch: "codex/sync-with-kanban-ui-documentation" },
  { number: 1552, branch: "codex/prioritize-real-time-kanban-ui-implementation" },
  { number: 1551, branch: "codex/review-open-checklist-and-backlog-status" }
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

function updatePRBranch(pr) {
  console.log(`\n🔄 Updating PR #${pr.number}: ${pr.branch}`);

  // Fetch the latest from the remote
  const fetchResult = runCommand('git fetch origin');
  if (!fetchResult.success) {
    console.log(`❌ Failed to fetch: ${fetchResult.error}`);
    return false;
  }

  // Checkout the PR branch
  const checkoutResult = runCommand(`git checkout ${pr.branch}`);
  if (!checkoutResult.success) {
    console.log(`❌ Failed to checkout ${pr.branch}: ${checkoutResult.error}`);
    return false;
  }

  // Pull latest changes from dev/stealth
  const rebaseResult = runCommand('git rebase origin/dev/stealth');
  if (!rebaseResult.success) {
    console.log(`⚠️  Rebase conflicts for PR #${pr.number}, attempting to resolve...`);

    // Try to continue rebase if it's just in progress
    const statusResult = runCommand('git status');
    if (statusResult.output.includes('rebasing')) {
      // Check if we need to resolve lock file conflicts specifically
      const conflictedFilesResult = runCommand('git diff --name-only --diff-filter=U');
      const conflictedFiles = conflictedFilesResult.output.split('\n').filter(Boolean);

      console.log(`📋 Conflicted files: ${conflictedFiles.join(', ')}`);

      if (conflictedFiles.includes('pnpm-lock.yaml')) {
        console.log(`🔧 Fixing lock file conflict for PR #${pr.number}`);

        // Use the version from dev/stealth (theirs)
        runCommand('git checkout --theirs pnpm-lock.yaml');
        runCommand('git add pnpm-lock.yaml');

        // Continue the rebase
        const continueResult = runCommand('git rebase --continue');
        if (continueResult.success) {
          console.log(`✅ Successfully resolved lock file conflict for PR #${pr.number}`);
        } else {
          console.log(`❌ Failed to continue rebase for PR #${pr.number}: ${continueResult.error}`);
          runCommand('git rebase --abort');
          return false;
        }
      } else {
        console.log(`❌ Non-lockfile conflicts in PR #${pr.number}, skipping`);
        runCommand('git rebase --abort');
        return false;
      }
    } else {
      console.log(`❌ Failed to rebase PR #${pr.number}: ${rebaseResult.error}`);
      return false;
    }
  } else {
    console.log(`✅ Successfully updated PR #${pr.number}`);
  }

  // Push the updated branch
  const pushResult = runCommand(`git push origin ${pr.branch} --force-with-lease`);
  if (pushResult.success) {
    console.log(`📤 Pushed updated branch for PR #${pr.number}`);
  } else {
    console.log(`⚠️  Failed to push PR #${pr.number}: ${pushResult.error}`);
  }

  return true;
}

function main() {
  console.log('🚀 Starting to update all PR branches targeting dev/stealth...\n');

  // Save current branch
  const currentBranch = runCommand('git branch --show-current').output;
  console.log(`💾 Current branch: ${currentBranch}`);

  let successCount = 0;
  let failureCount = 0;

  for (const pr of PRS) {
    if (updatePRBranch(pr)) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Return to original branch
  runCommand(`git checkout ${currentBranch}`);

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully updated: ${successCount} PRs`);
  console.log(`❌ Failed to update: ${failureCount} PRs`);

  if (failureCount === 0) {
    console.log(`\n🎉 All PR branches have been updated with the latest lock file!`);
  } else {
    console.log(`\n⚠️  Some PRs failed to update. Please check the errors above.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}