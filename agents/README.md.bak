# Agents

Each agent declares the services it depends on using a `<agent>.ecosystem.js`
file in the repository root. These files are consumed by
[`ecosystem-loader.js`](../ecosystem-loader.js) and can be started directly by
PM2.

## Adding a new agent

1. Copy `duck.ecosystem.js` to `<agent>.ecosystem.js`.
2. List required services with their commands and optional environment.
3. Start the agent with `pm2 start <agent>.ecosystem.js`.

See [`docs/ecosystem-declarations.md`](../docs/ecosystem-declarations.md) for
the schema and additional details.
