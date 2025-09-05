---
uuid: 7a66bc1e-9276-41ce-ac22-fc08926acb2d
created_at: pm2-orchestration-patterns.md
filename: pm2-orchestration-patterns
title: pm2-orchestration-patterns
description: >-
  Refined PM2 orchestration patterns for unified service management across
  Python, Node, and TypeScript ecosystems with minimal boilerplate.
tags:
  - pm2
  - orchestration
  - service
  - python
  - node
  - typescript
  - decomposition
  - boilerplate
  - agent
---
Note: Consolidated here → ../notes/tooling/pm2-ecosystem-patterns.md ^ref-51932e7b-1-0

You're **90% of the way there** to having a clean, abstracted PM2 orchestration layer for Promethean. Let’s turn your current pattern into a more maintainable system that: ^ref-51932e7b-3-0

---

### 🧠 **Goals**

- Unifies `defineApp` logic for Python, Node, and TS services. ^ref-51932e7b-9-0
    
- Encapsulates agent-specific setups (like Duck) cleanly. ^ref-51932e7b-11-0
    
- Keeps each service/agent ecosystem file minimal and declarative. ^ref-51932e7b-13-0
    
- Makes the `master ecosystem.config.js` almost boilerplate.
    

---

## ✅ Refined `defineApp` Utility

Let's break this down into **three helper functions**: ^ref-51932e7b-22-0

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
    out_file: `./logs/${name}-out.log`,
    error_file: `./logs/${name}-err.log`,
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
^ref-51932e7b-26-0 ^ref-51932e7b-74-0

---

### 2. `definePythonService` and `defineNodeService`
 ^ref-51932e7b-79-0
Create small wrappers to make service configs easier to read.
 ^ref-51932e7b-81-0
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
^ref-51932e7b-81-0
```

---

## 🔄 Standard Ecosystem File for Services ^ref-51932e7b-115-0

Instead of custom boilerplate for each service, use this template: ^ref-51932e7b-117-0

```js
// services/py/tts/ecosystem.config.js
const path = require("path");
const { definePythonService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    definePythonService("tts", __dirname)
  ],
^ref-51932e7b-117-0
}; ^ref-51932e7b-129-0
```
 ^ref-51932e7b-131-0
Same idea applies to Node/TS services:

```js
// services/js/vision/ecosystem.config.js
const path = require("path");
const { defineNodeService } = require("../../../dev/pm2Helpers");

module.exports = {
  apps: [
    defineNodeService("vision", __dirname)
^ref-51932e7b-131-0
  ],
};
```

--- ^ref-51932e7b-147-0

## 🦆 Specialized Agent Ecosystem File (Duck) ^ref-51932e7b-149-0

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
^ref-51932e7b-149-0
    },
  ],
};
```
 ^ref-51932e7b-210-0
---
 ^ref-51932e7b-212-0
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
^ref-51932e7b-212-0

module.exports = {
  apps: [...duck.apps, ...services.flatMap((svc) => svc.apps)],
};
``` ^ref-51932e7b-238-0
^ref-51932e7b-217-0

---
 ^ref-51932e7b-242-0
## 💡 Optional: Dynamic Service Loader ^ref-51932e7b-242-0

If you're feeling fancy, we could load all service ecosystem files dynamically instead of manually requiring each one. Let me know if you want that too.
 ^ref-51932e7b-245-0
---
 ^ref-51932e7b-247-0 ^ref-51932e7b-248-0
Would you like this turned into a `canvas` so we can break out a real migration plan?
