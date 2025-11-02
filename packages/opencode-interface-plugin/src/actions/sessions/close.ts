// SPDX-License-Identifier: GPL-3.0-only

export type CloseSessionResult = {
  readonly success: boolean;
  readonly sessionId: string;
  readonly message: string;
};

export async function close({
  sessionId,
}: {
  readonly sessionId: string;
}): Promise<CloseSessionResult> {
  // Session closing is now handled by dual store operations
  // For now, return success - actual session management can be added later
  return {
    success: true,
    sessionId,
    message: 'Session closed successfully',
  };
}
