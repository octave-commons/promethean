/**
 * Context Sharing Service
 * Migrated from agent-context package with unified type system integration
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  ContextShare, 
  ContextShareStore, 
  ContextSnapshot, 
  SnapshotStore 
} from './types.js';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security.js';
import { ContextSharingHelpers } from './context-sharing-helpers.js';

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
      permissions?: Record<string, unknown>;
      expiresAt?: Date;
      createdBy?: string;
    } = {},
  ): Promise<ContextShare> {
    try {
      const { sourceId, targetId, type } = await ContextSharingHelpers.validateShareInputs(
        sourceAgentId,
        targetAgentId,
        shareType,
      );

      await ContextSharingHelpers.checkRateLimit(this.rateLimiter, sourceId, 'shareContext');

      const latestSnapshot = await this.getLatestSnapshotForAgent(sourceId);
      const sanitizedPermissions = options.permissions
        ? SecurityValidator.sanitizeObject(options.permissions)
        : {};

      // Validate expiry date
      const validatedExpiresAt = ContextSharingHelpers.validateShareExpiry(options.expiresAt);

      // Check share limits
      const currentShares = await this.shareStore.getSharesForAgent(sourceId);
      await ContextSharingHelpers.checkShareLimits(sourceId, currentShares);

      const share = ContextSharingHelpers.createShareRecord(
        sourceId,
        targetId,
        type,
        latestSnapshot.id,
        {
          permissions: sanitizedPermissions as Record<string, unknown>,
          expiresAt: validatedExpiresAt,
          createdBy: options.createdBy,
        },
      );

      ContextSharingHelpers.logShareSuccess(sourceId, targetId, '', type);

      return await this.shareStore.createShare(share);
    } catch (error) {
      ContextSharingHelpers.logSecurityError(sourceAgentId, 'shareContext', error);
      throw error;
    }
  }

  private async getLatestSnapshotForAgent(agentId: string): Promise<ContextSnapshot> {
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(agentId);
    if (!latestSnapshot) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'getLatestSnapshotForAgent',
        details: { reason: 'No context found to share' },
      });
      throw new Error('No context found to share.');
    }
    return latestSnapshot;
  }

  async getSharedContexts(
    agentId: string,
  ): Promise<Array<ContextShare & { snapshot: ContextSnapshot }>> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      await ContextSharingHelpers.checkRateLimit(
        this.rateLimiter,
        validatedAgentId,
        'getSharedContexts',
      );

      const shares = await this.shareStore.getSharedContexts(validatedAgentId);
      if (shares.length === 0) {
        return [];
      }

      const snapshotMap = await this.batchFetchSnapshots(shares);
      const result = this.combineSharesWithSnapshots(shares, snapshotMap);

      SecurityLogger.log({
        type: 'data_access',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'getSharedContexts',
        details: { count: result.length },
      });

      return result;
    } catch (error) {
      ContextSharingHelpers.logSecurityError(agentId, 'getSharedContexts', error);
      throw error;
    }
  }

  private async batchFetchSnapshots(
    shares: ContextShare[],
  ): Promise<Map<string, ContextSnapshot | null>> {
    const snapshotIds = [...new Set(shares.map((share) => share.contextSnapshotId))];
    const snapshotPromises = snapshotIds.map((id) => this.snapshotStore.getSnapshot(id));
    const snapshots = await Promise.all(snapshotPromises);

    const snapshotMap = new Map<string, ContextSnapshot | null>();
    snapshotIds.forEach((id, index) => {
      const snapshot = snapshots[index];
      if (snapshot !== undefined) {
        snapshotMap.set(id, snapshot);
      }
    });

    return snapshotMap;
  }

  private combineSharesWithSnapshots(
    shares: ContextShare[],
    snapshotMap: Map<string, ContextSnapshot | null>,
  ): Array<ContextShare & { snapshot: ContextSnapshot }> {
    return shares.reduce(
      (acc, share) => {
        const snapshot = snapshotMap.get(share.contextSnapshotId);
        if (snapshot) {
          acc.push({ ...share, snapshot });
        }
        return acc;
      },
      [] as Array<ContextShare & { snapshot: ContextSnapshot }>,
    );
  }

  async revokeShare(shareId: string, requestingAgentId: string): Promise<void> {
    try {
      const validatedShareId = SecurityValidator.validateSnapshotId(shareId);
      const validatedAgentId = SecurityValidator.validateAgentId(requestingAgentId);

      await ContextSharingHelpers.checkRateLimit(this.rateLimiter, validatedAgentId, 'revokeShare');

      const share = await this.findShareForAgent(validatedShareId, validatedAgentId);
      await this.shareStore.revokeShare(validatedShareId);

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: validatedAgentId,
        action: 'revokeShare',
        details: { shareId: validatedShareId, targetAgentId: share.targetAgentId },
      });
    } catch (error) {
      ContextSharingHelpers.logSecurityError(requestingAgentId, 'revokeShare', error);
      throw error;
    }
  }

  private async findShareForAgent(shareId: string, agentId: string): Promise<ContextShare> {
    const shares = await this.shareStore.getSharesForAgent(agentId);
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId,
        action: 'findShareForAgent',
        details: { shareId, reason: 'Share not found or access denied' },
      });
      throw new Error('Share not found or access denied');
    }

    return share;
  }

  async updateSharePermissions(
    shareId: string,
    updates: Partial<Pick<ContextShare, 'shareType' | 'permissions' | 'expiresAt'>>,
    requestingAgentId: string,
  ): Promise<ContextShare> {
    try {
      const validatedShareId = SecurityValidator.validateSnapshotId(shareId);
      const validatedAgentId = SecurityValidator.validateAgentId(requestingAgentId);

      await ContextSharingHelpers.checkRateLimit(
        this.rateLimiter,
        validatedAgentId,
        'updateSharePermissions',
      );

      await this.findShareForAgent(validatedShareId, validatedAgentId);
      
      // Validate and sanitize updates
      const sanitizedUpdates = SecurityValidator.sanitizeObject(updates);
      
      // Validate expiry date if provided
      if (sanitizedUpdates.expiresAt) {
        sanitizedUpdates.expiresAt = ContextSharingHelpers.validateShareExpiry(
          sanitizedUpdates.expiresAt as Date
        );
      }

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
      ContextSharingHelpers.logSecurityError(requestingAgentId, 'updateSharePermissions', error);
      throw error;
    }
  }

  async checkShareAccess(
    agentId: string,
    snapshotId: string,
    requiredPermission: 'read' | 'write' | 'admin' = 'read',
  ): Promise<boolean> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);
      const validatedSnapshotId = SecurityValidator.validateSnapshotId(snapshotId);
      const validatedPermission = SecurityValidator.validateShareType(requiredPermission);

      await ContextSharingHelpers.checkRateLimit(
        this.rateLimiter,
        validatedAgentId,
        'checkShareAccess',
      );

      const sharesForSnapshot = await this.getSharesForSnapshot(
        validatedAgentId,
        validatedSnapshotId,
      );
      if (sharesForSnapshot.length === 0) {
        return false;
      }

      const hasAccess = this.checkPermissionLevel(sharesForSnapshot, validatedPermission);

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
      ContextSharingHelpers.logSecurityError(agentId, 'checkShareAccess', error);
      throw error;
    }
  }

  private async getSharesForSnapshot(agentId: string, snapshotId: string): Promise<ContextShare[]> {
    const sharedContexts = await this.shareStore.getSharedContexts(agentId);
    return sharedContexts.filter((s) => s.contextSnapshotId === snapshotId);
  }

  private checkPermissionLevel(
    shares: ContextShare[],
    requiredPermission: 'read' | 'write' | 'admin',
  ): boolean {
    const permissionLevels = { read: 1, write: 2, admin: 3 };
    const requiredLevel = permissionLevels[requiredPermission];

    const validShares = shares.filter((share) => !ContextSharingHelpers.isShareExpired(share));

    if (validShares.length === 0) {
      return false;
    }

    const highestPermissionShare = validShares.reduce((highest, current) => {
      const highestLevel = permissionLevels[highest.shareType];
      const currentLevel = permissionLevels[current.shareType];
      return currentLevel > highestLevel ? current : highest;
    });

    const shareLevel = permissionLevels[highestPermissionShare.shareType];
    return shareLevel >= requiredLevel;
  }

  async getShareStatistics(agentId: string): Promise<{
    created: number;
    received: number;
    active: number;
    expired: number;
  }> {
    try {
      const validatedAgentId = SecurityValidator.validateAgentId(agentId);

      const createdShares = await this.shareStore.getSharesForAgent(validatedAgentId);
      const receivedShares = await this.shareStore.getSharedContexts(validatedAgentId);
      const now = new Date();

      const createdActive = createdShares.filter((s) => !ContextSharingHelpers.isShareExpired(s)).length;
      const receivedActive = receivedShares.filter((s) => !ContextSharingHelpers.isShareExpired(s)).length;

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

  // Enhanced methods for unified system
  async getShareDetails(shareId: string, requestingAgentId: string): Promise<{
    share: ContextShare;
    snapshot?: ContextSnapshot;
    canEdit: boolean;
    canRevoke: boolean;
    canReshare: boolean;
  }> {
    try {
      const validatedShareId = SecurityValidator.validateSnapshotId(shareId);
      const validatedAgentId = SecurityValidator.validateAgentId(requestingAgentId);

      const share = await this.findShareForAgent(validatedShareId, validatedAgentId);
      const snapshot = await this.snapshotStore.getSnapshot(share.contextSnapshotId);

      const canEdit = share.sourceAgentId === validatedAgentId || share.createdBy === validatedAgentId;
      const canRevoke = canEdit;
      const canReshare = share.permissions?.canReshare === true && canEdit;

      return {
        share,
        snapshot: snapshot || undefined,
        canEdit,
        canRevoke,
        canReshare
      };
    } catch (error) {
      ContextSharingHelpers.logSecurityError(requestingAgentId, 'getShareDetails', error);
      throw error;
    }
  }

  async cleanupExpiredShares(): Promise<number> {
    try {
      const allShares = await this.getAllShares();
      const expiredShares = allShares.filter(share => ContextSharingHelpers.isShareExpired(share));
      
      let cleanedCount = 0;
      for (const share of expiredShares) {
        try {
          await this.shareStore.revokeShare(share.id);
          cleanedCount++;
        } catch (error) {
          SecurityLogger.log({
            type: 'authorization',
            severity: 'medium',
            action: 'cleanupExpiredShares',
            details: { 
              shareId: share.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        action: 'cleanupExpiredShares',
        details: { cleanedCount, totalExpired: expiredShares.length }
      });

      return cleanedCount;
    } catch (error) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        action: 'cleanupExpiredShares',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private async getAllShares(): Promise<ContextShare[]> {
    // This would need to be implemented in the share store interface
    // For now, return empty array as placeholder
    return [];
  }

  async createShareLink(
    sourceAgentId: string,
    shareType: 'read' | 'write' | 'admin' = 'read',
    options: {
      permissions?: Record<string, unknown>;
      expiresAt?: Date;
      maxUses?: number;
    } = {}
  ): Promise<{ shareId: string; shareLink: string }> {
    try {
      const shareId = ContextSharingHelpers.generateShareId();
      const shareLink = `https://promethean.ai/share/${shareId}`;

      // Create a temporary share record that can be claimed
      const tempShare = await this.shareStore.createShare({
        id: shareId,
        sourceAgentId,
        targetAgentId: 'unclaimed',
        contextSnapshotId: '', // Will be set when claimed
        shareType,
        permissions: {
          ...options.permissions,
          isLinkShare: true,
          maxUses: options.maxUses
        },
        expiresAt: options.expiresAt,
        createdAt: new Date(),
        createdBy: sourceAgentId
      });

      SecurityLogger.log({
        type: 'authorization',
        severity: 'low',
        agentId: sourceAgentId,
        action: 'createShareLink',
        details: { shareId, shareLink, shareType }
      });

      return { shareId, shareLink };
    } catch (error) {
      ContextSharingHelpers.logSecurityError(sourceAgentId, 'createShareLink', error);
      throw error;
    }
  }
}

export default ContextSharingService;