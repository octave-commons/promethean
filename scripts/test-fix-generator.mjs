#!/usr/bin/env node

/**
 * Test Fix Automation Generator
 * Automatically creates standardized task files for common testing issues
 */

import fs from 'fs';
import path from 'path';

const TEST_FIX_TEMPLATES = {
  'test-failure': {
    title: (testSuite, error) => `Fix test failure in ${testSuite}: ${error}`,
    description: (testSuite, error) => `Test suite ${testSuite} is failing with error: ${error}. This prevents CI/CD pipeline completion and needs immediate resolution.`,
    priority: 'P1',
    labels: (testSuite) => ['testing', 'automation', 'test-fix', testSuite],
    acceptance: (testSuite) => [
      `Analyze test failure in ${testSuite}`,
      `Fix underlying code issues causing test failure`,
      `Ensure all test cases pass`,
      `Verify CI/CD pipeline completes successfully`
    ]
  },

  'test-error': {
    title: (testSuite, error) => `Resolve test error in ${testSuite}: ${error}`,
    description: (testSuite, error) => `Test suite ${testSuite} has errors preventing execution: ${error}. Need to fix test configuration or implementation issues.`,
    priority: 'P1',
    labels: (testSuite) => ['testing', 'automation', 'test-error', testSuite],
    acceptance: (testSuite) => [
      `Fix test execution errors in ${testSuite}`,
      `Update test configuration if needed`,
      `Ensure tests run without errors`,
      `Validate test suite functionality`
    ]
  },

  'integration-test': {
    title: (testSuite, issue) => `Fix integration test issues in ${testSuite}: ${issue}`,
    description: (testSuite, issue) => `Integration test ${testSuite} has issues: ${issue}. These tests verify system component interactions and need fixing.`,
    priority: 'P2',
    labels: (testSuite) => ['testing', 'integration', 'automation', testSuite],
    acceptance: (testSuite) => [
      `Analyze integration test failures in ${testSuite}`,
      `Fix component interaction issues`,
      `Ensure test environment is properly configured`,
      `Validate system integration functionality`
    ]
  },

  'unit-test': {
    title: (testSuite, issue) => `Fix unit test issues in ${testSuite}: ${issue}`,
    description: (testSuite, issue) => `Unit test ${testSuite} has issues: ${issue}. These tests verify individual component behavior and need fixing.`,
    priority: 'P2',
    labels: (testSuite) => ['testing', 'unit', 'automation', testSuite],
    acceptance: (testSuite) => [
      `Fix unit test implementation issues in ${testSuite}`,
      `Ensure test coverage is adequate`,
      `Update test cases to match current functionality`,
      `Validate component behavior tests`
    ]
  },

  'test-timeout': {
    title: (testSuite, issue) => `Fix test timeout issues in ${testSuite}: ${issue}`,
    description: (testSuite, issue) => `Test suite ${testSuite} is timing out: ${issue}. Tests need optimization to complete within time limits.`,
    priority: 'P2',
    labels: (testSuite) => ['testing', 'performance', 'automation', testSuite],
    acceptance: (testSuite) => [
      `Optimize test performance in ${testSuite}`,
      `Increase timeout if necessary and appropriate`,
      `Fix infinite loops or blocking operations`,
      `Ensure tests complete within time limits`
    ]
  },

  'assertion-error': {
    title: (testSuite, issue) => `Fix assertion errors in ${testSuite}: ${issue}`,
    description: (testSuite, issue) => `Test suite ${testSuite} has assertion failures: ${issue}. Need to fix test expectations or code implementation.`,
    priority: 'P2',
    labels: (testSuite) => ['testing', 'assertion', 'automation', testSuite],
    acceptance: (testSuite) => [
      `Fix assertion failures in ${testSuite}`,
      `Update test expectations to match implementation`,
      `Fix code to meet test requirements`,
      `Ensure all assertions pass`
    ]
  }
};

function generateTestFixUUID() {
  return `test-fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTestFixFileName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '.md';
}

function createTestFixTask(template, args, outputPath) {
  const { testSuite, issue, details = {} } = args;
  const uuid = generateTestFixUUID();
  const fileName = generateTestFixFileName(template.title(testSuite, issue));
  const filePath = path.join(outputPath, fileName);

  const frontmatter = [
    '---',
    `uuid: "${uuid}"`,
    `title: "${template.title(testSuite, issue)}"`,
    `slug: "${fileName.replace('.md', '')}"`,
    `status: "incoming"`,
    `priority: "${template.priority}"`,
    `labels: [${template.labels(testSuite).map(l => `"${l}"`).join(', ')}]`,
    `created_at: "${new Date().toISOString()}"`,
    'estimates:',
    '  complexity: "medium"',
    '  scale: "medium"',
    '  time_to_completion: "2-4 hours"',
    '---'
  ].join('\n');

  const content = [
    frontmatter,
    '',
    `# ${template.title(testSuite, issue)}`,
    '',
    '## 📋 Issue Description',
    '',
    template.description(testSuite, issue),
    '',
    '## 🔍 Technical Details',
    '',
    `- **Test Suite**: ${testSuite}`,
    `- **Issue**: ${issue}`,
    '- **Detection**: Automated test fix generator',
    '- **Priority**: High - Blocking CI/CD pipeline',
    '',
    details.analysis ? `## 📊 Analysis\n\n${details.analysis}\n\n` : '',
    '## ✅ Acceptance Criteria',
    '',
    template.acceptance(testSuite).map(criteria => `- [ ] ${criteria}`).join('\n'),
    '',
    '## 🛠️ Implementation Plan',
    '',
    '### Phase 1: Test Analysis (30 minutes)',
    '- [ ] Run failing test suite locally to reproduce issue',
    '- [ ] Analyze test logs and error messages',
    '- [ ] Identify root cause of test failure',
    '- [ ] Check test environment and configuration',
    '',
    '### Phase 2: Fix Implementation (1-2 hours)',
    '- [ ] Fix underlying code issues causing test failure',
    '- [ ] Update test configuration if needed',
    '- [ ] Optimize test performance for timeout issues',
    '- [ ] Fix test assertions or expectations',
    '',
    '### Phase 3: Validation (30 minutes)',
    '- [ ] Run test suite to verify all tests pass',
    '- [ ] Run related test suites to ensure no regressions',
    '- [ ] Execute full test suite to validate CI/CD pipeline',
    '- [ ] Verify test coverage is maintained',
    '',
    '## 📁 Files to Modify',
    '',
    `- Test files for ${testSuite}`,
    `- Implementation files causing test failures`,
    '- Test configuration files if needed',
    '- CI/CD pipeline configuration if relevant',
    '',
    '## 🔗 Related Resources',
    '',
    '- Test logs and error output',
    '- Test suite documentation',
    '- CI/CD pipeline logs',
    '- Previous similar test fix tasks',
    '- Test environment configuration',
    '',
    '## 🎯 Success Metrics',
    '',
    '- All tests in suite pass successfully',
    '- CI/CD pipeline completes without test failures',
    '- Test coverage is maintained or improved',
    '- Test execution time is within acceptable limits',
    '- No regressions in related test suites',
    '',
    '## 🚨 Blocking Issues',
    '',
    '- **CI/CD Pipeline**: Test failure prevents deployment',
    '- **Quality Assurance**: Unverified code changes',
    '- **Team Productivity**: Manual intervention required',
    '',
    '---',
    '',
    `**Generated**: ${new Date().toISOString()} by test-fix-generator.mjs`,
    `**Template**: test-fix-generator`,
    `**Priority**: HIGH - Fix immediately to unblock CI/CD`
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf-8');
  return { filePath, uuid, fileName };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: node test-fix-generator.mjs <fix-type> <test-suite> <issue> [options]

Fix Types:
  - test-failure: General test failures
  - test-error: Test execution errors
  - integration-test: Integration test issues
  - unit-test: Unit test problems
  - test-timeout: Test timeout issues
  - assertion-error: Assertion failures

Examples:
  node test-fix-generator.mjs test-failure "user-service.test" "User creation test failed"
  node test-fix-generator.mjs test-error "integration.test" "Test runner error"
  node test-fix-generator.mjs integration-test "api.test" "API endpoint test failure"
  node test-fix-generator.mjs unit-test "utils.test" "Utility function test failed"

Options:
  --output-dir <path>: Output directory for task files (default: docs/agile/tasks)
  --details <json>: Additional analysis details as JSON string
    `);
    process.exit(1);
  }

  const [fixType, testSuite, issue] = args;
  const outputDir = args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || 'docs/agile/tasks';
  const detailsArg = args.find(arg => arg.startsWith('--details='))?.split('=')[1];
  const details = detailsArg ? JSON.parse(detailsArg) : {};

  if (!TEST_FIX_TEMPLATES[fixType]) {
    console.error(`Error: Unknown fix type "${fixType}"`);
    console.log(`Available fix types: ${Object.keys(TEST_FIX_TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const template = TEST_FIX_TEMPLATES[fixType];
  const taskArgs = { testSuite, issue, details };
  
  try {
    const result = createTestFixTask(template, taskArgs, outputDir);
    console.log(`✅ Test fix task created successfully!`);
    console.log(`📁 File: ${result.filePath}`);
    console.log(`🆔 UUID: ${result.uuid}`);
    console.log(`📝 Name: ${result.fileName}`);
    
    // Suggest next steps
    console.log(`\n🚀 Next Steps:`);
    console.log(`1. Review the generated task: ${result.filePath}`);
    console.log(`2. Move task to appropriate kanban column: pnpm kanban update-status ${result.uuid} ready`);
    console.log(`3. Assign to developer or test engineer`);
    console.log(`4. HIGH PRIORITY - Fix immediately to unblock CI/CD pipeline`);
    
  } catch (error) {
    console.error(`❌ Error creating task file: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createTestFixTask, TEST_FIX_TEMPLATES };