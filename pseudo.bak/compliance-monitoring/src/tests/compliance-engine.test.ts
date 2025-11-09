/**
 * Tests for the Compliance Engine
 */

import test from 'ava';
import { ComplianceEngine } from '../compliance-engine.js';
import type { ComplianceConfig, Task, Board } from '../types.js';

const mockConfig: ComplianceConfig = {
  enabled: true,
  scanInterval: 60,
  wipThresholds: {
    warning: 80,
    critical: 95
  },
  security: {
    p0RequiredStatuses: ['in_progress', 'testing', 'review'],
    scanInterval: 300,
    tools: ['semgrep']
  },
  alerts: {
    email: { enabled: false, recipients: [] },
    slack: { enabled: false, webhook: '', channel: '' },
    webhook: { enabled: false, url: '' }
  },
  retention: {
    events: 7,
    metrics: 30
  }
};

const mockBoard: Board = {
  columns: [
    {
      name: 'In Progress',
      count: 3,
      limit: 5,
      tasks: [
        {
          uuid: 'task-1',
          title: 'Test Task 1',
          priority: 'P1',
          status: 'in_progress',
          content: 'Test content',
          estimates: { complexity: 3 }
        },
        {
          uuid: 'task-2',
          title: 'P0 Security Task',
          priority: 'P0',
          status: 'in_progress',
          content: 'Security implementation details',
          estimates: { complexity: 5 }
        }
      ]
    },
    {
      name: 'Testing',
      count: 8,
      limit: 5,
      tasks: [
        {
          uuid: 'task-3',
          title: 'P0 Task in Wrong Column',
          priority: 'P0',
          status: 'testing',
          content: 'Should be in progress'
        }
      ]
    }
  ],
  metadata: {
    lastUpdated: new Date(),
    totalTasks: 11
  }
};

test('ComplianceEngine constructor initializes correctly', (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  t.truthy(engine);
  t.is(engine['config'].enabled, true);
  t.is(engine['config'].scanInterval, 60);
});

test('ComplianceEngine can be started and stopped', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  await engine.start();
  t.is(await engine.getComplianceStatus().then(s => s.isRunning), true);
  
  await engine.stop();
  t.is(await engine.getComplianceStatus().then(s => s.isRunning), false);
});

test('ComplianceEngine performs scan correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  // Mock the getCurrentBoard method
  engine['getCurrentBoard'] = async () => mockBoard;
  
  const result = await engine.performScan();
  
  t.truthy(result);
  t.truthy(result.scanId);
  t.truthy(result.startTime);
  t.truthy(result.endTime);
  t.true(result.duration > 0);
  t.truthy(result.wipStatus);
  t.truthy(result.processStatus);
  t.truthy(result.securityStatus);
  t.truthy(result.events);
  t.truthy(result.metrics);
});

test('WIP compliance detection works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  engine['getCurrentBoard'] = async () => mockBoard;
  
  const result = await engine.performScan();
  
  // Testing column should be over limit (8 > 5)
  const testingColumn = result.wipStatus.find(w => w.columnName === 'Testing');
  t.truthy(testingColumn);
  t.is(testingColumn.currentCount, 8);
  t.is(testingColumn.limit, 5);
  t.is(testingColumn.status, 'VIOLATION');
  t.true(testingColumn.utilization > 100);
  
  // In Progress column should be compliant (3 <= 5)
  const inProgressColumn = result.wipStatus.find(w => w.columnName === 'In Progress');
  t.truthy(inProgressColumn);
  t.is(inProgressColumn.currentCount, 3);
  t.is(inProgressColumn.limit, 5);
  t.is(inProgressColumn.status, 'COMPLIANT');
});

test('P0 task compliance detection works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  engine['getCurrentBoard'] = async () => mockBoard;
  
  const result = await engine.performScan();
  
  // Should detect P0 task in wrong column (Testing instead of in_progress)
  const p0Violations = result.events.filter(e => 
    e.category === 'SECURITY' && e.severity === 'CRITICAL'
  );
  t.true(p0Violations.length > 0);
  
  const p0Violation = p0Violations.find(e => e.taskId === 'task-3');
  t.truthy(p0Violation);
  t.true(p0Violation.description.includes('P0 security task in wrong status'));
});

test('Metrics calculation works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  engine['getCurrentBoard'] = async () => mockBoard;
  
  const result = await engine.performScan();
  
  t.truthy(result.metrics);
  t.true(result.metrics.overallCompliance >= 0);
  t.true(result.metrics.overallCompliance <= 100);
  t.true(result.metrics.wipCompliance >= 0);
  t.true(result.metrics.wipCompliance <= 100);
  t.true(result.metrics.processCompliance >= 0);
  t.true(result.metrics.processCompliance <= 100);
  t.true(result.metrics.securityCompliance >= 0);
  t.true(result.metrics.securityCompliance <= 100);
});

test('Task compliance validation works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  // Test valid task
  const validTask: Task = {
    uuid: 'valid-task',
    title: 'Valid Task',
    priority: 'P1',
    status: 'in_progress',
    content: 'Valid content',
    estimates: { complexity: 3 }
  };
  
  const validCompliance = await engine['validateTaskCompliance'](validTask, mockBoard);
  t.is(validCompliance.taskId, 'valid-task');
  t.is(validCompliance.violations.length, 0);
  t.is(validCompliance.complianceScore, 100);
  
  // Test invalid task (missing title)
  const invalidTask: Task = {
    uuid: 'invalid-task',
    title: '',
    priority: 'P1',
    status: 'in_progress',
    content: 'Invalid content'
  };
  
  const invalidCompliance = await engine['validateTaskCompliance'](invalidTask, mockBoard);
  t.is(invalidCompliance.taskId, 'invalid-task');
  t.true(invalidCompliance.violations.length > 0);
  t.true(invalidCompliance.complianceScore < 100);
  
  const titleViolation = invalidCompliance.violations.find(v => v.type === 'MISSING_TITLE');
  t.truthy(titleViolation);
  t.is(titleViolation.severity, 'HIGH');
});

test('P0 task specific validation works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  // Test P0 task in wrong column
  const p0Task: Task = {
    uuid: 'p0-task',
    title: 'P0 Security Task',
    priority: 'P0',
    status: 'todo',
    content: 'Security content'
  };
  
  const p0Compliance = await engine['validateP0TaskCompliance'](p0Task, 'todo');
  t.is(p0Compliance.taskId, 'p0-task');
  t.true(p0Compliance.violations.length > 0);
  
  const wrongStatusViolation = p0Compliance.violations.find(v => v.type === 'P0_WRONG_STATUS');
  t.truthy(wrongStatusViolation);
  t.is(wrongStatusViolation.severity, 'CRITICAL');
});

test('Event generation works correctly', async (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  engine['getCurrentBoard'] = async () => mockBoard;
  
  const result = await engine.performScan();
  
  t.true(result.events.length > 0);
  
  // Check that events have required properties
  for (const event of result.events) {
    t.truthy(event.id);
    t.truthy(event.timestamp);
    t.truthy(event.type);
    t.truthy(event.severity);
    t.truthy(event.category);
    t.truthy(event.description);
    t.truthy(event.actionRequired);
    t.is(typeof event.resolved, 'boolean');
  }
});

test('Security score calculation works correctly', (t) => {
  const engine = new ComplianceEngine({ config: mockConfig });
  
  // Test perfect score
  const perfectScore = engine['calculateSecurityScore'](0, 0, 0);
  t.is(perfectScore, 100);
  
  // Test score with violations
  const scoreWithViolations = engine['calculateSecurityScore'](1, 2, 3);
  t.true(scoreWithViolations < 100);
  t.true(scoreWithViolations >= 0);
  
  // Test score with many violations
  const lowScore = engine['calculateSecurityScore'](4, 10, 20);
  t.true(lowScore < 50);
});

test('Event history trimming works correctly', async (t) => {
  const engine = new ComplianceEngine({ 
    config: { 
      ...mockConfig, 
      retention: { events: 1, metrics: 30 } 
    } 
  });
  
  // Add old events to history
  const oldDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  engine['eventHistory'] = [
    {
      id: 'old-event',
      timestamp: oldDate,
      type: 'VIOLATION',
      severity: 'HIGH',
      category: 'WIP',
      description: 'Old event',
      actionRequired: 'None',
      resolved: false
    }
  ];
  
  // Trigger trimming
  engine['trimEventHistory']();
  
  // Should be trimmed (older than 1 day)
  t.is(engine['eventHistory'].length, 0);
});