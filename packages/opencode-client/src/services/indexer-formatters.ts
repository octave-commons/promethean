import type { Session, Event } from '@opencode-ai/sdk';
import type { Message } from './indexer-types.js';

export const eventToMarkdown = (event: Event): string => {
  const timestamp = new Date().toISOString();
  const sessionId =
    (event as any).properties?.info?.id ??
    (event as any).properties?.info?.sessionID ??
    (event as any).properties?.sessionID ??
    (event as any).properties?.part?.sessionID ??
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
  const textParts = message.parts?.filter((part: any) => part.type === 'text') ?? [];
  const content = textParts.map((part: any) => part.text).join('\n\n') ?? '[No text content]';

  return `# Message: ${message.info?.id}

**Role:** ${message.info?.role ?? 'unknown'}
**Timestamp:** ${message.info?.time?.created ? new Date(message.info.time.created).toLocaleString() : 'Unknown'}
**Message ID:** ${message.info?.id ?? 'unknown'}

## Content

${content}

---
`;
};
