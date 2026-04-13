# OpenCode Tool Configuration for Chronos

To add Chronos to your OpenCode configuration, add this to your `opencode.json`:

```json
{
  "tools": {
    "chronos": {
      "path": "~/.pi/agent/tools/chronos.ts",
      "description": "Time tracker for contracting work. Start/stop sessions and track billable hours."
    }
  }
}
```

Or in OpenCode's native format:

```typescript
// In your opencode configuration
import { chronos } from '~/.pi/agent/tools/chronos';

export default {
  tools: [chronos]
};
```

## Usage in OpenCode

Once configured, the tool is available as:

```
chronos({ action: 'status' })                  // Check status
chronos({ action: 'start', project: 'X' })     // Start session
chronos({ action: 'stop' })                    // Stop session
chronos({ action: 'list' })                    // List sessions
```

## Starting the Server

```bash
cd ~/devel/packages/chronos && bun start
```

Server runs at http://localhost:5199 by default.