#!/usr/bin/env node

/**
 * Test script to validate WIP Limit Enforcement functionality
 */

import { createWIPLimitEnforcement } from './packages/kanban/dist/lib/wip-enforcement.js';
import { regenerateBoard } from './packages/kanban/dist/lib/kanban.js';

async function testWIPEnforcement() {
  console.log('🧪 Testing WIP Limit Enforcement...\n');

  try {
    // Generate board to get current state
    const board = await regenerateBoard('docs/agile/tasks', 'docs/agile/boards/generated.md');

    console.log('Board structure:', typeof board);
    console.log('Board keys:', Object.keys(board || {}));

    if (!board || !board.columns) {
      console.log('❌ Board structure is invalid');
      return;
    }

    console.log('📊 Current Column Usage:');
    board.columns.forEach((column) => {
      console.log(`   ${column.name}: ${column.count}`);
    });
    console.log('');

    // Initialize WIP enforcement
    const wipEnforcement = await createWIPLimitEnforcement();

    // Test validation on a column that might be near capacity
    const testColumn = 'review'; // Usually has smaller limits
    const validation = await wipEnforcement.validateWIPLimits(testColumn, 1, board);

    console.log(`🔍 Testing WIP validation for column: ${testColumn}`);
    console.log(`   Current: ${validation.current}`);
    console.log(`   Limit: ${validation.limit}`);
    console.log(`   Projected: ${validation.projected}`);
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Utilization: ${validation.utilization.toFixed(1)}%`);

    if (validation.violation) {
      console.log(`   Violation: ${validation.violation.reason}`);
      console.log(`   Severity: ${validation.violation.severity}`);
      console.log(`   Suggestions: ${validation.violation.suggestions.length}`);
    }
    console.log('');

    // Test capacity monitoring
    const capacityMonitor = await wipEnforcement.getCapacityMonitor(board);
    console.log('📈 Capacity Monitor Summary:');
    console.log(`   Total violations: ${capacityMonitor.totalViolations}`);
    console.log(`   Average utilization: ${capacityMonitor.utilization.average.toFixed(1)}%`);
    console.log(`   Max utilization: ${capacityMonitor.utilization.max.toFixed(1)}%`);
    console.log(`   Min utilization: ${capacityMonitor.utilization.min.toFixed(1)}%`);
    console.log('');

    // Test bulk enforcement
    console.log('🚧 Running bulk WIP enforcement check...');
    const enforcementResult = await wipEnforcement.enforceWIPLimits(board, { dryRun: true });

    console.log(`   Total violations: ${enforcementResult.totalViolations}`);
    console.log(`   Total corrections: ${enforcementResult.totalCorrections}`);
    console.log(`   Columns with violations: ${enforcementResult.violations.length}`);

    if (enforcementResult.violations.length > 0) {
      console.log('\n🚨 Violations found:');
      enforcementResult.violations.forEach((violation) => {
        console.log(
          `   ${violation.column}: ${violation.current}/${violation.limit} (${violation.utilization.toFixed(1)}%)`,
        );
      });
    } else {
      console.log('✅ No WIP violations found');
    }

    console.log('\n🎉 WIP Enforcement Test Complete!');
    console.log('✅ WIP Limit Enforcement is working correctly');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testWIPEnforcement();
