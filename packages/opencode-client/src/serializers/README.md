# Serializers Module

This module handles serialization of action results for consumers (services, plugins, commands).

## Architecture

- **Actions** (`src/actions/`) - Return plain objects
- **Serializers** (`src/serializers/`) - Convert objects to desired output format
- **Consumers** (`src/services/`, `src/plugins/`, `src/commands/`) - Use serializers for output

## Available Serializers

### Session Serializers

- `sessionSerializer` - Serializes individual session data
- `sessionListSerializer` - Serializes session lists with pagination
- `sessionActionSerializer` - Serializes session action results

### Event Serializers

- `eventSerializer` - Serializes individual event data
- `eventListSerializer` - Serializes event lists

### Message Serializers

- `messageSerializer` - Serializes individual message data
- `messageListSerializer` - Serializes message lists

### Search Serializers

- `searchResultSerializer` - Serializes unified search results

## Usage

```typescript
import { sessionListSerializer } from '../serializers/index.js';

// Serialize to markdown (default)
const markdown = sessionListSerializer.serialize(result);

// Serialize with options
const json = sessionListSerializer.serialize(result, { format: 'json', pretty: true });
```

## Output Formats

All serializers support multiple output formats:

- `markdown` - Rich formatted markdown (default)
- `json` - JSON string
- `text` - Plain text summary

## Utility Functions

- `serializeActionResult` - Automatically detects result type and applies appropriate serializer
- `SerializationService` - Service class for batch processing and error handling
