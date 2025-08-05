# Heartbeat Service (Node.js)

Tracks process heartbeats via HTTP and terminates those that fail to report within a timeout.
Backed by MongoDB for storage. Intended for detecting and cleaning up hung or orphaned worker processes.
Also enforces the instance limits defined in a PM2 ecosystem file, rejecting registrations that exceed the configured count for a given app name.

## API

- `POST /heartbeat` `{ pid: number, name: string }`
  - Records a heartbeat for the given PID and PM2 app name.
  - Returns `409` if the number of live instances for that name exceeds the limit in the ecosystem config.

## Environment

- `MONGO_URL` (default `mongodb://127.0.0.1:27017`)
- `DB_NAME` (default `heartbeat_db`)
- `HEARTBEAT_TIMEOUT` milliseconds before a process is considered stale (default `10000`)
- `CHECK_INTERVAL` monitor interval in milliseconds (default `5000`)
- `ECOSYSTEM_CONFIG` path to a PM2 ecosystem config file; defaults to `../../../ecosystem.config.js`

## Development

```
npm install
npm test
```

⚠️ Killing processes requires appropriate permissions. Use with care.
