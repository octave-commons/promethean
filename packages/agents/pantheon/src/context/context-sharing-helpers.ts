/**
 * Helper utilities for context sharing
 * Migrated from agent-context package
 */

import { v4 as uuidv4 } from 'uuid';
import type { ContextShare } from './types.js';
import { SecurityValidator, SecurityLogger, RateLimiter } from './security.js';

export class ContextSharingHelpers {
  static async validateShareInputs(
    sourceAgentId: string,
    targetAgentId: string,
    shareType: 'read' | 'write' | 'admin',
  ): Promise<{ sourceId: string; targetId: string; type: 'read' | 'write' | 'admin' }> {
    const sourceId = SecurityValidator.validateAgentId(sourceAgentId);
    const targetId = SecurityValidator.validateAgentId(targetAgentId);
    const type = SecurityValidator.validateShareType(shareType);

    if (sourceId === targetId) {
      throw new Error('Cannot share context with yourself');
    }

    return { sourceId, targetId, type };
  }

  static async checkRateLimit(
    rateLimiter: RateLimiter,
    identifier: string,
    action: string,
  ): Promise<void> {
    try {
      await rateLimiter.checkLimit(`${identifier}:${action}`);
    } catch (error) {
      SecurityLogger.log({
        type: 'rate_limit',
        severity: 'medium',
        agentId: identifier,
        action,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  static createShareRecord(
    sourceAgentId: string,
    targetAgentId: string,
    shareType: 'read' | 'write' | 'admin',
    contextSnapshotId: string,
    options: {
      permissions?: Record<string, unknown>;
      expiresAt?: Date;
      createdBy?: string;
    } = {},
  ): Omit<ContextShare, 'id' | 'createdAt'> {
    return {
      sourceAgentId,
      targetAgentId,
      contextSnapshotId,
      shareType,
      permissions: options.permissions || {},
      expiresAt: options.expiresAt,
      createdBy: options.createdBy,
    };
  }

  static logShareSuccess(
    sourceAgentId: string,
    targetAgentId: string,
    shareId: string,
    shareType: 'read' | 'write' | 'admin',
  ): void {
    SecurityLogger.log({
      type: 'authorization',
      severity: 'low',
      agentId: sourceAgentId,
      action: 'shareContext',
      details: {
        targetAgentId,
        shareId,
        shareType,
        success: true,
      },
    });
  }

  static logSecurityError(identifier: string, action: string, error: unknown): void {
    SecurityLogger.log({
      type: 'authorization',
      severity: 'high',
      agentId: identifier,
      action,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }

  static validateSharePermissions(permissions: Record<string, unknown>): Record<string, unknown> {
    if (!permissions || typeof permissions !== 'object') {
      return {};
    }

    const allowedPermissionKeys = [
      'canReshare',
      'canEdit',
      'canDelete',
      'canExport',
      'maxAccessDuration',
      'allowedActions',
      'restrictions'
    ];

    const validated: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(permissions)) {
      if (allowedPermissionKeys.includes(key)) {
        validated[key] = value;
      }
    }

    return validated;
  }

  static isShareExpired(share: ContextShare): boolean {
    if (!share.expiresAt) {
      return false;
    }
    return share.expiresAt < new Date();
  }

  static canAgentAccessShare(
    agentId: string,
    share: ContextShare,
    requiredPermission: 'read' | 'write' | 'admin' = 'read',
  ): boolean {
    // Check if agent is the target or creator
    if (share.targetAgentId === agentId || share.createdBy === agentId) {
      return true;
    }

    // Check if share is expired
    if (this.isShareExpired(share)) {
      return false;
    }

    // Check permission levels
    const permissionLevels = { read: 1, write: 2, admin: 3 };
    const requiredLevel = permissionLevels[requiredPermission];
    const shareLevel = permissionLevels[share.shareType];

    return shareLevel >= requiredLevel;
  }

  static filterValidShares(shares: ContextShare[]): ContextShare[] {
    return shares.filter(share => !this.isShareExpired(share));
  }

  static getSharePermissionLevel(shareType: 'read' | 'write' | 'admin'): number {
    const levels = { read: 1, write: 2, admin: 3 };
    return levels[shareType];
  }

  static getHighestPermission(shares: ContextShare[]): 'read' | 'write' | 'admin' {
    const validShares = this.filterValidShares(shares);
    
    if (validShares.some(share => share.shareType === 'admin')) {
      return 'admin';
    }
    if (validShares.some(share => share.shareType === 'write')) {
      return 'write';
    }
    return 'read';
  }

  static createShareSummary(shares: ContextShare[]): {
    total: number;
    active: number;
    expired: number;
    byType: Record<string, number>;
    byTarget: Record<string, number>;
  } {
    const now = new Date();
    const summary = {
      total: shares.length,
      active: 0,
      expired: 0,
      byType: {} as Record<string, number>,
      byTarget: {} as Record<string, number>
    };

    for (const share of shares) {
      // Count by type
      summary.byType[share.shareType] = (summary.byType[share.shareType] || 0) + 1;
      
      // Count by target
      summary.byTarget[share.targetAgentId] = (summary.byTarget[share.targetAgentId] || 0) + 1;
      
      // Count active vs expired
      if (this.isShareExpired(share)) {
        summary.expired++;
      } else {
        summary.active++;
      }
    }

    return summary;
  }

  static sanitizeShareRecord(share: ContextShare): ContextShare {
    return {
      ...share,
      permissions: SecurityValidator.sanitizeObject(share.permissions) as Record<string, any>
    };
  }

  static validateShareExpiry(expiresAt?: Date): Date | undefined {
    if (!expiresAt) {
      return undefined;
    }

    if (!(expiresAt instanceof Date)) {
      throw new Error('Expiry date must be a valid Date object');
    }

    const now = new Date();
    if (expiresAt <= now) {
      throw new Error('Expiry date must be in the future');
    }

    // Maximum expiry time: 1 year from now
    const maxExpiry = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
    if (expiresAt > maxExpiry) {
      throw new Error('Expiry date cannot be more than 1 year from now');
    }

    return expiresAt;
  }

  static generateShareId(): string {
    return `share_${uuidv4()}`;
  }

  static async checkShareLimits(
    sourceAgentId: string,
    currentShares: ContextShare[],
    maxShares: number = 100,
  ): Promise<void> {
    const activeShares = this.filterValidShares(currentShares);
    
    if (activeShares.length >= maxShares) {
      SecurityLogger.log({
        type: 'authorization',
        severity: 'medium',
        agentId: sourceAgentId,
        action: 'checkShareLimits',
        details: { 
          currentShares: activeShares.length,
          maxShares,
          reason: 'Share limit exceeded'
        }
      });
      
      throw new Error(`Maximum share limit of ${maxShares} active shares exceeded`);
    }
  }

  static createShareAuditLog(share: ContextShare, action: string): {
    shareId: string;
    action: string;
    sourceAgentId: string;
    targetAgentId: string;
    shareType: string;
    timestamp: Date;
    expiresAt?: Date;
    createdBy?: string;
  } {
    return {
      shareId: share.id,
      action,
      sourceAgentId: share.sourceAgentId,
      targetAgentId: share.targetAgentId,
      shareType: share.shareType,
      timestamp: new Date(),
      expiresAt: share.expiresAt,
      createdBy: share.createdBy
    };
  }
}

export default ContextSharingHelpers;