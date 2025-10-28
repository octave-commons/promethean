import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createGraphQLClient, createPullRequestFetcher, createRestJsonClient, enablePullRequestAutoMerge, enqueuePullRequest, pollPullRequestStatus, updatePullRequestBranch, } from './github.js';
const coordinatesFrom = (repo, number) => ({
    repo: { owner: repo.owner, name: repo.name },
    number,
});
const toToolResponse = (value) => ({
    content: [
        {
            type: 'text',
            text: typeof value === 'string' ? value : JSON.stringify(value),
        },
    ],
});
const statusSchema = z.object({
    token: z.string(),
    repo: z.object({ owner: z.string(), name: z.string() }),
    number: z.number().int(),
    waitForKnown: z.boolean().default(true),
    attempts: z.number().int().default(10),
    delayMs: z.number().int().default(1200),
});
const registerStatusTool = (context) => {
    const { server, fetchImpl } = context;
    server.registerTool('pr.status', {
        description: 'Get PR mergeability and state; polls until not UNKNOWN if requested.',
        inputSchema: statusSchema.shape,
    }, async ({ token, repo, number, waitForKnown, attempts, delayMs }) => {
        const gqlClient = createGraphQLClient(token, fetchImpl);
        const fetcher = createPullRequestFetcher(gqlClient);
        const status = await pollPullRequestStatus(fetcher, coordinatesFrom(repo, number), {
            waitForKnown,
            attempts,
            delayMs,
        });
        return toToolResponse(status);
    });
};
const updateSchema = z.object({
    token: z.string(),
    repo: z.object({ owner: z.string(), name: z.string() }),
    number: z.number().int(),
    expectedHeadOid: z.string().optional(),
});
const registerUpdateBranchTool = (context) => {
    const { server, fetchImpl } = context;
    server.registerTool('pr.updateBranch', {
        description: 'Server-side merge base→head (like the Update branch button).',
        inputSchema: updateSchema.shape,
    }, async ({ token, repo, number, expectedHeadOid }) => {
        const rest = createRestJsonClient(token, fetchImpl);
        const update = updatePullRequestBranch(rest);
        const result = await update(coordinatesFrom(repo, number), expectedHeadOid);
        return toToolResponse(result);
    });
};
const autoMergeSchema = z.object({
    token: z.string(),
    repo: z.object({ owner: z.string(), name: z.string() }),
    number: z.number().int(),
    expectedHeadOid: z.string(),
    method: z.enum(['SQUASH', 'MERGE', 'REBASE']).default('SQUASH'),
});
const registerAutoMergeTool = (context) => {
    const { server, fetchImpl } = context;
    server.registerTool('pr.enableAutoMerge', {
        description: 'Enable auto-merge for a clean PR.',
        inputSchema: autoMergeSchema.shape,
    }, async ({ token, repo, number, expectedHeadOid, method }) => {
        const gqlClient = createGraphQLClient(token, fetchImpl);
        const fetcher = createPullRequestFetcher(gqlClient);
        const pullRequest = await fetcher(coordinatesFrom(repo, number));
        const enable = enablePullRequestAutoMerge(gqlClient);
        await enable(pullRequest.id, expectedHeadOid, method);
        return toToolResponse({ ok: true });
    });
};
const enqueueSchema = z.object({
    token: z.string(),
    repo: z.object({ owner: z.string(), name: z.string() }),
    number: z.number().int(),
});
const registerEnqueueTool = (context) => {
    const { server, fetchImpl } = context;
    server.registerTool('pr.enqueue', {
        description: 'Add PR to merge queue.',
        inputSchema: enqueueSchema.shape,
    }, async ({ token, repo, number }) => {
        const gqlClient = createGraphQLClient(token, fetchImpl);
        const fetcher = createPullRequestFetcher(gqlClient);
        const pullRequest = await fetcher(coordinatesFrom(repo, number));
        const enqueue = enqueuePullRequest(gqlClient);
        const result = await enqueue(pullRequest.id);
        return toToolResponse(result);
    });
};
export const createConflictServer = (dependencies = {}) => {
    const fetchImpl = dependencies.fetchImpl ?? fetch;
    const server = new McpServer({
        name: 'promethean-gh-conflicts',
        version: '0.1.0',
    });
    const context = { server, fetchImpl };
    registerStatusTool(context);
    registerUpdateBranchTool(context);
    registerAutoMergeTool(context);
    registerEnqueueTool(context);
    // TODO: pr.fetchMergeTriples & pr.applyResolution — implement via Git data API or a short-lived clone, then use createCommitOnBranch.
    return server;
};
export const server = createConflictServer();
//# sourceMappingURL=server.js.map