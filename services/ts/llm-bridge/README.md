# LLM Bridge

Bridges orchestrator events to the LLM queue:

- Subscribes to `agent.llm.request`
- Enqueues `llm.generate` with a unique `replyTopic`
- Republishes `agent.llm.result` when the LLM replies

Run with pm2:

```bash
pm2 start ecosystem.config.js --only llm-bridge
```

Smoke test:

```bash
node ./tests/adapter.smoke.test.js
```

