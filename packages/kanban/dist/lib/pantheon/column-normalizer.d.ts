import type { Board } from '../types.js';
export type ColumnNormalizationAction = 'keep' | 'rename' | 'merge';
export type ColumnNormalizationGroup = {
    canonicalStatus: string;
    canonicalKey: string;
    canonicalName: string;
    members: Array<{
        originalName: string;
        action: ColumnNormalizationAction;
        reason: string;
    }>;
};
export type ColumnNormalizationAnalysis = {
    groups: ColumnNormalizationGroup[];
};
export declare const analyzeColumnNormalization: (columnNames: string[], canonicalStatuses: string[]) => Promise<ColumnNormalizationAnalysis>;
export declare const applyColumnNormalization: (board: Board, analysis: ColumnNormalizationAnalysis) => number;
//# sourceMappingURL=column-normalizer.d.ts.map