/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createSandbox as createSandboxDefault, listSandboxes as listSandboxesDefault, removeSandbox as removeSandboxDefault, } from './git.js';
const sandboxIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const refPattern = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u;
const toToolResponse = (value) => ({
    content: [
        {
            type: 'text',
            text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
        },
    ],
});
const materializeToolResponse = (response) => ({
    ...response,
    content: response.content.map((entry) => ({ ...entry })),
});
const adaptHandler = (handler) => async (args) => {
    const response = await handler(args);
    return materializeToolResponse(response);
};
const createSchema = z.object({
    repoPath: z.string().min(1, 'repoPath is required'),
    sandboxId: z
        .string()
        .regex(sandboxIdPattern, 'sandboxId may only contain letters, numbers, dots, underscores, or hyphens'),
    ref: z.string().regex(refPattern, 'ref contains unsupported characters').optional(),
    branch: z.string().regex(refPattern, 'branch contains unsupported characters').optional(),
});
const listSchema = z.object({
    repoPath: z.string().min(1, 'repoPath is required'),
});
const removeSchema = z.object({
    repoPath: z.string().min(1, 'repoPath is required'),
    sandboxId: z
        .string()
        .regex(sandboxIdPattern, 'sandboxId may only contain letters, numbers, dots, underscores, or hyphens'),
});
const defaultDependencies = {
    createSandbox: createSandboxDefault,
    listSandboxes: listSandboxesDefault,
    removeSandbox: removeSandboxDefault,
};
const createSandboxHandler = ({ createSandbox }) => async (args) => {
    const input = createSchema.parse(args);
    const sandbox = await createSandbox(input);
    return toToolResponse(sandbox);
};
const listSandboxesHandler = ({ listSandboxes }) => async (args) => {
    const input = listSchema.parse(args);
    const sandboxes = await listSandboxes(input);
    return toToolResponse(sandboxes);
};
const deleteSandboxHandler = ({ removeSandbox }) => async (args) => {
    const input = removeSchema.parse(args);
    await removeSandbox(input);
    return toToolResponse({ ok: true });
};
export const createSandboxServer = (dependencies = {}) => {
    const resolved = {
        ...defaultDependencies,
        ...dependencies,
    };
    const server = new McpServer({
        name: 'promethean-github-sandboxes',
        version: '0.1.0',
    });
    server.registerTool('sandbox_create', {
        description: 'Create a git worktree-based sandbox rooted under .sandboxes/<id>.',
        inputSchema: createSchema.shape,
    }, adaptHandler(createSandboxHandler(resolved)));
    server.registerTool('sandbox_list', {
        description: 'List sandboxes created as git worktrees under .sandboxes.',
        inputSchema: listSchema.shape,
    }, adaptHandler(listSandboxesHandler(resolved)));
    server.registerTool('sandbox_delete', {
        description: 'Remove a git worktree sandbox by sandboxId.',
        inputSchema: removeSchema.shape,
    }, adaptHandler(deleteSandboxHandler(resolved)));
    return server;
};
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types, functional/prefer-immutable-types */
//# sourceMappingURL=server.js.map