# @promethean/omni-protocol

Unified protocol definitions and validation for the Promethean ecosystem.

## Overview

The Omni protocol provides a standardized way for services, agents, and components to communicate within the Promethean framework. It defines:

- TypeScript interfaces for all protocol messages
- Runtime validation with Zod schemas
- Backward compatibility guarantees
- Comprehensive documentation

## Installation

```bash
pnpm add @promethean/omni-protocol
```

## Usage

```typescript
import { OmniMessage, validateOmniMessage } from "@promethean/omni-protocol";

const message: OmniMessage = {
  id: "msg-123",
  type: "request",
  payload: {
    /* ... */
  },
};

const validated = validateOmniMessage(message);
```

## Development

```bash
# Build
pnpm run build

# Test
pnpm run test

# Lint
pnpm run lint

# Type check
pnpm run typecheck
```
