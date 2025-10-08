import test from 'ava';

import {
    parseSystemMarkdown,
    summarizeSystemSections,
    type SystemParseIssue,
} from '../system.js';

test('parseSystemMarkdown returns structured data for a valid document', (t) => {
    const markdown = `---
unit: weather-monitor
version: 1.0.0
---

# Weather Monitor

## Daemon
| Field | Value | Notes |
|-------|-------|-------|
| id | weather-monitor | primary process |
| command | node services/weather/index.js | |
| args | --poll, --interval=5m | |
| env | API_KEY=secret;CITY=seattle | |
| cwd | services/weather | |
| restart_policy | always | ensures resiliency |

## Conditions
| id | description | expression | tags |
|----|-------------|------------|------|
| is_raining | Rain detected by provider. | weather.status == "raining" | weather |
| is_hot | High temperature threshold. | weather.temperature > 80 | weather;temperature |

## Events
| id | when | description |
|----|------|-------------|
| rain_started | is_raining | Rain has begun. |
| heat_wave | is_hot | The temperature exceeds threshold. |

## Actions
| id | type | target | parameters | description |
|----|------|--------|------------|-------------|
| notify_slack | notify | slack-channel | channel=#weather | Send alert to Slack. |
| order_umbrella | purchase | amazon | asin=B00UMD8XZO | Order an umbrella. |

## Schedules
| id | cron | timezone | description |
|----|------|----------|-------------|
| morning_check | 0 7 * * * | America/Los_Angeles | Morning review. |

## Triggers
| id | when | actions | description |
|----|------|---------|-------------|
| rain_alert | rain_started | notify_slack | Notify team about rain. |
| hot_response | heat_wave | notify_slack, order_umbrella | React to heat. |
`;

    const result = parseSystemMarkdown(markdown);

    t.is(result.document.title, 'Weather Monitor');
    t.deepEqual(result.document.metadata, { unit: 'weather-monitor', version: '1.0.0' });
    t.truthy(result.document.daemon);
    t.deepEqual(result.document.daemon?.args, ['--poll', '--interval=5m']);
    t.is(result.document.daemon?.env.API_KEY, 'secret');
    t.is(result.document.daemon?.env.CITY, 'seattle');
    t.is(result.document.daemon?.restartPolicy, 'always');
    t.is(result.document.conditions.length, 2);
    t.deepEqual(result.document.events[0]?.when, ['is_raining']);
    t.deepEqual(result.document.triggers[1]?.actions, ['notify_slack', 'order_umbrella']);
    t.deepEqual(result.document.actions[0]?.parameters, { channel: '#weather' });
    t.is(result.document.schedules[0]?.cron, '0 7 * * *');
    t.deepEqual(result.issues, []);

    const summaries = summarizeSystemSections(markdown);
    const daemonSummary = summaries.find((section) => section.section === 'daemon');
    t.truthy(daemonSummary);
    t.deepEqual(daemonSummary?.paragraphs, []);
    const actionSummary = summaries.find((section) => section.section === 'actions');
    t.truthy(actionSummary);
    t.deepEqual(actionSummary?.paragraphs, []);
});

test('parseSystemMarkdown reports diagnostics for malformed content', (t) => {
    const markdown = `# Broken Unit

## Conditions
| id | description |
|----|-------------|
|  | Missing identifier |

## Events
| id | when |
|----|------|
| event_one | missing_condition |

## Actions
| id | type |
|----|------|
| notify | notify |

## Triggers
| id | when | actions |
|----|------|---------|
| trigger_one | unknown_event | missing_action |
`;

    const result = parseSystemMarkdown(markdown);

    const messages = result.issues.map((issue: SystemParseIssue) => issue.message);
    t.true(messages.some((message) => message.includes('missing an id')));
    t.true(messages.some((message) => message.includes('unknown condition')));
    t.true(messages.some((message) => message.includes('unknown event')));
    t.true(messages.some((message) => message.includes('unknown action')));
    t.is(result.document.daemon, undefined);
});
