import { getMongoClient } from '@promethean-os/persistence/clients.js';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
// @ts-ignore - No types available for pidusage
import pidusage from 'pidusage';
import { randomUUID } from 'crypto';
import { BrokerClient } from '@promethean-os/legacy/brokerClient.js';
import { fileURLToPath } from 'url';
import { MongoClient, Collection, Db } from 'mongodb';

interface ProcessMetrics {
  cpu: number;
  memory: number;
  netRx: number;
  netTx: number;
}

interface HeartbeatDocument {
  pid: number;
  name: string;
  last: number;
  sessionId: string;
  cpu?: number;
  memory?: number;
  netRx?: number;
  netTx?: number;
  killedAt?: number;
}

interface EcosystemApp {
  name?: string;
  instances?: number;
}

interface EcosystemConfig {
  apps?: EcosystemApp[];
}

interface HeartbeatEvent {
  pid: string | number;
  name: string;
}

interface ProcessError extends Error {
  code?: string;
}

let HEARTBEAT_TIMEOUT = 10000;
let CHECK_INTERVAL = 5000;
let DB_NAME = 'heartbeat_db';
let COLLECTION = 'heartbeats';
let BROKER_URL = 'ws://127.0.0.1:7000';

let client: MongoClient | null = null;
let collection: Collection<HeartbeatDocument> | null = null;
let interval: NodeJS.Timeout | null = null;
let broker: BrokerClient | null = null;
let allowedInstances: Record<string, number> = {};
let SESSION_ID: string;
let shuttingDown = false;

function isMissingProcessError(err: unknown): err is ProcessError {
  if (!err || typeof err !== 'object') return false;
  const error = err as ProcessError;
  const code = error.code;
  if (code === 'ENOENT' || code === 'ESRCH') return true;
  const message = error.message;
  return typeof message === 'string' && message.includes('No matching pid');
}

async function getProcessMetrics(pid: number): Promise<ProcessMetrics> {
  const metrics: ProcessMetrics = { cpu: 0, memory: 0, netRx: 0, netTx: 0 };
  let processExists = true;
  try {
    const { cpu, memory } = await pidusage(pid);
    metrics.cpu = cpu;
    metrics.memory = memory;
  } catch (err) {
    if (isMissingProcessError(err)) {
      processExists = false;
    } else {
      console.warn(`failed to get cpu/memory for pid ${pid}`, err);
    }
  }
  if (!processExists) {
    return metrics;
  }
  try {
    const data = fs.readFileSync(`/proc/${pid}/net/dev`, 'utf8');
    for (const line of data.trim().split('\n').slice(2)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 17) {
        metrics.netRx += parseInt(parts[1], 10) || 0;
        metrics.netTx += parseInt(parts[9], 10) || 0;
      }
    }
  } catch (err) {
    // ignore network stats errors
  }
  return metrics;
}

function resolveConfigPath(): string {
  if (process.env.ECOSYSTEM_CONFIG) {
    return process.env.ECOSYSTEM_CONFIG;
  }
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(moduleDir, '../../system/daemons/ecosystem.config.js');
}

async function loadConfig(): Promise<void> {
  const require = createRequire(import.meta.url);
  const configPath = resolveConfigPath();
  let ecosystem: EcosystemConfig | undefined;
  let failure: unknown;

  if (fs.existsSync(configPath)) {
    try {
      ecosystem = require(configPath) as EcosystemConfig;
    } catch (err) {
      failure = err;
    }
  }

  if (!ecosystem) {
    try {
      const fallbackModule = await import('./ecosystem.dependencies.js');
      ecosystem = (fallbackModule.default ?? fallbackModule) as EcosystemConfig;
    } catch (err) {
      failure = failure || err;
    }
  }

  if (!ecosystem) {
    if (failure) {
      console.warn('failed to load ecosystem config', failure);
    }
    allowedInstances = {};
    return;
  }

  allowedInstances = {};
  for (const app of ecosystem.apps || []) {
    if (app?.name) {
      allowedInstances[app.name] = app.instances || 1;
    }
  }
}

async function handleHeartbeat({ pid, name }: HeartbeatEvent): Promise<void> {
  const pidNum = parseInt(pid.toString(), 10);
  if (!pidNum || !name || !collection) return;
  const now = Date.now();
  try {
    const existing =
      typeof collection.findOne === 'function'
        ? await collection.findOne({ pid: pidNum, sessionId: SESSION_ID })
        : await collection
            .find({ pid: pidNum, sessionId: SESSION_ID })
            .toArray()
            .then((docs = []) => docs[0]);
    if (!existing) {
      const allowed = allowedInstances[name] ?? Infinity;
      const count = await collection.countDocuments({
        name,
        sessionId: SESSION_ID,
        last: { $gte: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      });
      if (count >= allowed) return;
    }
    const metrics = await getProcessMetrics(pidNum);
    await collection.updateOne(
      { pid: pidNum },
      {
        $set: { pid: pidNum, last: now, name, sessionId: SESSION_ID, ...metrics },
        $unset: { killedAt: '' },
      },
      { upsert: true },
    );
  } catch {
    /* swallow processing errors */
  }
}

export async function monitor(now = Date.now()): Promise<void> {
  if (!collection) return;
  let stale: HeartbeatDocument[] = [];
  try {
    stale = await collection
      .find({
        last: { $lt: now - HEARTBEAT_TIMEOUT },
        killedAt: { $exists: false },
      })
      .toArray();
  } catch {
    return;
  }
  for (const doc of stale) {
    try {
      // Preflight: if process does not exist, mark killed without logging noise
      try {
        process.kill(doc.pid, 0);
      } catch (e) {
        const error = e as ProcessError;
        if (error && error.code === 'ESRCH') {
          await collection.updateOne({ pid: doc.pid }, { $set: { killedAt: now } });
          continue;
        }
      }
      process.kill(doc.pid, 'SIGKILL');
    } catch (err) {
      console.error(`failed to kill pid ${doc.pid}`, err);
    } finally {
      await collection.updateOne({ pid: doc.pid }, { $set: { killedAt: now } });
    }
  }
}

export async function start(): Promise<void> {
  HEARTBEAT_TIMEOUT = parseInt(process.env.HEARTBEAT_TIMEOUT || '10000', 10);
  CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL || '5000', 10);
  DB_NAME = process.env.DB_NAME || DB_NAME;
  COLLECTION = process.env.COLLECTION || COLLECTION;
  BROKER_URL = process.env.BROKER_URL || BROKER_URL;

  await loadConfig();

  SESSION_ID = randomUUID();

  client = await getMongoClient();
  const db: Db = client.db(DB_NAME);
  collection = db.collection(COLLECTION);
  broker = new BrokerClient({ url: BROKER_URL });
  await broker.connect();
  broker.subscribe('heartbeat', (event: { payload?: HeartbeatEvent }) => {
    handleHeartbeat(event.payload || { pid: 0, name: '' }).catch(() => {});
  });
  interval = setInterval(() => {
    monitor().catch(() => {});
  }, CHECK_INTERVAL);
}

export async function cleanup(): Promise<void> {
  if (collection) {
    const now = Date.now();
    try {
      await collection.updateMany(
        { sessionId: SESSION_ID, killedAt: { $exists: false } },
        { $set: { killedAt: now } },
      );
    } catch {
      /* ignore cleanup errors */
    }
  }
}

export async function stop(): Promise<void> {
  await cleanup();
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (broker) {
    try {
      broker.disconnect();
    } catch {}
    broker = null;
  }
  if (client) {
    try {
      await client.close();
    } catch {
      /* ignore errors from closing */
    }
    client = null;
    collection = null;
  }
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Failed to start service', err);
    process.exit(1);
  });
}

async function handleSignal(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  await stop();
  process.exit(0);
}

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, handleSignal);
}

process.on('beforeExit', () => {
  cleanup().catch(() => {});
});
