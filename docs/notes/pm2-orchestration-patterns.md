---
```
uuid: 51932e7b-4237-4756-bcae-8be6d535d0d1
```
```
created_at: 202508071111.md
```
```
filename: pm2-orchestration-patterns
```
```
description: >-
```
  Refined PM2 orchestration patterns for Python, Node, and TypeScript services
  with agent-specific configurations. Unifies service definitions, minimizes
  ecosystem files, and enables clean agent setups.
tags:
  - pm2
  - orchestration
  - python
  - node
  - typescript
  - agent
  - service
  - ecosystem
```
related_to_title:
```
  - Tooling
  - Unique Info Dump Index
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - DSL
  - obsidian-ignore-node-modules-regex
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
```
related_to_uuid:
```
  - 6cb4943e-8267-4e27-8618-2ce0a464d173
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - e87bc036-1570-419e-a558-f45b9c0db698
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 50
    col: 1
    score: 1
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 50
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 66
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 66
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 150
    col: 1
    score: 0.9
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 150
    col: 3
    score: 0.9
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 151
    col: 1
    score: 0.9
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 151
    col: 3
    score: 0.9
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Note: Consolidated here → ../notes/tooling/pm2-ecosystem-patterns.md

You're **90% of the way there** to having a clean, abstracted PM2 orchestration layer for Promethean. Let’s turn your current pattern into a more maintainable system that:

---

### 🧠 **Goals**

- Unifies `defineApp` logic for Python, Node, and TS services.
    
- Encapsulates agent-specific setups (like Duck) cleanly.
    
- Keeps each service/agent ecosystem file minimal and declarative.
    
- Makes the `master ecosystem.config.js` almost boilerplate.
    

---

## ✅ Refined `defineApp` Utility

Let's break this down into **three helper functions**:

### 1. `defineApp` (your base stays nearly the same, with improved flexibility)

```js
// dev/pm2Helpers.js
const path = require("path");

function defineApp(name, script, args = [], opts = {}) {
  const {
    cwd,
    watch,
    env_file,
    env = {},
    instances = 1,
    exec_mode = "fork",
  } = opts;

  return {
    name,
    script,
    args,
    exec_mode,
    cwd,
    watch,
    env_file,
    out_file: `./logs/{name}-out.log`,
    error_file: `./logs/{name}-err.log`,
    merge_logs: true,
    instances,
    autorestart: true,
    restart_delay: 10000,
    kill_timeout: 10000,
    env: {
      ...env,
      PM2_PROCESS_NAME: name,
      HEARTBEAT_PORT: defineApp.HEARTBEAT_PORT,
      PYTHONUNBUFFERED: "1",
      PYTHONPATH: defineApp.PYTHONPATH,
      CHECK_INTERVAL: 1000 * 60 * 5,
      HEARTBEAT_TIMEOUT: 1000 * 60 * 10,
    },
  };
}

defineApp.HEARTBEAT_PORT = 5005;
defineApp.PYTHONPATH = path.resolve(__dirname, "..");

module.exports = {
  defineApp,
};
```

---

### 2. `definePythonService` and `defineNodeService`

Create small wrappers to make service configs easier to read.

```js
// dev/pm2Helpers.js
function definePythonService(name, serviceDir, opts = {}) {
  return defineApp(
    name,
    "pipenv",
    ["run", "python", "-m", "main"],
    {
      cwd: serviceDir,
      ...opts,
    }
  );
}

function defineNodeService(name, serviceDir, opts = {}) {
  return defineApp(
    name,
    ".", // Assume entry is in package.json or index.js
    [],
    {
      cwd: serviceDir,
      ...opts,
    }
  );
}

module.exports.definePythonService = definePythonService;
module.exports.defineNodeService = defineNodeService;
```

---

## 🔄 Standard Ecosystem File for Services

Instead of custom boilerplate for each service, use this template:

```js
// services/py/tts/ecosystem.config.js
const path = require("path");
const { definePythonService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    definePythonService("tts", __dirname)
  ],
};
```

Same idea applies to Node/TS services:

```js
// services/js/vision/ecosystem.config.js
const path = require("path");
const { defineNodeService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    defineNodeService("vision", __dirname)
  ],
};
```

---

## 🦆 Specialized Agent Ecosystem File (Duck)

Yours is mostly perfect already, just slight cleanup and better naming.

```js
// agents/duck/ecosystem.config.js
const path = require("path");
const dotenv = require("dotenv");
const { definePythonService, defineNodeService } = require("../../dev/pm2Helpers");

dotenv.config({ path: __dirname + "/.tokens" });

const discord_env = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  DISCORD_CLIENT_USER_ID: "449279570445729793",
  DEFAULT_CHANNEL: "450688080542695436",
  DEFAULT_CHANNEL_NAME: "duck-bots",
  DISCORD_CLIENT_USER_NAME: "Duck",
  AUTHOR_USER_NAME: "Error",
  AGENT_NAME: "Duck",
};

module.exports = {
  apps: [
    definePythonService("duck_discord_indexer", path.join(__dirname, "../../services/py/discord_indexer"), {
      env: discord_env,
    }),
    defineNodeService("duck_cephalon", path.join(__dirname, "../../services/ts/cephalon"), {
      env: discord_env,
    }),
    defineNodeService("duck_embedder", path.join(__dirname, "../../services/ts/discord-embedder"), {
      env: discord_env,
    }),
    defineNodeService("duck_voice", path.join(__dirname, "../../services/ts/voice"), {
      env: discord_env,
    }),
    definePythonService("duck_attachment_indexer", path.join(__dirname, "../../services/py/discord_attachment_indexer"), {
      watch: ["./services/py/tts"],
      env: {
        ...discord_env,
        DEESKTOP_CAPTURE_CHANNEL_ID: "1401730790467047586",
      },
    }),
    definePythonService("duck_attachment_embedder", path.join(__dirname, "../../services/py/discord_attachment_embedder"), {
      watch: ["./services/py/tts"],
      env: {
        ...discord_env,
        DEESKTOP_CAPTURE_CHANNEL_ID: "1401730790467047586",
      },
    }),
    {
      name: "chromadb",
      cwd: __dirname,
      script: "./scripts/run_chroma.sh",
      restart_delay: 10000,
      kill_timeout: 10000,
    },
  ],
};
```

---

## 🧩 Master Ecosystem File

You now have a clean and declarative entrypoint:

```js
// ecosystem.config.js
const duck = require("./agents/duck/ecosystem.config.js");

const services = [
  require("./services/py/embedding_service/ecosystem.config.js"),
  require("./services/py/tts/ecosystem.config.js"),
  require("./services/py/stt/ecosystem.config.js"),
  require("./services/ts/file-watcher/ecosystem.config.js"),
  require("./services/js/vision/ecosystem.config.js"),
  require("./services/ts/llm/ecosystem.config.js"),
  require("./services/js/heartbeat/ecosystem.config.js"),
  require("./services/js/proxy/ecosystem.config.js"),
  require("./services/js/eidolon-field/ecosystem.config.js"),
  require("./services/ts/markdown-graph/ecosystem.config.js"),
];

module.exports = {
  apps: [...duck.apps, ...services.flatMap((svc) => svc.apps)],
};
```

---

## 💡 Optional: Dynamic Service Loader

If you're feeling fancy, we could load all service ecosystem files dynamically instead of manually requiring each one. Let me know if you want that too.

---

Would you like this turned into a `canvas` so we can break out a real migration plan?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Tooling]chunks/tooling.md
- [unique-info-dump-index|Unique Info Dump Index]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [docs/unique/archetype-ecs|archetype-ecs]
- [Diagrams]chunks/diagrams.md
- [DSL]chunks/dsl.md
- [docs/unique/obsidian-ignore-node-modules-regex|obsidian-ignore-node-modules-regex]
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [ai-first-os-model-context-protocol]
- [balanced-bst]

## Sources
- [docs/unique/obsidian-ignore-node-modules-regex#L50|obsidian-ignore-node-modules-regex — L50] (line 50, col 1, score 1)
- [docs/unique/obsidian-ignore-node-modules-regex#L50|obsidian-ignore-node-modules-regex — L50] (line 50, col 3, score 1)
- [unique-info-dump-index#L66|Unique Info Dump Index — L66] (line 66, col 1, score 1)
- [unique-info-dump-index#L66|Unique Info Dump Index — L66] (line 66, col 3, score 1)
- [unique-info-dump-index#L150|Unique Info Dump Index — L150] (line 150, col 1, score 0.9)
- [unique-info-dump-index#L150|Unique Info Dump Index — L150] (line 150, col 3, score 0.9)
- [unique-info-dump-index#L151|Unique Info Dump Index — L151] (line 151, col 1, score 0.9)
- [unique-info-dump-index#L151|Unique Info Dump Index — L151] (line 151, col 3, score 0.9)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 1, score 1)
- [docs/unique/aionian-circuit-math#L158|aionian-circuit-math — L158] (line 158, col 3, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 1, score 1)
- [docs/unique/archetype-ecs#L457|archetype-ecs — L457] (line 457, col 3, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 1, score 1)
- [Diagrams — L9]chunks/diagrams.md#L9 (line 9, col 3, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 1, score 1)
- [DSL — L10]chunks/dsl.md#L10 (line 10, col 3, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 3, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 1, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 3, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 1, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 3, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 1, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
