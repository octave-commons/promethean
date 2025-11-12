# @promethean-os/opencode-interface-plugin

> **Session Orchestrator Plugin** – shared tooling that surfaces OpenCode's session indexing and agent orchestration capabilities as plug-and-play OpenCode plugins.

## What's New

- **Renamed plugin**: the long-time `OpencodeInterfacePlugin` is now the clearer **`SessionOrchestratorPlugin`**. Two focused entry points – `SessionIndexingPlugin` (read-only context search) and `AgentOrchestrationPlugin` (session + prompt lifecycle) – sit underneath and can be loaded independently.
- **Shared modules**: formatting, runtime bootstrapping, and tool builders now live in `src/shared`/`src/tools`, so the `@promethean-os/opencode-client` package simply re-exports these implementations (no more drift between repos).
- **Backwards compatible**: `OpencodeInterfacePlugin` still exports as an alias, so existing automation keeps working while you migrate to the new names.

## Installation

```bash
# pnpm
dpnm add @promethean-os/opencode-interface-plugin

# npm
npm install @promethean-os/opencode-interface-plugin

# yarn
yarn add @promethean-os/opencode-interface-plugin
```

Once installed, import whichever surface you need:

```typescript
import {
  SessionOrchestratorPlugin, // combined toolset
  SessionIndexingPlugin, // read-only context/search tools
  AgentOrchestrationPlugin, // session lifecycle + prompts
} from '@promethean-os/opencode-interface-plugin';

// Legacy alias (still works):
import { OpencodeInterfacePlugin } from '@promethean-os/opencode-interface-plugin';
```

## Tooling Breakdown

| Plugin                      | Primary Tools                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| `SessionIndexingPlugin`     | `compile-context`, `search-context`, `list-events`, `list-messages`, `get-message`                 |
| `AgentOrchestrationPlugin`  | `list-sessions`, `get-session`, `close-session`, `spawn-session`, `search-sessions`, `send-prompt` |
| `SessionOrchestratorPlugin` | Combines both tables above (default export)                                                        |

All tools include strong validation + markdown formatting helpers shared from `src/shared/formatters.ts`.

## Usage Example

```typescript
import { SessionOrchestratorPlugin } from '@promethean-os/opencode-interface-plugin';

const plugin = await SessionOrchestratorPlugin(pluginContext);
const { tool } = plugin;

const sessionList = await tool['list-sessions'].execute({ limit: 10, offset: 0 });
console.log(sessionList);
```

## Dev Setup & Local File URLs

1. Build the plugin:
   ```bash
   pnpm install
   pnpm --filter @promethean-os/opencode-interface-plugin build
   ```
2. Point `opencode.json` at the compiled file via `file://` so OpenCode can load it without publishing:

   ```jsonc
   {
     "$schema": "https://opencode.ai/config.json",
     "plugins": [
       {
         "name": "@promethean-os/opencode-interface-plugin",
         "module": "file:///absolute/path/to/packages/opencode-interface-plugin/dist/index.js",
       },
     ],
   }
   ```

   > 💡 Keep the path absolute and include the `file://` prefix. Rebuild (`pnpm build`) after local changes so the dist file stays current.

3. Reload your OpenCode agent/CLI and the plugin will be available immediately.

## Publishing Checklist

1. Run the local test suite:
   ```bash
   pnpm --filter @promethean-os/opencode-interface-plugin test
   ```
2. Build for distribution:
   ```bash
   pnpm --filter @promethean-os/opencode-interface-plugin build
   ```
3. Publish (requires configured npm token):
   ```bash
   pnpm --filter @promethean-os/opencode-interface-plugin npm publish --access public
   ```

Version `0.2.0` introduces the new naming + module layout. Use semantic versioning for future releases.

## Development Commands

```bash
pnpm --filter @promethean-os/opencode-interface-plugin dev   # watch mode
pnpm --filter @promethean-os/opencode-interface-plugin lint  # eslint
pnpm --filter @promethean-os/opencode-interface-plugin test  # ava test suite
```

## License

GPL-3.0-only
