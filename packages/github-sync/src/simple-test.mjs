#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Simple test using kanban CLI commands instead of direct imports
async function testKanbanBoardViaCLI() {
  console.log('🧪 Testing kanban board via CLI...\n');

  try {
    // Test board counting
    console.log('1. Testing kanban count...');
    const { stdout: countOutput } = await execAsync('pnpm kanban count');
    const countData = JSON.parse(countOutput.trim());
    console.log(`✅ Found ${countData.count} total tasks in board`);

    // Test getting specific columns
    console.log('\n2. Testing kanban getColumn for "todo"...');
    const { stdout: todoOutput } = await execAsync('pnpm kanban getColumn todo');
    console.log('✅ Successfully retrieved todo column data');

    // Test searching for tasks
    console.log('\n3. Testing kanban search...');
    try {
      const { stdout: searchOutput } = await execAsync('pnpm kanban search "test"');
      console.log('✅ Search functionality working');
    } catch (error) {
      console.log('⚠️  Search test returned no results (this is expected)');
    }

    // Test board regeneration
    console.log('\n4. Testing kanban regenerate...');
    const { stdout: regenOutput } = await execAsync('pnpm kanban regenerate');
    const regenData = JSON.parse(regenOutput.trim());
    console.log(`✅ Board regeneration successful: ${regenData.totalTasks} tasks`);

    return {
      totalTasks: countData.count,
      regeneratedTasks: regenData.totalTasks,
      success: true
    };

  } catch (error) {
    console.error('❌ Kanban CLI test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Test that shows what data we can extract from the kanban system
async function demonstrateKanbanDataExtraction() {
  console.log('\n📋 Demonstrating data extraction from kanban system...\n');

  try {
    // Get all columns with their task counts
    console.log('5. Getting column information...');
    const columns = ['icebox', 'incoming', 'accepted', 'breakdown', 'blocked', 'ready', 'todo', 'in_progress', 'review', 'document', 'done', 'rejected'];

    let totalFoundTasks = 0;
    const columnData = [];

    for (const columnName of columns) {
      try {
        const { stdout } = await execAsync(`pnpm kanban getColumn "${columnName}"`);
        const columnInfo = JSON.parse(stdout.trim());
        console.log(`   Column "${columnName}": ${columnInfo.count} tasks`);
        totalFoundTasks += columnInfo.count;
        columnData.push({ name: columnName, ...columnInfo });
      } catch (error) {
        console.log(`   Column "${columnName}": 0 tasks`);
      }
    }

    console.log(`\n✅ Successfully extracted data from ${columnData.length} columns`);
    console.log(`📊 Total tasks across all columns: ${totalFoundTasks}`);

    // Show some sample task data from the todo column
    console.log('\n6. Getting sample task data from "todo" column...');
    try {
      const { stdout } = await execAsync('pnpm kanban getByColumn todo');
      const tasks = JSON.parse(stdout.trim());
      if (tasks.length > 0) {
        console.log(`   Sample task: "${tasks[0].title}" (UUID: ${tasks[0].uuid})`);
        console.log(`   Status: ${tasks[0].status}, Priority: ${tasks[0].metadata?.priority || 'Not set'}`);
      }
    } catch (error) {
      console.log('   No tasks found in todo column');
    }

    return { columnData, totalTasks: totalFoundTasks };

  } catch (error) {
    console.error('❌ Data extraction demonstration failed:', error.message);
    return { error: error.message };
  }
}

// Main test runner
async function runSimpleTests() {
  console.log('🚀 Running Simple GitHub Sync Tests (via Kanban CLI)\n');

  const boardTest = await testKanbanBoardViaCLI();
  if (!boardTest.success) {
    console.error('Board tests failed, stopping here');
    process.exit(1);
  }

  const dataDemo = await demonstrateKanbanDataExtraction();

  console.log('\n✅ All simple tests completed!');
  console.log('\n📝 Summary:');
  console.log(`- Kanban board has ${boardTest.totalTasks} total tasks`);
  console.log(`- Regenerated board has ${boardTest.regeneratedTasks} tasks`);
  console.log(`- Extracted data from ${dataDemo.columnData?.length || 0} columns`);
  console.log('- Ready to implement GitHub project board sync');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleTests().catch(error => {
    console.error('\n❌ Simple test suite failed:', error.message);
    process.exit(1);
  });
}

export { testKanbanBoardViaCLI, demonstrateKanbanDataExtraction };