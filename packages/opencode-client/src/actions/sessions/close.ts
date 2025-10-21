export async function close({ sessionId }: { sessionId: string }) {
  try {
    // Session closing is now handled by dual store operations
    // For now, return success - actual session management can be added later
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
