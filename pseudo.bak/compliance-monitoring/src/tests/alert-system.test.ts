/**
 * Tests for the Alert System
 */

import test from 'ava';
import { EventEmitter } from 'events';
import { AlertSystem } from '../alert-system.js';
import type { ComplianceConfig, ComplianceEvent } from '../types.js';

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
    email: { 
      enabled: false, 
      recipients: ['test@example.com'] 
    },
    slack: { 
      enabled: false, 
      webhook: 'https://hooks.slack.com/test', 
      channel: '#compliance' 
    },
    webhook: { 
      enabled: false, 
      url: 'https://example.com/webhook' 
    }
  },
  retention: {
    events: 7,
    metrics: 30
  }
};

const mockEvents: ComplianceEvent[] = [
  {
    id: 'event-1',
    timestamp: new Date(),
    type: 'VIOLATION',
    severity: 'CRITICAL',
    category: 'SECURITY',
    taskId: 'task-1',
    taskTitle: 'P0 Security Task',
    column: 'Todo',
    description: 'P0 security task in wrong status',
    actionRequired: 'Move to in_progress immediately',
    resolved: false
  },
  {
    id: 'event-2',
    timestamp: new Date(),
    type: 'VIOLATION',
    severity: 'HIGH',
    category: 'WIP',
    column: 'Testing',
    description: 'WIP limit exceeded in Testing column',
    actionRequired: 'Move tasks to create capacity',
    resolved: false
  },
  {
    id: 'event-3',
    timestamp: new Date(),
    type: 'VIOLATION',
    severity: 'MEDIUM',
    category: 'PROCESS',
    taskId: 'task-2',
    taskTitle: 'Regular Task',
    description: 'Task missing priority',
    actionRequired: 'Set task priority',
    resolved: false
  }
];

test('AlertSystem constructor initializes correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  t.truthy(alertSystem);
  t.is(alertSystem['config'].enabled, true);
  t.is(alertSystem['config'].alerts.email.recipients.length, 1);
});

test('AlertSystem status returns correct information', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  const status = alertSystem.getStatus();
  
  t.is(typeof status.emailConfigured, 'boolean');
  t.is(typeof status.slackConfigured, 'boolean');
  t.is(typeof status.webhookConfigured, 'boolean');
  t.is(typeof status.queueLength, 'number');
  t.is(typeof status.processing, 'boolean');
});

test('Alert channels are determined correctly for different severities', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  // Critical event should use all channels
  const criticalChannels = alertSystem['determineAlertChannels'](mockEvents[0]);
  t.true(criticalChannels.includes('dashboard'));
  t.true(criticalChannels.includes('email'));
  t.true(criticalChannels.includes('slack'));
  t.true(criticalChannels.includes('webhook'));
  
  // High event should use dashboard, email, and slack
  const highChannels = alertSystem['determineAlertChannels'](mockEvents[1]);
  t.true(highChannels.includes('dashboard'));
  t.true(highChannels.includes('email'));
  t.true(highChannels.includes('slack'));
  t.false(highChannels.includes('webhook'));
  
  // Medium event should use dashboard and email
  const mediumChannels = alertSystem['determineAlertChannels'](mockEvents[2]);
  t.true(mediumChannels.includes('dashboard'));
  t.true(mediumChannels.includes('email'));
  t.false(mediumChannels.includes('slack'));
  t.false(mediumChannels.includes('webhook'));
});

test('Notification creation works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  const channels = ['dashboard', 'email'];
  
  const notification = alertSystem['createNotification'](mockEvents[0], channels);
  
  t.truthy(notification.id);
  t.is(notification.type, 'VIOLATION');
  t.is(notification.severity, 'CRITICAL');
  t.deepEqual(notification.channels, channels);
  t.truthy(notification.title);
  t.truthy(notification.message);
  t.truthy(notification.data);
  t.false(notification.sent);
});

test('Alert title generation works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  const criticalTitle = alertSystem['generateAlertTitle'](mockEvents[0]);
  t.true(criticalTitle.includes('🚨'));
  t.true(criticalTitle.includes('Security'));
  t.true(criticalTitle.includes('Violation'));
  
  const wipTitle = alertSystem['generateAlertTitle'](mockEvents[1]);
  t.true(wipTitle.includes('⚠️'));
  t.true(wipTitle.includes('WIP Limit'));
  t.true(wipTitle.includes('Violation'));
});

test('Alert message generation works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  const message = alertSystem['generateAlertMessage'](mockEvents[0]);
  
  t.true(message.includes('P0 security task in wrong status'));
  t.true(message.includes('Task: P0 Security Task'));
  t.true(message.includes('Column: Todo'));
  t.true(message.includes('Severity: CRITICAL'));
  t.true(message.includes('Action Required: Move to in_progress immediately'));
});

test('Email formatting works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  const notification = alertSystem['createNotification'](mockEvents[0], ['email']);
  
  const html = alertSystem['formatEmailMessage'](notification);
  
  t.true(html.includes('<!DOCTYPE html>'));
  t.true(html.includes(notification.title));
  t.true(html.includes(notification.message));
  t.true(html.includes('#dc2626')); // Critical color
  t.true(html.includes('Promethean Compliance Monitoring System'));
});

test('Slack formatting works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  const notification = alertSystem['createNotification'](mockEvents[0], ['slack']);
  
  const slackMessage = alertSystem['formatSlackMessage'](notification);
  
  t.truthy(slackMessage.text);
  t.truthy(slackMessage.attachments);
  t.is(slackMessage.attachments[0].color, 'danger'); // Critical severity
  t.true(slackMessage.attachments[0].fields.length > 0);
});

test('Summary report formatting works correctly', (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  const summary = {
    period: 'Daily',
    totalEvents: 10,
    criticalEvents: 2,
    resolvedEvents: 8,
    complianceScore: 85.5
  };
  
  const message = alertSystem['formatSummaryMessage'](summary);
  
  t.true(message.includes('Compliance Summary Report - Daily'));
  t.true(message.includes('Total Events: 10'));
  t.true(message.includes('Critical Events: 2'));
  t.true(message.includes('Resolved Events: 8'));
  t.true(message.includes('Overall Compliance Score: 85.5%'));
  t.true(message.includes('Resolution Rate: 80%'));
});

test('Events are processed correctly', async (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  let notificationSent = false;
  alertSystem.on('notificationSent', () => {
    notificationSent = true;
  });
  
  await alertSystem.processEvents(mockEvents);
  
  // Should have processed events (even if alerts aren't actually sent due to disabled channels)
  t.true(notificationSent || alertSystem['alertQueue'].length > 0);
});

test('Resolved events are skipped for most alert types', async (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  const resolvedEvent: ComplianceEvent = {
    ...mockEvents[0],
    resolved: true,
    resolvedAt: new Date()
  };
  
  await alertSystem.processEvents([resolvedEvent]);
  
  // Should not create notifications for resolved events (unless type is RESOLVED)
  t.is(alertSystem['alertQueue'].length, 0);
});

test('Dashboard alerts are emitted correctly', async (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  let dashboardAlertEmitted = false;
  let emittedNotification = null;
  
  alertSystem.on('dashboardAlert', (notification) => {
    dashboardAlertEmitted = true;
    emittedNotification = notification;
  });
  
  // Simulate dashboard alert
  const notification = alertSystem['createNotification'](mockEvents[0], ['dashboard']);
  await alertSystem['sendDashboardAlert'](notification);
  
  t.true(dashboardAlertEmitted);
  t.truthy(emittedNotification);
  t.is(emittedNotification.id, notification.id);
});

test('Queue processing handles errors gracefully', async (t) => {
  const alertSystem = new AlertSystem({ config: mockConfig });
  
  // Add a notification that will fail (invalid channel)
  const badNotification = {
    id: 'bad-notification',
    type: 'VIOLATION' as const,
    title: 'Test',
    message: 'Test message',
    severity: 'HIGH' as const,
    channels: ['invalid-channel'],
    data: {}
  };
  
  alertSystem['alertQueue'].push(badNotification);
  
  // Should not throw error
  await t.notThrowsAsync(async () => {
    await alertSystem['processAlertQueue']();
  });
  
  // Queue should be empty after processing
  t.is(alertSystem['alertQueue'].length, 0);
});