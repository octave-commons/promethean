import type { Session, Event } from '@opencode-ai/sdk';

import type { MessagePart } from './indexer-types.js';

type EnhancedEvent = Event & {
  readonly properties?: {
    readonly info?: {
      readonly id?: string;
      readonly sessionID?: string;
    };
    readonly part?: {
      readonly sessionID?: string;
      readonly messageID?: string;
    };
  };
};

export const eventToMarkdown = (event: EnhancedEvent): string => {
  const timestamp = new Date().toISOString();
  const sessionId =
    event.properties?.info?.id ??
    event.properties?.info?.sessionID ??
    event.properties?.part?.sessionID ??
    'N/A';

  return `# Event: ${event.type}

**Timestamp:** ${timestamp}
**Session ID:** ${sessionId}

## Properties

\`\`\`json
${JSON.stringify(event.properties ?? {}, null, 2)}
\`\`\`

---
`;
};

export const sessionToMarkdown = (session: Session): string => `# Session: ${session.title}

**ID:** ${session.id}
**Created:** ${new Date(session.time.created).toLocaleString()}
**Project ID:** ${session.projectID}

## Description

${session.title ?? 'Untitled Session'}

---
`;

export const messageToMarkdown = (message: any): string => {
  // Handle both new JSON format (stored as text in DualStoreEntry) and legacy format
  let messageData;

  // Check if this is a DualStoreEntry with text field containing JSON
  if (message && typeof message.text === 'string' && message.text.startsWith('{')) {
    try {
      // New format: JSON string with complete message structure
      messageData = JSON.parse(message.text);
    } catch {
      // Fallback: treat as plain text if JSON parsing fails
      messageData = {
        info: { id: message.id, role: 'unknown' },
        parts: [{ type: 'text', text: message.text }],
      };
    }
  } else if (message && typeof message.text === 'string') {
    // DualStoreEntry with plain text
    messageData = {
      info: { id: message.id, role: 'unknown' },
      parts: [{ type: 'text', text: message.text }],
    };
  } else {
    // Legacy format: direct message structure
    messageData = message;
  }

  const textParts = messageData.parts?.filter((part: MessagePart) => part.type === 'text') ?? [];
  const content =
    textParts.map((part: MessagePart) => part.text).join('\n\n') ?? '[No text content]';

  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleString()
    : messageData.info?.time?.created
      ? new Date(messageData.info.time.created).toLocaleString()
      : 'Unknown';

  return `# Message: ${messageData.info?.id}

**Role:** ${messageData.info?.role ?? 'unknown'}
**Timestamp:** ${timestamp}
**Message ID:** ${messageData.info?.id ?? 'unknown'}

## Content

${content}

---
`;
};
