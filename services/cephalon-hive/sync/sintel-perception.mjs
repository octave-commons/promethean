#!/usr/bin/env node
/**
 * Sintel Perception Service for Cephalon Hive
 *
 * Runs the Bluesky firehose listener and ingests signals into OpenPlanner.
 * OpenPlanner serves as the data lake for perception events.
 *
 * Environment:
 *   OPENPLANNER_API_BASE_URL - OpenPlanner API URL (default: http://openplanner:7777)
 *   OPENPLANNER_API_KEY - API key for authentication
 *   SINTEL_LOG_LEVEL - Log level: debug, info, warn, error (default: info)
 */

const openplannerUrl = (process.env.OPENPLANNER_API_BASE_URL || 'http://openplanner:7777').replace(/\/+$/, '');
const openplannerApiKey = process.env.OPENPLANNER_API_KEY || 'change-me';
const logLevel = process.env.SINTEL_LOG_LEVEL || 'info';

// Stats tracking
const stats = {
  ingested: 0,
  failed: 0,
  startTime: Date.now(),
};

// Event buffer for batch ingestion
let eventBuffer = [];
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 5000;

function log(level, message, extra = null) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  if (levels[level] >= levels[logLevel]) {
    const prefix = `[sintel-perception ${new Date().toISOString()}]`;
    if (extra) {
      console.log(`${prefix} [${level.toUpperCase()}] ${message}`, JSON.stringify(extra));
    } else {
      console.log(`${prefix} [${level.toUpperCase()}] ${message}`);
    }
  }
}

/**
 * Flush events to OpenPlanner.
 */
async function flushEvents() {
  if (eventBuffer.length === 0) return;

  const events = eventBuffer;
  eventBuffer = [];

  try {
    const response = await fetch(`${openplannerUrl}/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openplannerApiKey}`,
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      const error = await response.text();
      log('error', `OpenPlanner ingestion failed: ${response.status} ${error}`);
      stats.failed += events.length;
      return;
    }

    const result = await response.json();
    stats.ingested += events.length;
    log('debug', `Ingested ${events.length} events into OpenPlanner`);
  } catch (error) {
    log('error', `OpenPlanner request failed: ${error.message}`);
    stats.failed += events.length;
  }
}

function printStats() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const ingestRate = stats.ingested > 0 ? (stats.ingested / uptime).toFixed(1) : '0';
  log('info', `Stats: Ingested ${stats.ingested} events (${ingestRate}/s) | Failed: ${stats.failed}`);
}

/**
 * Parse firehose line and extract events.
 */
function parseFirehoseLine(line) {
  // Match lines like: [BskyFirehose] app.bsky.feed.post
  const match = line.match(/\[BskyFirehose\]\s+(\S+)/);
  if (!match) return null;

  const collection = match[1];
  const kind = collectionToKind(collection);
  return { collection, kind };
}

function collectionToKind(collection) {
  switch (collection) {
    case 'app.bsky.feed.post': return 'post';
    case 'app.bsky.feed.repost': return 'repost';
    case 'app.bsky.feed.like': return 'like';
    case 'app.bsky.graph.follow': return 'follow';
    case 'app.bsky.graph.block': return 'block';
    case 'app.bsky.actor.profile': return 'profile';
    default: return 'other';
  }
}

function createOpenPlannerEvent(kind, collection, author) {
  const id = `bsky-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    schema: 'openplanner.event.v1',
    id,
    ts: new Date().toISOString(),
    source: 'bluesky-firehose',
    kind,
    source_ref: {
      project: 'sintel',
      session: 'bluesky-firehose',
      message: collection,
    },
    text: `Bluesky ${kind} from ${author?.slice(0, 16) || 'unknown'}...`,
    meta: {
      author: author || 'unknown',
      collection,
      type: kind,
    },
  };
}

/**
 * Main entry point - runs the sintel-bsky CLI and forwards to OpenPlanner.
 */
async function main() {
  log('info', '=== Sintel Perception Service Starting ===');
  log('info', `OpenPlanner: ${openplannerUrl}`);
  log('info', `Bluesky relay: wss://bsky.network (via sintel-bsky CLI)`);

  const { spawn } = await import('child_process');

  // Path to the compiled sintel-bsky CLI
  const cliPath = '/workspace/packages/sintel/dist/cli/sintel-bsky.js';

  // Run as child process
  const child = spawn('node', [cliPath, 'firehose', '999999'], {
    cwd: '/workspace/packages/sintel',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  // Track signal counts from output
  let pendingCount = 0;

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      // Check for firehose signal lines
      const parsed = parseFirehoseLine(line);
      if (parsed) {
        const event = createOpenPlannerEvent(parsed.kind, parsed.collection, 'unknown');
        eventBuffer.push(event);
        pendingCount++;

        if (eventBuffer.length >= BATCH_SIZE) {
          flushEvents();
        }
      }
      process.stdout.write(line + '\n');
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      process.stderr.write(`[firehose] ${line}\n`);
    }
  });

  // Stats logging
  const statsInterval = setInterval(printStats, 60000);

  // Periodic flush
  const flushInterval = setInterval(flushEvents, FLUSH_INTERVAL_MS);

  child.on('close', (code) => {
    clearInterval(statsInterval);
    clearInterval(flushInterval);
    log('info', `Firehose exited with code ${code}`);
    log('info', `Final stats: Ingested ${stats.ingested}, Failed ${stats.failed}`);
    process.exit(code);
  });

  child.on('error', (error) => {
    log('error', `Firehose error: ${error.message}`);
    process.exit(1);
  });
}

// Handle shutdown
process.on('SIGINT', () => {
  log('info', 'Shutting down...');
  flushEvents().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  log('info', 'Shutting down...');
  flushEvents().then(() => process.exit(0));
});

main().catch((error) => {
  log('error', `Fatal error: ${error.message}`);
  process.exit(1);
});