import { z } from 'zod';
import { isBase64String, normalizeGithubPayload } from './base64.js';
const GithubContentsInputShape = {
    owner: z.string(),
    repo: z.string(),
    path: z.string(),
    message: z.string(),
    content: z.string(),
    branch: z.string().optional(),
    sha: z.string().optional(),
    committer: z
        .object({
        name: z.string(),
        email: z.string(),
    })
        .optional(),
    author: z
        .object({
        name: z.string(),
        email: z.string(),
    })
        .optional(),
    encoding: z.enum(['utf-8', 'base64']).optional(),
};
const GithubContentsSchema = z.object(GithubContentsInputShape);
const encodeOwnerRepoPath = ({ owner, repo, path }) => {
    const ownerPart = encodeURIComponent(owner);
    const repoPart = encodeURIComponent(repo);
    const pathPart = path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
    return `/repos/${ownerPart}/${repoPart}/contents/${pathPart}`;
};
const encodeContent = (content, encoding) => {
    if (encoding === 'base64') {
        if (!isBase64String(content)) {
            throw new Error('Invalid base64 content provided to github_contents_write');
        }
        return content;
    }
    return Buffer.from(content, 'utf8').toString('base64');
};
const createHeaders = (apiVersion, token) => ({
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': apiVersion,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
const createRequestBody = (args, encodedContent) => ({
    message: args.message,
    content: encodedContent,
    encoding: 'base64',
    ...(args.branch ? { branch: args.branch } : {}),
    ...(args.sha ? { sha: args.sha } : {}),
    ...(args.committer ? { committer: args.committer } : {}),
    ...(args.author ? { author: args.author } : {}),
});
const headersToRecord = (headers) => Array.from(headers.entries()).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
export const githubContentsWrite = (ctx) => {
    const base = ctx.env.GITHUB_BASE_URL ?? 'https://api.github.com';
    const apiVersion = ctx.env.GITHUB_API_VERSION ?? '2022-11-28';
    const token = ctx.env.GITHUB_TOKEN;
    const spec = {
        name: 'github_contents_write',
        description: 'Create or update a file via the GitHub contents API with automatic base64 encoding.',
        inputSchema: GithubContentsInputShape,
        stability: 'experimental',
        since: '0.1.0',
    };
    const invoke = async (raw) => {
        const args = GithubContentsSchema.parse(raw);
        const encoding = args.encoding ?? 'utf-8';
        const encodedContent = encodeContent(args.content, encoding);
        const path = encodeOwnerRepoPath({
            owner: args.owner,
            repo: args.repo,
            path: args.path,
        });
        const url = new URL(path, base);
        const headers = createHeaders(apiVersion, token);
        const body = createRequestBody(args, encodedContent);
        const response = await ctx.fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        const responseText = await response.text();
        const contentType = response.headers.get('content-type') ?? '';
        const dataSource = responseText.length === 0
            ? null
            : contentType.includes('json')
                ? JSON.parse(responseText)
                : responseText;
        const data = normalizeGithubPayload(dataSource);
        return {
            status: response.status,
            headers: headersToRecord(response.headers),
            data,
        };
    };
    return { spec, invoke };
};
//# sourceMappingURL=contents.js.map