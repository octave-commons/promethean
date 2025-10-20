import { DualStoreManager } from '@promethean/persistence';

export interface MessagingContext {
  sessionStore: DualStoreManager<'text', 'timestamp'>;
}

export async function sendMessage(
  context: MessagingContext,
  client: any,
  sessionId: string,
  message: string,
  priority: string,
  messageType: string,
): Promise<string> {
  const senderSessionId = await getSenderSessionId(client);
  const formattedMessage = formatMessage(
    senderSessionId,
    sessionId,
    message,
    priority,
    messageType,
  );

  await client.session.prompt({
    path: { id: sessionId },
    body: { parts: [{ type: 'text' as const, text: formattedMessage }] },
  });

  await logCommunication(context, senderSessionId, sessionId, message, priority, messageType);

  const safeRecipientId = sessionId.length > 8 ? sessionId.substring(0, 8) : sessionId;
  return `✅ Message sent successfully to session ${safeRecipientId}... (Priority: ${priority}, Type: ${messageType})`;
}

export async function getSenderSessionId(client: any): Promise<string> {
  try {
    const currentSession = await client.session.list();
    return currentSession.data?.[0]?.id || 'unknown';
  } catch {
    return 'unknown';
  }
}

export function formatMessage(
  senderId: string,
  recipientId: string,
  message: string,
  priority: string,
  messageType: string,
): string {
  const safeSenderId = senderId.length > 8 ? senderId.substring(0, 8) : senderId;
  const safeRecipientId = recipientId.length > 8 ? recipientId.substring(0, 8) : recipientId;

  return `🔔 **INTER-AGENT MESSAGE** 🔔

**From:** Agent ${safeSenderId}...
**To:** Agent ${safeRecipientId}...
**Priority:** ${priority.toUpperCase()}
**Type:** ${messageType.replace('_', ' ').toUpperCase()}
**Time:** ${new Date().toLocaleTimeString()}

**Message:**
${message}

`;
}

export async function logCommunication(
  context: MessagingContext,
  senderId: string,
  recipientId: string,
  message: string,
  priority: string,
  messageType: string,
): Promise<void> {
  console.log(`📨 Inter-agent message sent from ${senderId} to ${recipientId}`);
  console.log(`📝 Message type: ${messageType}, Priority: ${priority}`);

  try {
    await context.sessionStore.insert({
      id: `inter_agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      text: `Inter-agent message: ${message}`,
      timestamp: new Date().toISOString(),
      metadata: {
        type: 'inter_agent_communication',
        sender: senderId,
        recipient: recipientId,
        priority,
        messageType,
      },
    });
  } catch (error) {
    console.warn('⚠️ Failed to store inter-agent communication:', error);
  }
}
