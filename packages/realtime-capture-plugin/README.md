# @promethean-os/realtime-capture-plugin

Realtime Capture Plugin - Provides real-time indexing and capture functionality for the OpenCode ecosystem.

## Features

- Real-time indexing of sessions, events, and messages
- Automatic capture and storage of OpenCode data
- Efficient background processing
- Configurable capture intervals and filters

## Installation

```bash
pnpm add @promethean-os/realtime-capture-plugin
```

## Usage

```typescript
import { RealtimeCapturePlugin } from '@promethean-os/realtime-capture-plugin';

// Use with OpenCode agent framework
const agent = createAgent({
  plugins: [RealtimeCapturePlugin],
});
```

## License

GPL-3.0-only
