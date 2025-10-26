import { DualStoreManager } from '@promethean/persistence';

export type MessagingContext = {
  readonly sessionStore: DualStoreManager<'text', 'timestamp'>;
};

type SendMessageOptions = {
  readonly context: MessagingContext;
  readonly client: {
    session: {
      list: () => Promise<{ data?: { id?: string }[] }>;
      prompt: (params: {
        path: { id: string };
        body: { parts: Array<{ type: 'text'; text: string }> };
      }) => Promise<void>;
    };
  };
  readonly sessionId: string;
  readonly message: string;
  readonly priority: string;
  readonly messageType: string;
};

export async function sendMessage(options: SendMessageOptions): Promise<string> {
  const senderSessionId = await getSenderSessionId(options.client);
  const formattedMessage = formatMessage({
    senderId: senderSessionId,
    recipientId: options.sessionId,
    message: options.message,
    priority: options.priority,
    messageType: options.messageType,
  });

  await options.client.session.prompt({
    path: { id: options.sessionId },
    body: { parts: [{ type: 'text' as const, text: formattedMessage }] },
  });

  await logCommunication({
    context: options.context,
    senderId: senderSessionId,
    recipientId: options.sessionId,
    message: options.message,
    priority: options.priority,
    messageType: options.messageType,
  });

  const safeRecipientId =
    options.sessionId.length > 8 ? options.sessionId.substring(0, 8) : options.sessionId;
  return `✅ Message sent successfully to session ${safeRecipientId}... (Priority: ${options.priority}, Type: ${options.messageType})`;
}

export async function getSenderSessionId(client: {
  session: { list: () => Promise<{ data?: { id?: string }[] }> };
}): Promise<string> {
  const currentSession = await client.session.list().catch(() => ({ data: [] }));
  return currentSession.data?.[0]?.id || 'unknown';
}

type MessageFormatParams = {
  readonly senderId: string;
  readonly recipientId: string;
  readonly message: string;
  readonly priority: string;
  readonly messageType: string;
};

export function formatMessage(params: MessageFormatParams): string {
  const safeSenderId =
    params.senderId.length > 8 ? params.senderId.substring(0, 8) : params.senderId;
  const safeRecipientId =
    params.recipientId.length > 8 ? params.recipientId.substring(0, 8) : params.recipientId;

  return `🔔 **INTER-AGENT MESSAGE** 🔔

**From:** Agent ${safeSenderId}...
**To:** Agent ${safeRecipientId}...
**Priority:** ${params.priority.toUpperCase()}
**Type:** ${params.messageType.replace('_', ' ').toUpperCase()}
**Time:** ${new Date().toLocaleTimeString()}

**Message:**
${params.message}

`;
}

type LogCommunicationParams = {
  readonly context: MessagingContext;
  readonly senderId: string;
  readonly recipientId: string;
  readonly message: string;
  readonly priority: string;
  readonly messageType: string;
};

export async function logCommunication(params: LogCommunicationParams): Promise<void> {
  console.log(`📨 Inter-agent message sent from ${params.senderId} to ${params.recipientId}`);
  console.log(`📝 Message type: ${params.messageType}, Priority: ${params.priority}`);

  await params.context.sessionStore
    .insert({
      id: `inter_agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      text: `Inter-agent message: ${params.message}`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'inter_agent_communication',
        sender: params.senderId,
        recipient: params.recipientId,
        priority: params.priority,
        messageType: params.messageType,
      },
    })
    .catch((error: unknown) => {
      console.warn('⚠️ Failed to store inter-agent communication:', error);
    });
}
