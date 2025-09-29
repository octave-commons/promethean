# Heartbeat Service (Node.js)

Tracks process heartbeats published on the message broker and terminates those that fail to report within a timeout.
Backed by MongoDB for storage. Intended for detecting and cleaning up hung or orphaned worker processes.
Also enforces the instance limits defined in a PM2 ecosystem file, rejecting registrations that exceed the configured count for a given app name.
Each heartbeat updates CPU, memory, and network byte counts for the process based on its PID.
Heartbeats are tagged with a service-instance session ID so that restarts do not conflict with stale database entries.
On shutdown the service marks all heartbeats from its current session as killed to allow clean restarts.

## API

- Broker topic `heartbeat`
    - Services publish `{ pid: number, name: string }` messages to this topic.
    - Heartbeats exceeding instance limits are ignored.

## Environment

- `MONGO_URL` (default `mongodb://127.0.0.1:27017`)
- `DB_NAME` (default `heartbeat_db`)
- `HEARTBEAT_TIMEOUT` milliseconds before a process is considered stale (default `10000`)
- `CHECK_INTERVAL` monitor interval in milliseconds (default `5000`)
- `ECOSYSTEM_CONFIG` path to a PM2 ecosystem config file; defaults to `../../system/daemons/ecosystem.config.js`
- `BROKER_URL` WebSocket URL of the message broker (default `ws://127.0.0.1:7000`)

## Development

```
pnpm install
pnpm test
```

⚠️ Killing processes requires appropriate permissions. Use with care.
