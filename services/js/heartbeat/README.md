# Heartbeat Service (Node.js)

Tracks process heartbeats via HTTP and terminates those that fail to report within a timeout.
Backed by MongoDB for storage. Intended for detecting and cleaning up hung or orphaned worker processes.

## API

- `POST /heartbeat` `{ pid: number }`
  - Records a heartbeat for the given PID.

## Environment

- `MONGO_URL` (default `mongodb://127.0.0.1:27017`)
- `DB_NAME` (default `heartbeat_db`)
- `HEARTBEAT_TIMEOUT` milliseconds before a process is considered stale (default `10000`)
- `CHECK_INTERVAL` monitor interval in milliseconds (default `5000`)

## Development

```
npm install
npm test
```

⚠️ Killing processes requires appropriate permissions. Use with care.
