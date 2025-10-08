#!/usr/bin/env node

import { execSync } from 'node:child_process';

// Remaining PRs that need updating
const REMAINING_PRS = [
  { number: 1553, branch: "codex/sync-with-kanban-ui-documentation" },
  { number: 1552, branch: "codex/prioritize-real-time-kanban-ui-implementation" },
  { number: 1551, branch: "codex/review-open-checklist-and-backlog-status" },
  // PRs that had conflicts - we'll try to update just lock file
  { number: 1572, branch: "codex/synchronize-diagrams-and-documentation" },
  { number: 1570, branch: "codex/run-ava-suite-after-audio-tweaks" },
  { number: 1560, branch: "codex/restore-scanning-accuracy-for-pipelines" },
  { number: 1557, branch: "codex/fix-piper-pipeline-caching-issues" },
  { number: 1556, branch: "codex/pair-refactor-with-hygiene-for-automation" }
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

  // Checkout the PR branch
  const checkoutResult = runCommand(`git checkout ${pr.branch}`);
  if (!checkoutResult.success) {
    console.log(`❌ Failed to checkout ${pr.branch}: ${checkoutResult.error}`);
    return false;
  }

  // Try to merge dev/stealth changes (less likely to conflict than rebase)
  const mergeResult = runCommand('git merge origin/dev/stealth -m "Merge latest dev/stealth changes"');
  if (!mergeResult.success) {
    console.log(`⚠️  Merge conflicts for PR #${pr.number}, attempting to resolve...`);

    // Check if we have lock file conflicts specifically
    const statusResult = runCommand('git status');
    if (statusResult.output.includes('Unmerged paths')) {
      const conflictedFilesResult = runCommand('git diff --name-only --diff-filter=U');
      const conflictedFiles = conflictedFilesResult.output.split('\n').filter(Boolean);

      console.log(`📋 Conflicted files: ${conflictedFiles.join(', ')}`);

      // Always prefer the version from dev/stealth for lock file
      if (conflictedFiles.includes('pnpm-lock.yaml')) {
        console.log(`🔧 Using dev/stealth version of lock file`);
        runCommand('git checkout --theirs pnpm-lock.yaml');
        runCommand('git add pnpm-lock.yaml');
      }

      // For other conflicts, use ours (keep PR changes)
      for (const file of conflictedFiles) {
        if (file !== 'pnpm-lock.yaml') {
          console.log(`🔧 Keeping PR version of ${file}`);
          runCommand(`git checkout --ours ${file}`);
          runCommand(`git add ${file}`);
        }
      }

      // Complete the merge
      const continueResult = runCommand('git commit --no-edit');
      if (continueResult.success) {
        console.log(`✅ Successfully resolved conflicts for PR #${pr.number}`);
      } else {
        console.log(`❌ Failed to complete merge for PR #${pr.number}: ${continueResult.error}`);
        runCommand('git merge --abort');
        return false;
      }
    } else {
      console.log(`❌ Failed to merge PR #${pr.number}: ${mergeResult.error}`);
      runCommand('git merge --abort');
      return false;
    }
  } else {
    console.log(`✅ Successfully merged dev/stealth into PR #${pr.number}`);
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
  console.log('🚀 Continuing to update remaining PR branches...\n');

  // Save current branch
  const currentBranch = runCommand('git branch --show-current').output;
  console.log(`💾 Current branch: ${currentBranch}`);

  let successCount = 0;
  let failureCount = 0;

  for (const pr of REMAINING_PRS) {
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
    console.log(`\n🎉 All remaining PR branches have been updated!`);
  } else {
    console.log(`\n⚠️  Some PRs failed to update. Please check the errors above.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}