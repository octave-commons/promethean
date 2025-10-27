PM2 ecosystem patterns for Promethean: unified `defineApp`, `definePythonService`, `defineNodeService`, per-service ecosystem files, agent (Duck) specialization, and a master aggregator. Optional dynamic loader.

Suggested helper: `dev/pm2Helpers.js`; per-service `ecosystem.config.js` uses thin wrappers.

Goals:
- Declarative service config; minimal duplication
- Shared env/logging/restart defaults
- Clean agent orchestration (Duck)

Related: [../../unique/index|unique/index]

#tags: #devops #pm2 #orchestration

