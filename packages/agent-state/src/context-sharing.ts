import { ContextShare, ContextShareStore, ContextSnapshot, SnapshotStore } from './types';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security';
import { ContextSharingHelpers } from './context-sharing-helpers';

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

      const share = ContextSharingHelpers.createShareRecord(
        sourceId,
        targetId,
        type,
        latestSnapshot.id,
        {
          permissions: sanitizedPermissions as Record<string, unknown>,
          expiresAt: options.expiresAt,
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

    const validShares = shares.filter((share) => !share.expiresAt || share.expiresAt >= new Date());

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
