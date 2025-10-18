export async function close({ sessionId, client }: { sessionId: string; client: any }) {
  try {
    const { error } = await client.session.close(sessionId);
    if (error) return `Failed to close session: ${error}`;

    return JSON.stringify({
      success: true,
      sessionId,
      message: 'Session closed successfully',
    });
  } catch (error: any) {
    console.error('Error closing session:', error);
    return `Failed to close session: ${error.message}`;
  }
}
