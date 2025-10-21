import { createTransitionRulesEngine } from './packages/kanban/dist/lib/transition-rules.js';
import { readFileSync } from 'fs';

// Test the testing→review transition validation
async function testIntegration() {
  console.log('🧪 Testing Integration: Testing→Review Transition Rule');

  try {
    // Load the transition rules engine
    const engine = await createTransitionRulesEngine('./promethean.kanban.json');

    // Create a test task
    const testTask = {
      uuid: 'test-integration-123',
      title: 'Test Integration Task for Testing→Review Transition',
      status: 'testing',
      priority: 'P0',
      labels: ['testing', 'integration', 'coverage-validation'],
      storyPoints: 3,
      content: `coverage-report: /home/err/devel/promethean/test-coverage-reports/high-coverage.lcov
executed-tests: test-coverage-analysis,test-quality-scoring,test-requirement-mapping
requirement-mappings: [{"requirementId": "REQ-001", "testIds": ["test-coverage-analysis"]}, {"requirementId": "REQ-002", "testIds": ["test-quality-scoring", "test-requirement-mapping"]}]`,
    };

    // Create a mock board
    const testBoard = {
      columns: [
        {
          name: 'testing',
          tasks: [testTask],
          count: 1,
          limit: 8,
        },
        {
          name: 'review',
          tasks: [],
          count: 0,
          limit: 8,
        },
      ],
    };

    console.log('📋 Test Task Created:', testTask.title);
    console.log('📊 Current Status:', testTask.status);
    console.log('🎯 Target Status: review');

    // Test the transition
    console.log('\n🔄 Testing transition validation...');
    const result = await engine.validateTransition('testing', 'review', testTask, testBoard);

    console.log('\n📈 Transition Result:');
    console.log('  Allowed:', result.allowed);
    console.log('  Reason:', result.reason);

    if (result.ruleViolations.length > 0) {
      console.log('  Violations:');
      result.ruleViolations.forEach((violation) => console.log('    -', violation));
    }

    if (result.suggestions.length > 0) {
      console.log('  Suggestions:');
      result.suggestions.forEach((suggestion) => console.log('    -', suggestion));
    }

    // Test with low coverage (should fail)
    console.log('\n🧪 Testing with low coverage (should fail)...');
    const lowCoverageTask = {
      ...testTask,
      content: `coverage-report: /home/err/devel/promethean/test-coverage-reports/low-coverage.lcov
executed-tests: test-coverage-analysis
requirement-mappings: [{"requirementId": "REQ-001", "testIds": ["test-coverage-analysis"]}]`,
    };

    const lowCoverageResult = await engine.validateTransition(
      'testing',
      'review',
      lowCoverageTask,
      testBoard,
    );

    console.log('\n📉 Low Coverage Result:');
    console.log('  Allowed:', lowCoverageResult.allowed);
    console.log('  Reason:', lowCoverageResult.reason);

    if (lowCoverageResult.ruleViolations.length > 0) {
      console.log('  Violations:');
      lowCoverageResult.ruleViolations.forEach((violation) => console.log('    -', violation));
    }

    console.log('\n✅ Integration test completed successfully!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

testIntegration();
