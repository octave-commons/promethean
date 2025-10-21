#!/usr/bin/env node

// Simple test to verify git tracking fields are added to task frontmatter
import { TaskGitTracker } from './packages/kanban/dist/lib/task-git-tracker.js';

// Test the git tracker
const tracker = new TaskGitTracker();

// Test creating a commit entry
const commitEntry = tracker.createCommitEntry('test-uuid-123', 'create', 'Test task creation');

console.log('Commit entry created:', JSON.stringify(commitEntry, null, 2));

// Test updating frontmatter
const frontmatter = {
  uuid: 'test-uuid-123',
  title: 'Test Task',
  status: 'incoming',
  created_at: '2025-10-19T15:00:00.000Z',
};

const updatedFrontmatter = tracker.updateTaskCommitTracking(
  frontmatter,
  'test-uuid-123',
  'create',
  'Test task creation',
);

console.log('Updated frontmatter:', JSON.stringify(updatedFrontmatter, null, 2));

// Test validation
const validation = tracker.validateTaskCommitTracking(updatedFrontmatter);
console.log('Validation result:', validation);
