import { z } from 'zod';
import { createSandbox, listSandboxes, removeSandbox } from '../github/sandboxes/git.js';
const sandboxIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const refPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u;
const createShape = {
    repoPath: z.string().min(1, 'repoPath is required'),
    sandboxId: z
        .string()
        .regex(sandboxIdPattern, 'sandboxId may only contain letters, numbers, dots, underscores, or hyphens'),
    ref: z.string().regex(refPattern, 'ref contains unsupported characters').optional(),
    branch: z.string().regex(refPattern, 'branch contains unsupported characters').optional(),
};
const listShape = {
    repoPath: z.string().min(1, 'repoPath is required'),
};
const removeShape = {
    repoPath: z.string().min(1, 'repoPath is required'),
    sandboxId: z
        .string()
        .regex(sandboxIdPattern, 'sandboxId may only contain letters, numbers, dots, underscores, or hyphens'),
};
export const sandboxCreateTool = () => {
    const Schema = z.object(createShape);
    const spec = {
        name: 'sandbox_create',
        description: 'Create a git worktree-based sandbox rooted under .sandboxes/<id>.',
        inputSchema: createShape,
        stability: 'experimental',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const input = Schema.parse(raw);
        return createSandbox(input);
    };
    return { spec, invoke };
};
export const sandboxListTool = () => {
    const Schema = z.object(listShape);
    const spec = {
        name: 'sandbox_list',
        description: 'List sandboxes created as git worktrees under .sandboxes.',
        inputSchema: listShape,
        stability: 'experimental',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const input = Schema.parse(raw);
        return listSandboxes(input);
    };
    return { spec, invoke };
};
export const sandboxDeleteTool = () => {
    const Schema = z.object(removeShape);
    const spec = {
        name: 'sandbox_delete',
        description: 'Remove a git worktree sandbox by sandboxId.',
        inputSchema: removeShape,
        stability: 'experimental',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const input = Schema.parse(raw);
        await removeSandbox(input);
        return { ok: true };
    };
    return { spec, invoke };
};
//# sourceMappingURL=sandboxes.js.map