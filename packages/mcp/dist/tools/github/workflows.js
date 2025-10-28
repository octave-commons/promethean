import { strFromU8, unzipSync } from 'fflate';
import { z } from 'zod';
const DEFAULT_API_VERSION = '2022-11-28';
const DEFAULT_BASE_URL = 'https://api.github.com';
const IdSchema = z.union([
    z.number().int().nonnegative(),
    z
        .string()
        .trim()
        .regex(/^[0-9]+$/, 'must be a numeric identifier'),
]);
const buildGithubHeaders = (env) => {
    const token = env.GITHUB_TOKEN;
    const apiVersion = env.GITHUB_API_VERSION ?? DEFAULT_API_VERSION;
    const baseHeaders = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': apiVersion,
    };
    return token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
};
const toIdString = (value) => typeof value === 'number' ? value.toString(10) : value;
const toGithubUrl = (base, path) => new URL(path, base).toString();
const countLines = (content) => {
    if (content.length === 0) {
        return 0;
    }
    const normalized = content.replace(/\r\n/g, '\n');
    return normalized.split('\n').length;
};
const decodeLogArchive = async (archive) => Promise.resolve(archive)
    .then((buffer) => unzipSync(buffer))
    .then((files) => Object.entries(files).map(([path, bytes]) => {
    const content = strFromU8(bytes);
    return {
        path,
        size: bytes.byteLength,
        lineCount: countLines(content),
        content,
    };
}))
    .catch((error) => {
    throw new Error('[github.workflow] Failed to unzip workflow logs archive', { cause: error });
});
const fetchLogArchive = async (deps) => {
    const response = await deps.fetch(deps.url, {
        method: 'GET',
        headers: deps.headers,
    });
    if (!response.ok) {
        const body = await response.text().catch(() => '<unable to read response body>');
        throw new Error(`[github.workflow] Failed to download workflow logs (${response.status}): ${body.slice(0, 500)}`);
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    const files = await decodeLogArchive(buffer);
    return {
        archiveSize: buffer.byteLength,
        fileCount: files.length,
        files,
    };
};
export const githubWorkflowGetRunLogs = (ctx) => {
    const shape = {
        owner: z.string().trim().min(1),
        repo: z.string().trim().min(1),
        runId: IdSchema,
    };
    const Schema = z.object(shape);
    return {
        spec: {
            name: 'github_workflow_get_run_logs',
            description: 'Download and extract the log files for a GitHub Actions workflow run.',
            inputSchema: Schema.shape,
            stability: 'experimental',
            since: '0.1.0',
        },
        invoke: async (raw) => {
            const args = Schema.parse(raw);
            const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_BASE_URL;
            const runId = toIdString(args.runId);
            const url = toGithubUrl(base, `/repos/${args.owner}/${args.repo}/actions/runs/${runId}/logs`);
            return fetchLogArchive({
                fetch: ctx.fetch,
                headers: buildGithubHeaders(ctx.env),
                url,
            });
        },
    };
};
export const githubWorkflowGetJobLogs = (ctx) => {
    const shape = {
        owner: z.string().trim().min(1),
        repo: z.string().trim().min(1),
        jobId: IdSchema,
    };
    const Schema = z.object(shape);
    return {
        spec: {
            name: 'github_workflow_get_job_logs',
            description: 'Download and extract the log files for a GitHub Actions workflow job.',
            inputSchema: Schema.shape,
            stability: 'experimental',
            since: '0.1.0',
        },
        invoke: async (raw) => {
            const args = Schema.parse(raw);
            const base = ctx.env.GITHUB_BASE_URL ?? DEFAULT_BASE_URL;
            const jobId = toIdString(args.jobId);
            const url = toGithubUrl(base, `/repos/${args.owner}/${args.repo}/actions/jobs/${jobId}/logs`);
            return fetchLogArchive({
                fetch: ctx.fetch,
                headers: buildGithubHeaders(ctx.env),
                url,
            });
        },
    };
};
//# sourceMappingURL=workflows.js.map