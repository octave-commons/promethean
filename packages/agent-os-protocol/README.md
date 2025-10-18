# Agent OS Core Message Protocol

A unified, robust messaging protocol designed to address fragmentation in existing agent communication patterns while providing enterprise-grade security, observability, and scalability.

## Features

- **Unified Core**: Single protocol foundation with extensible specializations
- **Zero-Trust Security**: Security by default with capability-based access control
- **Observable by Design**: Built-in tracing, metrics, and logging
- **Developer Experience**: Type-safe APIs with comprehensive tooling
- **Production Ready**: Enterprise-grade reliability and performance
- **Crisis Management**: Emergency coordination and resolution system

## Installation

```bash
npm install @promethean/agent-os-protocol
```

## Quick Start

```typescript
import {
  CrisisCoordinator,
  UniversalProtocolAdapter,
  CrisisMessageType,
  CrisisLevel,
} from '@promethean/agent-os-protocol';

// Initialize crisis coordinator
const coordinator = new CrisisCoordinator();

// Handle a crisis
const crisis = {
  id: 'crisis-001',
  type: CrisisMessageType.DUPLICATE_TASKS,
  level: CrisisLevel.HIGH,
  coordinationId: 'coord-123',
  affectedAgents: [{ id: 'agent1', namespace: 'test', domain: 'example' }],
  requiredActions: ['consolidate', 'prioritize'],
  deadline: new Date(Date.now() + 3600000).toISOString(),
};

const resolution = await coordinator.handleCrisisMessage(crisis);
console.log('Crisis resolved:', resolution);
```

## Protocol Adapters

The protocol includes adapters for existing agent communication formats:

### Agent Bus Adapter

```typescript
import { AgentBusAdapter } from '@promethean/agent-os-protocol';

const adapter = new AgentBusAdapter();
const coreMessage = adapter.toCoreMessage(agentBusMessage);
```

### Omni Protocol Adapter

```typescript
import { OmniAdapter } from '@promethean/agent-os-protocol';

const adapter = new OmniAdapter();
const coreMessage = adapter.toCoreMessage(omniMessage);
```

### Enso Protocol Adapter

```typescript
import { EnsoAdapter } from '@promethean/agent-os-protocol';

const adapter = new EnsoAdapter();
const coreMessage = adapter.toCoreMessage(ensoMessage);
```

### Universal Adapter

```typescript
import { UniversalProtocolAdapter } from '@promethean/agent-os-protocol';

const adapter = new UniversalProtocolAdapter();
const coreMessage = adapter.autoConvert(anyMessage); // Auto-detects protocol
```

## Crisis Management

The protocol includes a comprehensive crisis management system:

### Crisis Types

- `DUPLICATE_TASKS` - Handle duplicate task consolidation
- `SECURITY_VALIDATION` - Coordinate security validation
- `DEPLOYMENT_SYNC` - Synchronize deployments
- `BOARD_MANAGEMENT` - Resolve kanban board issues
- `TASK_PRIORITIZATION` - Reprioritize tasks
- `AGENT_OVERLOAD` - Redistribute agent workload
- `RESOURCE_CONTENTION` - Resolve resource conflicts

### Example: Handling Duplicate Tasks

```typescript
const duplicateCrisis = {
  id: 'dup-001',
  type: CrisisMessageType.DUPLICATE_TASKS,
  level: CrisisLevel.HIGH,
  coordinationId: 'task-consolidation',
  affectedAgents: [{ id: 'task-consolidator', namespace: 'tasks', domain: 'consolidation' }],
  requiredActions: ['consolidate_duplicates'],
  deadline: new Date(Date.now() + 3600000).toISOString(),
};

const resolution = await coordinator.handleCrisisMessage(duplicateCrisis);
console.log(`Consolidated ${resolution.results?.tasksConsolidated} tasks`);
```

## Core Message Format

All messages follow the CoreMessage format:

```typescript
interface CoreMessage {
  id: string; // UUID v4
  version: string; // Protocol version: "1.0.0"
  type: MessageType; // Message type enumeration
  timestamp: string; // RFC 3339 timestamp

  // Routing Information
  sender: AgentAddress; // Sender agent identifier
  recipient: AgentAddress; // Recipient agent identifier
  replyTo?: AgentAddress; // Reply-to address for responses
  correlationId?: string; // Request correlation tracking

  // Security & Trust
  signature?: MessageSignature; // Cryptographic signature
  capabilities: string[]; // Required capabilities
  token?: string; // Authentication token

  // Content & Metadata
  payload: MessagePayload; // Actual message content
  metadata: MessageMetadata; // Extensible metadata
  headers: Record<string, string>; // Transport headers

  // Quality of Service
  priority: Priority; // Message priority level
  ttl?: number; // Time-to-live in milliseconds
  qos: QoSLevel; // Quality of service level

  // Flow Control
  retryPolicy?: RetryPolicy; // Retry configuration
  deadline?: string; // Processing deadline
  traceId?: string; // Distributed trace ID
  spanId?: string; // Span identifier
}
```

## Security

The protocol implements a zero-trust security model:

- **Capability-based access control** - Agents only have access to explicitly granted capabilities
- **Message signing** - Cryptographic signatures ensure message authenticity
- **Encryption support** - End-to-end encryption for sensitive messages
- **Token-based authentication** - JWT tokens for agent authentication

## Observability

Built-in observability features:

- **Distributed tracing** - Track messages across agent boundaries
- **Metrics collection** - Comprehensive metrics for monitoring
- **Health monitoring** - Agent health status and performance metrics
- **Event logging** - Structured logging for debugging and auditing

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:unit
npm run test:integration
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## Emergency Deployment

For system crisis situations, the protocol supports emergency deployment:

1. **Phase 1**: Core protocol installation (2 hours)
2. **Phase 2**: Duplicate task crisis resolution (30 minutes)
3. **Phase 3**: P0 security validation coordination (1 hour)
4. **Phase 4**: Board management crisis resolution (45 minutes)
5. **Phase 5**: Agent coordination infrastructure (2 hours)
6. **Phase 6**: Monitoring and observability (30 minutes)

**Total Recovery Time**: 6 hours to full system restoration

## License

MIT License - see LICENSE file for details.

## Contributing

Please read the contributing guidelines and submit pull requests to the main repository.

## Support

For support and questions, please open an issue in the repository or contact the development team.
