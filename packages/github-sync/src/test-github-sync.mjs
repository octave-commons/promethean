#!/usr/bin/env node

import { loadBoard } from '@promethean/kanban';

// Simple test to verify board parsing works using kanban package
async function testBoardParsing() {
  console.log('Testing board parsing with kanban package...');

  try {
    // Load kanban board using the kanban package
    const board = await loadBoard('docs/agile/boards/generated.md', 'docs/agile/tasks');

    console.log('✅ Successfully loaded kanban board');
    console.log(`Board has ${board.columns.length} columns`);

    // Show columns
    const columns = board.columns.map(col => col.name);
    console.log(`✅ Found columns:`, columns);

    // Count total tasks
    let totalTasks = 0;
    const columnTasks = [];

    for (const column of board.columns) {
      console.log(`\nColumn "${column.name}" has ${column.count} tasks:`);
      totalTasks += column.count;

      // Show first few tasks as examples
      const sampleTasks = column.tasks.slice(0, 3);
      sampleTasks.forEach(task => {
        console.log(`  - ${task.title || task.metadata?.title || `Task ${task.uuid}`} (${task.uuid})`);
        columnTasks.push({
          title: task.title || task.metadata?.title || `Task ${task.uuid}`,
          uuid: task.uuid,
          column: column.name,
          status: task.status,
          priority: task.metadata?.priority
        });
      });

      if (column.tasks.length > 3) {
        console.log(`  ... and ${column.tasks.length - 3} more`);
      }
    }

    console.log(`\n✅ Found ${totalTasks} total tasks across all columns`);

    return { board, columns, tasks: columnTasks, totalTasks };

  } catch (error) {
    console.error('❌ Board parsing failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Test GitHub API connectivity
async function testGitHubAPI() {
  console.log('\nTesting GitHub API connectivity...');

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'promethean-systems';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'promethean';

  if (!GITHUB_TOKEN) {
    console.log('⚠️  No GITHUB_TOKEN found, skipping API test');
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const repoData = await response.json();
    console.log('✅ GitHub API connectivity successful');
    console.log(`Repository: ${repoData.full_name}`);
    console.log(`Default branch: ${repoData.default_branch}`);

    return repoData;

  } catch (error) {
    console.error('❌ GitHub API test failed:', error.message);
    throw error;
  }

  testBoardParsing();
}

// Main test runner
async function runTests() {
  console.log('🧪 Running GitHub Sync Tests\n');

  const { board, columns, tasks, totalTasks } = await testBoardParsing();

  if (process.env.GITHUB_TOKEN) {
    await testGitHubAPI();
  } else {
    console.log('\n⚠️  Skipping GitHub API tests (no GITHUB_TOKEN)');
  }

  console.log('\n✅ All tests passed!');
  console.log('\n📝 Summary:');
  console.log(`- Found ${columns.length} columns in board`);
  console.log(`- Found ${totalTasks} tasks in board`);
  console.log('- GitHub API connectivity verified' + (process.env.GITHUB_TOKEN ? '' : ' (skipped)'));
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

export { testBoardParsing, testGitHubAPI };