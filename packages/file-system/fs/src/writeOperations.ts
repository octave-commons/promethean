import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

import type { DirectoryWriteOperation } from './ecs.js';
import { ensureDir } from './ensureDir.js';
import { normalizeRelative } from './pathUtils.js';

export type OperationResult = {
    readonly applied: readonly DirectoryWriteOperation[];
    readonly error?: string;
};

export async function applyOperationsSequentially(
    root: string,
    operations: readonly DirectoryWriteOperation[],
    index = 0,
    applied: readonly DirectoryWriteOperation[] = [],
): Promise<OperationResult> {
    if (index >= operations.length) {
        return { applied };
    }
    const op = operations[index]!;
    try {
        await applyOperation(root, op);
        return applyOperationsSequentially(root, operations, index + 1, [...applied, op]);
    } catch (err) {
        return {
            applied,
            error: err instanceof Error ? err.message : String(err),
        };
    }
}

export async function applyOperation(root: string, op: DirectoryWriteOperation): Promise<void> {
    const absPath = path.join(root, normalizeRelative(op.relative));
    switch (op.kind) {
        case 'mkdir':
            await ensureDir(absPath);
            return;
        case 'remove':
            await fs.rm(absPath, { force: true, recursive: op.recursive ?? true });
            return;
        case 'write': {
            const dir = path.dirname(absPath);
            await ensureDir(dir);
            if (typeof op.content === 'string') {
                await fs.writeFile(absPath, op.content, op.encoding ?? 'utf8');
            } else {
                await fs.writeFile(absPath, op.content);
            }
            return;
        }
        default: {
            const exhaustiveCheck: never = op;
            void exhaustiveCheck;
            throw new Error('Unsupported operation');
        }
    }
}

export function hashOperations(ops: readonly DirectoryWriteOperation[]): string | undefined {
    if (ops.length === 0) return undefined;
    const h = createHash('sha256');
    ops.forEach((op) => {
        h.update(op.kind);
        h.update(op.relative);
        if (op.kind === 'write') {
            h.update(typeof op.content === 'string' ? op.content : op.content.toString('base64'));
            if (op.encoding) h.update(op.encoding);
        }
    });
    return h.digest('hex');
}
