import type { Session, Event } from '@opencode-ai/sdk';
import type { Message, MessagePart } from './indexer-types.js';

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

export const messageToMarkdown = (message: Message): string => {
  const textParts = message.parts?.filter((part: MessagePart) => part.type === 'text') ?? [];
  const content =
    textParts.map((part: MessagePart) => part.text).join('\n\n') ?? '[No text content]';

  return `# Message: ${message.info?.id}

**Role:** ${message.info?.role ?? 'unknown'}
**Timestamp:** ${message.info?.time?.created ? new Date(message.info.time.created).toLocaleString() : 'Unknown'}
**Message ID:** ${message.info?.id ?? 'unknown'}

## Content

${content}

---
`;
};
