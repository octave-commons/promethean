/**
 * Core types and interfaces for the Scar file healing system
 */

import { z } from 'zod';

// ============================================================================
// Core Scar Types
// ============================================================================

export enum ScarType {
  FILENAME_CORRUPTION = 'filename_corruption',
  CONTENT_CORRUPTION = 'content_corruption',
  STRUCTURE_CORRUPTION = 'structure_corruption',
  ENCODING_CORRUPTION = 'encoding_corruption',
  METADATA_CORRUPTION = 'metadata_corruption',
}

export enum ScarSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum HealingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

// ============================================================================
// File Corruption Detection
// ============================================================================

export interface FileCorruption {
  readonly type: ScarType;
  readonly severity: ScarSeverity;
  readonly description: string;
  readonly filePath: string;
  readonly detectedAt: Date;
  readonly evidence?: ReadonlyArray<string>;
  readonly autoHealable: boolean;
}

export interface CorruptionPattern {
  readonly type: ScarType;
  readonly pattern: RegExp;
  readonly description: string;
  readonly severity: ScarSeverity;
  readonly autoHealable: boolean;
  readonly healer?: string;
}

export interface FileAnalysisResult {
  readonly filePath: string;
  readonly isCorrupted: boolean;
  readonly corruptions: ReadonlyArray<FileCorruption>;
  readonly fileSize: number;
  readonly encoding: string;
  readonly lastModified: Date;
  readonly checksum?: string;
}

// ============================================================================
// Healing Operations
// ============================================================================

export interface HealingOperation {
  readonly id: string;
  readonly filePath: string;
  readonly corruptions: ReadonlyArray<FileCorruption>;
  readonly status: HealingStatus;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly errorMessage?: string;
  readonly backupPath?: string;
  readonly originalChecksum?: string;
  readonly healedChecksum?: string;
}

export interface HealingStrategy {
  readonly name: string;
  readonly supportedTypes: ReadonlyArray<ScarType>;
  readonly heal: (corruption: FileCorruption, content: string) => Promise<HealingResult>;
  readonly canHeal: (corruption: FileCorruption) => boolean;
  readonly priority: number;
}

export interface HealingResult {
  readonly success: boolean;
  readonly healedContent?: string;
  readonly errorMessage?: string;
  readonly changesMade?: ReadonlyArray<string>;
  readonly requiresManualReview: boolean;
  readonly metadata?: Readonly<Record<string, any>>;
}

// ============================================================================
// Scar Tracking
// ============================================================================

export interface Scar {
  readonly id: string;
  readonly filePath: string;
  readonly type: ScarType;
  readonly severity: ScarSeverity;
  readonly status: HealingStatus;
  readonly detectedAt: Date;
  readonly healedAt?: Date;
  readonly healingOperationId?: string;
  readonly description: string;
  readonly evidence?: ReadonlyArray<string>;
  readonly metadata: Readonly<Record<string, any>>;
  readonly tags: ReadonlyArray<string>;
}

export interface ScarRecord {
  readonly scar: Scar;
  readonly healingOperation?: HealingOperation;
  readonly beforeSnapshot?: FileSnapshot;
  readonly afterSnapshot?: FileSnapshot;
  readonly notes?: string;
}

export interface FileSnapshot {
  readonly filePath: string;
  readonly content: string;
  readonly checksum: string;
  readonly size: number;
  readonly encoding: string;
  readonly timestamp: Date;
  readonly metadata: Readonly<Record<string, any>>;
}

// ============================================================================
// Configuration
// ============================================================================

export interface ScarConfig {
  readonly enabled: boolean;
  readonly autoHeal: boolean;
  readonly backupEnabled: boolean;
  readonly backupDirectory: string;
  readonly maxBackupSize: number;
  readonly corruptionPatterns: ReadonlyArray<CorruptionPattern>;
  readonly healingStrategies: ReadonlyArray<HealingStrategy>;
  readonly scarStoragePath: string;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly dryRun: boolean;
}

export interface ScarManagerConfig {
  readonly rootDirectory: string;
  readonly includePatterns: ReadonlyArray<string>;
  readonly excludePatterns: ReadonlyArray<string>;
  readonly maxConcurrency: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
}

// ============================================================================
// Events and Callbacks
// ============================================================================

export interface ScarEvent {
  readonly type:
    | 'corruption_detected'
    | 'healing_started'
    | 'healing_completed'
    | 'healing_failed'
    | 'scar_created';
  readonly timestamp: Date;
  readonly scarId?: string;
  readonly filePath?: string;
  readonly data?: Readonly<Record<string, any>>;
}

export type ScarEventHandler = (event: ScarEvent) => void | Promise<void>;

export interface ScarProgress {
  readonly totalFiles: number;
  readonly processedFiles: number;
  readonly corruptedFiles: number;
  readonly healedFiles: number;
  readonly failedFiles: number;
  readonly currentFile?: string;
  readonly percentage: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const ScarTypeSchema = z.nativeEnum(ScarType);
export const ScarSeveritySchema = z.nativeEnum(ScarSeverity);
export const HealingStatusSchema = z.nativeEnum(HealingStatus);

export const FileCorruptionSchema = z.object({
  type: ScarTypeSchema,
  severity: ScarSeveritySchema,
  description: z.string(),
  filePath: z.string(),
  detectedAt: z.date(),
  evidence: z.array(z.string()).optional(),
  autoHealable: z.boolean(),
});

export const CorruptionPatternSchema = z.object({
  type: ScarTypeSchema,
  pattern: z.instanceof(RegExp),
  description: z.string(),
  severity: ScarSeveritySchema,
  autoHealable: z.boolean(),
  healer: z.string().optional(),
});

export const HealingResultSchema = z.object({
  success: z.boolean(),
  healedContent: z.string().optional(),
  errorMessage: z.string().optional(),
  changesMade: z.array(z.string()).optional(),
  requiresManualReview: z.boolean(),
});

export const ScarSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  type: ScarTypeSchema,
  severity: ScarSeveritySchema,
  status: HealingStatusSchema,
  detectedAt: z.date(),
  healedAt: z.date().optional(),
  healingOperationId: z.string().optional(),
  description: z.string(),
  evidence: z.array(z.string()).optional(),
  metadata: z.record(z.any()),
  tags: z.array(z.string()),
});

export const FileSnapshotSchema = z.object({
  filePath: z.string(),
  content: z.string(),
  checksum: z.string(),
  size: z.number(),
  encoding: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()),
});

// ============================================================================
// Utility Types
// ============================================================================

export type ScarFilter = Partial<{
  type: ScarType;
  severity: ScarSeverity;
  status: HealingStatus;
  filePath: string;
  tags: ReadonlyArray<string>;
  detectedAfter: Date;
  detectedBefore: Date;
  healedAfter: Date;
  healedBefore: Date;
}>;

export type HealingOptions = Partial<{
  createBackup: boolean;
  dryRun: boolean;
  forceHeal: boolean;
  skipManualReview: boolean;
  maxRetries: number;
}>;

export type ScarStatistics = {
  totalScars: number;
  scarsByType: Record<ScarType, number>;
  scarsBySeverity: Record<ScarSeverity, number>;
  healingSuccessRate: number;
  averageHealingTime: number;
  lastScanDate?: Date;
};
