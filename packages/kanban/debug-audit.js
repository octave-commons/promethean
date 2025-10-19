import { TaskGitTracker } from './dist/lib/task-git-tracker.js';

// Test the analyzeTaskStatus method
const gitTracker = new TaskGitTracker();

// Test with a sample task
const sampleTask = {
  uuid: 'test-uuid',
  title: 'Test Task',
  status: 'icebox',
  // Missing lastCommitSha and commitHistory
};

const analysis = gitTracker.analyzeTaskStatus(sampleTask);
console.log('Task analysis result:');
console.log(JSON.stringify(analysis, null, 2));
