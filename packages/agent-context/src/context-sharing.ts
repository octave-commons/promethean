import { ContextShare, ContextShareStore, ContextSnapshot, SnapshotStore } from './types';

export class ContextSharingService {
  constructor(
    private shareStore: ContextShareStore,
    private snapshotStore: SnapshotStore,
  ) {}

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
    // Get the latest snapshot for the source agent
    const latestSnapshot = await this.snapshotStore.getLatestSnapshot(sourceAgentId);
    if (!latestSnapshot) {
      throw new Error(`No context found for agent ${sourceAgentId}`);
    }

    const share: Omit<ContextShare, 'id' | 'createdAt'> = {
      sourceAgentId,
      targetAgentId,
      contextSnapshotId: latestSnapshot.id,
      shareType,
      permissions: options.permissions || {},
      expiresAt: options.expiresAt,
      createdBy: options.createdBy,
    };

    return await this.shareStore.createShare(share);
  }

  async getSharedContexts(
    agentId: string,
  ): Promise<Array<ContextShare & { snapshot: ContextSnapshot }>> {
    const shares = await this.shareStore.getSharedContexts(agentId);
    const result = [];

    for (const share of shares) {
      const snapshot = await this.snapshotStore.getSnapshot(share.contextSnapshotId);
      if (snapshot) {
        result.push({ ...share, snapshot });
      }
    }

    return result;
  }

  async revokeShare(shareId: string, requestingAgentId: string): Promise<void> {
    // Verify the requesting agent owns this share
    const shares = await this.shareStore.getSharesForAgent(requestingAgentId);
    const share = shares.find((s) => s.id === shareId);

    if (!share) {
      throw new Error('Share not found or access denied');
    }

    await this.shareStore.revokeShare(shareId);
  }

  async updateSharePermissions(
    shareId: string,
    updates: Partial<Pick<ContextShare, 'shareType' | 'permissions' | 'expiresAt'>>,
    requestingAgentId: string,
  ): Promise<ContextShare> {
    // Verify the requesting agent owns this share
    const shares = await this.shareStore.getSharesForAgent(requestingAgentId);
    const existingShare = shares.find((s) => s.id === shareId);

    if (!existingShare) {
      throw new Error('Share not found or access denied');
    }

    return await this.shareStore.updateShare(shareId, updates);
  }

  async checkShareAccess(
    agentId: string,
    snapshotId: string,
    requiredPermission: 'read' | 'write' | 'admin' = 'read',
  ): Promise<boolean> {
    const sharedContexts = await this.shareStore.getSharedContexts(agentId);
    const sharesForSnapshot = sharedContexts.filter((s) => s.contextSnapshotId === snapshotId);

    if (sharesForSnapshot.length === 0) {
      return false;
    }

    // Find the share with the highest permission level that hasn't expired
    const permissionLevels = { read: 1, write: 2, admin: 3 };
    const requiredLevel = permissionLevels[requiredPermission];

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
    return shareLevel >= requiredLevel;
  }

  async getShareStatistics(agentId: string): Promise<{
    created: number;
    received: number;
    active: number;
    expired: number;
  }> {
    const createdShares = await this.shareStore.getSharesForAgent(agentId);
    const receivedShares = await this.shareStore.getSharedContexts(agentId);
    const now = new Date();

    const createdActive = createdShares.filter((s) => !s.expiresAt || s.expiresAt > now).length;
    const receivedActive = receivedShares.filter((s) => !s.expiresAt || s.expiresAt > now).length;

    return {
      created: createdShares.length,
      received: receivedShares.length,
      active: createdActive + receivedActive,
      expired: createdShares.length + receivedShares.length - (createdActive + receivedActive),
    };
  }
}
