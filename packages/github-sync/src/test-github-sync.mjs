#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import grayMatter from 'gray-matter';

// Simple test to verify board parsing works
function testBoardParsing() {
  console.log('Testing board parsing...');

  try {
    const boardPath = join(process.cwd(), 'docs/agile/boards/generated.md');
    const boardContent = readFileSync(boardPath, 'utf-8');
    const parsed = grayMatter(boardContent);

    console.log('✅ Successfully read kanban board');
    console.log(`Board content length: ${boardContent.length} characters`);

    // Extract columns
    const columnRegex = /^##\s+(.+)$/gm;
    const columnMatches = [...boardContent.matchAll(columnRegex)];
    const columns = columnMatches.map(match => match[1].trim());

    console.log(`✅ Found ${columns.length} columns:`, columns);

    // Extract tasks
    const tasks = [];
    const columnRegexWithContent = /^##\s+(.+?)$(.+?)(?=^##\s+|\s*$)/gms;
    let match;

    while ((match = columnRegexWithContent.exec(boardContent)) !== null) {
      const column = match[1].trim();
      const tasksInSection = match[2];

      // Debug: show a sample of this section
      console.log(`\nDebug - Column "${column}" section sample:`);
      console.log(tasksInSection.substring(0, 200));

      const taskRegex = /-\s+\[ \]\s+\[\[([^\]]+)\]\]/g;
      let taskMatch;
      while ((taskMatch = taskRegex.exec(tasksInSection)) !== null) {
        tasks.push({
          name: taskMatch[1],
          column,
        });
      }
    }

    console.log(`✅ Found ${tasks.length} tasks:`);
    tasks.slice(0, 5).forEach(task => {
      console.log(`  - ${task.name} (${task.column})`);
    });

    if (tasks.length > 5) {
      console.log(`  ... and ${tasks.length - 5} more`);
    }

    return { columns, tasks, boardContent };

  } catch (error) {
    console.error('❌ Board parsing failed:', error.message);
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

  const { columns, tasks, boardContent } = testBoardParsing();

  if (process.env.GITHUB_TOKEN) {
    await testGitHubAPI();
  } else {
    console.log('\n⚠️  Skipping GitHub API tests (no GITHUB_TOKEN)');
  }

  console.log('\n✅ All tests passed!');
  console.log('\n📝 Summary:');
  console.log(`- Found ${columns.length} columns in board`);
  console.log(`- Found ${tasks.length} tasks in board`);
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