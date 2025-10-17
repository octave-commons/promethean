import { ContextShare, ContextShareStore, ContextSnapshot, SnapshotStore } from './types';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security';

export class ContextSharingService {
  private rateLimiter: RateLimiter;

  constructor(
    private shareStore: ContextShareStore,
    private snapshotStore: SnapshotStore,
  ) {
    this.rateLimiter = RateLimiter.getInstance('context-sharing', 60000, 50);
  }

  async shareContext(
    sourceAgentId: string,
    targetAgentId: string,
    shareType: 'read' | 'write' | 'admin' = 'read',
    options: {
      permissions?: Record<string, any>;
      expiresAt?: Date;
      createdBy?: string;
    } = {},
  ): Promise<ContextShare> {
    try {
      // Validate and sanitize inputs
      const validatedSourceAgentId = SecurityValidator.validateAgentId(sourceAgentId);
      const validatedTargetAgentId = SecurityValidator.validateAgentId(targetAgentId);
      const validatedShareType = SecurityValidator.validateShareType(shareType);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`shareContext:${validatedSourceAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedSourceAgentId,
          action: 'shareContext',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Authorization check - ensure source agent can share their context
      // This would typically involve checking permissions or ownership

      // Get the latest snapshot for the source agent
      const latestSnapshot = await this.snapshotStore.getLatestSnapshot(validatedSourceAgentId);
      if (!latestSnapshot) {
        SecurityLogger.log({
          type: 'authorization',
          severity: 'medium',
          agentId: validatedSourceAgentId,
          action: 'shareContext',
          details: { reason: 'No context found', targetAgentId: validatedTargetAgentId },
        });
        throw new Error(`No context found for agent ${validatedSourceAgentId}`);
      }

      // Validate and sanitize permissions
      const sanitizedPermissions = options.permissions
        ? (SecurityValidator.sanitizeObject(options.permissions) as Record<string, any>)
        : {};

      const share: Omit<ContextShare, 'id' | 'createdAt'> = {
        sourceAgentId: validatedSourceAgentId,
        targetAgentId: validatedTargetAgentId,
        contextSnapshotId: latestSnapshot.id,
        shareType: validatedShareType,
        permissions: sanitizedPermissions,
        expiresAt: options.expiresAt,
        createdBy: options.createdBy,
      };

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedSourceAgentId,
        action: 'shareContext',
        details: {
          targetAgentId: validatedTargetAgentId,
          shareType: validatedShareType,
          snapshotId: latestSnapshot.id,
        },
      });

      return await this.shareStore.createShare(share);
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId: sourceAgentId,
        action: 'shareContext',
        details: {
          targetAgentId,
          shareType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getSharedContexts(
    agentId: string,
  ): Promise<Array<ContextShare & { snapshot: ContextSnapshot }>> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`getSharedContexts:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'getSharedContexts',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const shares = await this.shareStore.getSharedContexts(validatedAgentId);

      if (shares.length === 0) {
        return [];
      }

      // Extract all unique snapshot IDs to batch fetch
      const snapshotIds = [...new Set(shares.map((share) => share.contextSnapshotId))];

      // Batch fetch all snapshots at once
      const snapshotPromises = snapshotIds.map((id) => this.snapshotStore.getSnapshot(id));
      const snapshots = await Promise.all(snapshotPromises);

      // Create a map of snapshot ID to snapshot for quick lookup
      const snapshotMap = new Map<string, ContextSnapshot | null>();
      snapshotIds.forEach((id, index) => {
        const snapshot = snapshots[index];
        if (snapshot !== undefined) {
          snapshotMap.set(id, snapshot);
        }
      });

      // Combine shares with their snapshots
      const result = shares.reduce(
        (acc, share) => {
          const snapshot = snapshotMap.get(share.contextSnapshotId);
          if (snapshot) {
            acc.push({ ...share, snapshot });
          }
          return acc;
        },
        [] as Array<ContextShare & { snapshot: ContextSnapshot }>,
      );

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'getSharedContexts',
        details: { count: result.length },
      });

      return result;
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'medium',
        agentId,
        action: 'getSharedContexts',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async revokeShare(shareId: string, requestingAgentId: string): Promise<void> {
    try {
      // Validate and sanitize inputs
      const validatedShareId = SecurityValidator.validateSnapshotId(shareId);
      const validatedAgentId = SecurityValidator.validateAgentId(requestingAgentId);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`revokeShare:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'revokeShare',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Verify the requesting agent owns this share
      const shares = await this.shareStore.getSharesForAgent(validatedAgentId);
      const share = shares.find((s) => s.id === validatedShareId);

      if (!share) {
        SecurityLogger.log({
          type: 'authorization',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'revokeShare',
          details: { shareId: validatedShareId, reason: 'Share not found or access denied' },
        });
        throw new Error('Share not found or access denied');
      }

      await this.shareStore.revokeShare(validatedShareId);

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'revokeShare',
        details: { shareId: validatedShareId, targetAgentId: share.targetAgentId },
      });
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId: requestingAgentId,
        action: 'revokeShare',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async updateSharePermissions(
    shareId: string,
    updates: Partial<Pick<ContextShare, 'shareType' | 'permissions' | 'expiresAt'>>,
    requestingAgentId: string,
  ): Promise<ContextShare> {
    try {
      // Validate and sanitize inputs
      const validatedShareId = SecurityValidator.validateSnapshotId(shareId);
      const validatedAgentId = SecurityValidator.validateAgentId(requestingAgentId);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`updateSharePermissions:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'updateSharePermissions',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Verify the requesting agent owns this share
      const shares = await this.shareStore.getSharesForAgent(validatedAgentId);
      const existingShare = shares.find((s) => s.id === validatedShareId);

      if (!existingShare) {
        SecurityLogger.log({
          type: 'authorization',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'updateSharePermissions',
          details: { shareId: validatedShareId, reason: 'Share not found or access denied' },
        });
        throw new Error('Share not found or access denied');
      }

      // Validate and sanitize updates
      const sanitizedUpdates = SecurityValidator.sanitizeObject(updates);

      const result = await this.shareStore.updateShare(
        validatedShareId,
        sanitizedUpdates as Partial<ContextShare>,
      );

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'updateSharePermissions',
        details: { shareId: validatedShareId, updates: sanitizedUpdates },
      });

      return result;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId: requestingAgentId,
        action: 'updateSharePermissions',
        details: {
          shareId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async checkShareAccess(
    agentId: string,
    snapshotId: string,
    requiredPermission: 'read' | 'write' | 'admin' = 'read',
  ): Promise<boolean> {
    try {
      // Validate and sanitize inputs
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedSnapshotId = SecurityValidator.validateSnapshotId(snapshotId);
      const validatedPermission = SecurityValidator.validateShareType(requiredPermission);

      // Rate limiting
      if (!this.rateLimiter.isAllowed(`checkShareAccess:${validatedAgentId}`)) {
        SecurityLogger.log({
          type: 'rate_limit',
          severity: 'medium',
          agentId: validatedAgentId,
          action: 'checkShareAccess',
          details: { reason: 'Rate limit exceeded' },
        });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const sharedContexts = await this.shareStore.getSharedContexts(validatedAgentId);
      const sharesForSnapshot = sharedContexts.filter(
        (s) => s.contextSnapshotId === validatedSnapshotId,
      );

      if (sharesForSnapshot.length === 0) {
        return false;
      }

      // Find the share with the highest permission level that hasn't expired
      const permissionLevels = { read: 1, write: 2, admin: 3 };
      const requiredLevel = permissionLevels[validatedPermission];

      const validShares = sharesForSnapshot.filter(
        (share) => !share.expiresAt || share.expiresAt >= new Date(),
      );

      if (validShares.length === 0) {
        return false;
      }

      // Find the share with the highest permission level
      const highestPermissionShare = validShares.reduce((highest, current) => {
        const highestLevel = permissionLevels[highest.shareType];
        const currentLevel = permissionLevels[current.shareType];
        return currentLevel > highestLevel ? current : highest;
      });

      const shareLevel = permissionLevels[highestPermissionShare.shareType];
      const hasAccess = shareLevel >= requiredLevel;

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'checkShareAccess',
        details: {
          snapshotId: validatedSnapshotId,
          requiredPermission: validatedPermission,
          hasAccess,
        },
      });

      return hasAccess;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'checkShareAccess',
        details: {
          snapshotId,
          requiredPermission,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw error;
    }
  }

  async getShareStatistics(agentId: string): Promise<{
    created: number;
    received: number;
    active: number;
    expired: number;
  }> {
    try {
      // Validate and sanitize input
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const createdShares = await this.shareStore.getSharesForAgent(validatedAgentId);
      const receivedShares = await this.shareStore.getSharedContexts(validatedAgentId);
      const now = new Date();

      const createdActive = createdShares.filter((s) => !s.expiresAt || s.expiresAt > now).length;
      const receivedActive = receivedShares.filter((s) => !s.expiresAt || s.expiresAt > now).length;

      return {
        created: createdShares.length,
        received: receivedShares.length,
        active: createdActive + receivedActive,
        expired: createdShares.length + receivedShares.length - (createdActive + receivedActive),
      };
    } catch (error) {
      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId,
        action: 'getShareStatistics',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}
