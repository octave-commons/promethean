#!/usr/bin/env node

/**
 * Test script for git tracking functionality
 */

import { TaskGitTracker } from './src/lib/task-git-tracker.js';

async function testGitTracking() {
  console.log('🧪 Testing Task Git Tracker...');

  const gitTracker = new TaskGitTracker({ repoRoot: process.cwd() });

  // Test 1: Get current commit SHA
  console.log('\n1. Testing getCurrentCommitSha...');
  const currentSha = gitTracker.getCurrentCommitSha();
  console.log(`   Current SHA: ${currentSha}`);

  // Test 2: Create commit entry
  console.log('\n2. Testing createCommitEntry...');
  const commitEntry = gitTracker.createCommitEntry('test-uuid-123', 'create', 'Test task creation');
  console.log('   Commit entry:', commitEntry);

  // Test 3: Update task frontmatter
  console.log('\n3. Testing updateTaskCommitTracking...');
  const taskFrontmatter = {
    uuid: 'test-uuid-123',
    title: 'Test Task',
    status: 'todo',
    priority: 'P1',
  };

  const updatedFrontmatter = gitTracker.updateTaskCommitTracking(
    taskFrontmatter,
    'test-uuid-123',
    'create',
    'Test task creation',
  );
  console.log('   Updated frontmatter keys:', Object.keys(updatedFrontmatter));
  console.log('   Has lastCommitSha:', !!updatedFrontmatter.lastCommitSha);
  console.log('   Has commitHistory:', !!updatedFrontmatter.commitHistory);
  console.log('   Commit history length:', updatedFrontmatter.commitHistory?.length || 0);

  // Test 4: Validate task commit tracking
  console.log('\n4. Testing validateTaskCommitTracking...');
  const validation = gitTracker.validateTaskCommitTracking(updatedFrontmatter);
  console.log('   Is valid:', validation.isValid);
  console.log('   Issues:', validation.issues);

  // Test 5: Check orphaned detection
  console.log('\n5. Testing isTaskOrphaned...');
  const isOrphaned = gitTracker.isTaskOrphaned(updatedFrontmatter);
  console.log('   Is orphaned:', isOrphaned);

  // Test 6: Test with invalid frontmatter
  console.log('\n6. Testing with invalid frontmatter...');
  const invalidFrontmatter = {
    uuid: 'test-uuid-456',
    title: 'Invalid Task',
    status: 'todo',
    // Missing lastCommitSha and commitHistory
  };

  const invalidValidation = gitTracker.validateTaskCommitTracking(invalidFrontmatter);
  console.log('   Is valid:', invalidValidation.isValid);
  console.log('   Issues:', invalidValidation.issues);
  const isInvalidOrphaned = gitTracker.isTaskOrphaned(invalidFrontmatter);
  console.log('   Is orphaned:', isInvalidOrphaned);

  // Test 7: Get statistics
  console.log('\n7. Testing getCommitTrackingStats...');
  const stats = gitTracker.getCommitTrackingStats([
    { frontmatter: updatedFrontmatter },
    { frontmatter: invalidFrontmatter },
  ]);
  console.log('   Stats:', stats);

  console.log('\n✅ Git tracking tests completed!');
}

testGitTracking().catch(console.error);
