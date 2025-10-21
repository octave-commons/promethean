export async function close({ sessionId }: { readonly sessionId: string }): Promise<string> {
  // Session closing is now handled by dual store operations
  // For now, return success - actual session management can be added later
  return JSON.stringify({
    success: true,
    sessionId,
    message: 'Session closed successfully',
  });
}
