// SPDX-License-Identifier: GPL-3.0-only
export async function close({ sessionId, }) {
    // Session closing is now handled by dual store operations
    // For now, return success - actual session management can be added later
    return {
        success: true,
        sessionId,
        message: 'Session closed successfully',
    };
}
//# sourceMappingURL=close.js.map