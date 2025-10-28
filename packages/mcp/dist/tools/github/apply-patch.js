import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { buffer } from 'node:stream/consumers';
import { z } from 'zod';
class GitApplyError extends Error {
    code;
    stdout;
    stderr;
    attemptedThreeWay;
    constructor(message, code, init) {
        super(message);
        this.name = 'GitApplyError';
        this.code = code;
        this.stdout = init.stdout;
        this.stderr = init.stderr;
        this.attemptedThreeWay = init.attemptedThreeWay ?? false;
    }
}
const joinOutputs = (...parts) => parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join('\n');
const runGitApplyAttempt = async (diff, options, threeWay) => {
    const args = ['apply', '--whitespace=nowarn', ...(threeWay ? ['--3way'] : [])];
    const child = spawn('git', args, {
        cwd: options.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
    });
    const exitCodePromise = new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', resolve);
    });
    const stdoutPromise = buffer(child.stdout).then((buf) => buf.toString('utf8'));
    const stderrPromise = buffer(child.stderr).then((buf) => buf.toString('utf8'));
    child.stdin.end(diff, 'utf8');
    const [code, stdout, stderr] = await Promise.all([exitCodePromise, stdoutPromise, stderrPromise]);
    if (code === 0) {
        return { stdout, stderr };
    }
    throw new GitApplyError('git apply failed', code, {
        stdout,
        stderr,
        attemptedThreeWay: threeWay,
    });
};
const runGitApply = (diff, options) => runGitApplyAttempt(diff, options, false).catch((error) => {
    if (!(error instanceof GitApplyError)) {
        throw error;
    }
    return runGitApplyAttempt(diff, options, true).catch((fallbackError) => {
        if (fallbackError instanceof GitApplyError) {
            throw new GitApplyError('git apply failed after attempting 3-way merge', fallbackError.code, {
                stdout: joinOutputs(error.stdout, fallbackError.stdout),
                stderr: joinOutputs(error.stderr, fallbackError.stderr, 'git apply --3way also failed'),
                attemptedThreeWay: true,
            });
        }
        throw fallbackError;
    });
});
const diffHeaderRegex = /^diff --git (?:"a\/(.+?)"|a\/(.+?)) (?:"b\/(.+?)"|b\/(.+?))$/;
const ensureSafePath = (value) => {
    if (value.length === 0) {
        throw new Error('Encountered empty path in diff header');
    }
    if (value.includes('\0')) {
        throw new Error('Diff contains NUL byte in path');
    }
    if (value.startsWith('/')) {
        throw new Error(`Refusing to write outside workspace for path: ${value}`);
    }
    const disallowedSegments = value
        .split('/')
        .some((segment) => segment === '..' || segment.length === 0);
    if (disallowedSegments) {
        throw new Error(`Unsafe relative path in diff: ${value}`);
    }
    return value;
};
const decodeDiffPath = (value) => value.replace(/\\(.)/g, '$1');
const parsePatchFile = (block) => {
    const header = block[0];
    if (!header) {
        throw new Error('Diff block missing header');
    }
    const match = diffHeaderRegex.exec(header);
    if (!match) {
        throw new Error(`Unsupported diff header: ${header}`);
    }
    const oldPathRaw = match[1] ?? match[2];
    const newPathRaw = match[3] ?? match[4];
    if (!oldPathRaw || !newPathRaw) {
        throw new Error(`Unable to parse paths from diff header: ${header}`);
    }
    const oldPath = oldPathRaw === '/dev/null' ? null : ensureSafePath(decodeDiffPath(oldPathRaw));
    const newPath = newPathRaw === '/dev/null' ? null : ensureSafePath(decodeDiffPath(newPathRaw));
    const metadata = block.slice(1);
    const isBinary = metadata.some((line) => line.startsWith('Binary files'));
    if (isBinary) {
        throw new Error('Binary patches are not supported by github_apply_patch');
    }
    const isRename = metadata.some((line) => line.startsWith('rename from') || line.startsWith('rename to'));
    if (isRename) {
        throw new Error('Renames are not supported by github_apply_patch');
    }
    const isNewFile = metadata.some((line) => line.startsWith('new file mode')) ||
        metadata.some((line) => line.startsWith('--- /dev/null'));
    const isDeletedFile = metadata.some((line) => line.startsWith('deleted file mode')) ||
        metadata.some((line) => line.startsWith('+++ /dev/null'));
    return {
        oldPath,
        newPath,
        isNewFile,
        isDeletedFile,
        isBinary,
    };
};
const splitDiffIntoBlocks = (diff) => {
    const lines = diff.split(/\r?\n/);
    const blocks = [];
    let current = null;
    for (const line of lines) {
        if (line.startsWith('diff --git ')) {
            if (current) {
                blocks.push(current);
            }
            current = [line];
        }
        else if (current) {
            current.push(line);
        }
    }
    if (current) {
        blocks.push(current);
    }
    return blocks;
};
const parsePatchFiles = (diff) => {
    const blocks = splitDiffIntoBlocks(diff);
    if (blocks.length === 0) {
        throw new Error('Diff does not contain any file changes');
    }
    return blocks.map((block) => parsePatchFile(block));
};
const writeBaseFile = async (workspace, relativePath, contents) => {
    const target = join(workspace, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents);
};
const encodePathSegments = (path) => path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
const fetchFileContent = async (ctx, baseUrl, headers, owner, repo, branch, path) => {
    const encodedPath = encodePathSegments(path);
    const url = new URL(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`, baseUrl);
    url.searchParams.set('ref', branch);
    const res = await ctx.fetch(url, {
        method: 'GET',
        headers,
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to fetch ${path} from ${owner}/${repo}@${branch}: ${res.status} ${res.statusText} ${body}`);
    }
    const data = (await res.json());
    if (data.encoding !== 'base64') {
        throw new Error(`Unsupported encoding for ${path}: ${data.encoding}`);
    }
    return Buffer.from(data.content, 'base64');
};
const fetchBranchHead = async (ctx, baseUrl, headers, owner, repo, branch) => {
    const url = new URL(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`, baseUrl);
    const res = await ctx.fetch(url, {
        method: 'GET',
        headers,
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to resolve branch head for ${owner}/${repo}@${branch}: ${res.status} ${res.statusText} ${body}`);
    }
    const payload = (await res.json());
    const sha = payload.object?.sha;
    if (!sha) {
        throw new Error(`Git ref response missing object.sha for ${owner}/${repo}@${branch}`);
    }
    return sha;
};
const createCommit = async (ctx, endpoint, token, input) => {
    const mutation = `mutation ApplyPatch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
      commit {
        oid
        url
      }
    }
  }`;
    const res = await ctx.fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: mutation, variables: { input } }),
    });
    const payload = (await res.json());
    if (!res.ok || payload.errors?.length) {
        const message = payload.errors?.map((err) => err.message ?? 'Unknown error').join('; ') ?? '';
        throw new Error(`GitHub GraphQL commit failed with ${res.status}: ${message || res.statusText}`);
    }
    const commit = payload.data?.createCommitOnBranch?.commit;
    if (!commit) {
        throw new Error('GitHub GraphQL response missing commit payload');
    }
    return { oid: commit.oid, url: commit.url ?? null };
};
const isUniversalDiff = (value) => /^(?:Index: |diff --git|---\s)/m.test(value);
export const inputSchema = z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string(),
    message: z.string(),
    diff: z.string().min(1, 'diff is required'),
    expectedHeadOid: z.string().optional(),
});
export const githubApplyPatchTool = (ctx) => {
    const restBase = ctx.env.GITHUB_BASE_URL ?? 'https://api.github.com';
    const graphqlBase = ctx.env.GITHUB_GRAPHQL_URL ?? 'https://api.github.com/graphql';
    const apiVersion = ctx.env.GITHUB_API_VERSION ?? '2022-11-28';
    const token = ctx.env.GITHUB_TOKEN;
    return {
        spec: {
            name: 'github_apply_patch',
            description: 'Apply a unified diff to a GitHub branch by committing the changes via createCommitOnBranch.',
            inputSchema: inputSchema.shape,
            stability: 'experimental',
            since: '0.1.0',
        },
        invoke: async (raw) => {
            if (!token) {
                throw new Error('github_apply_patch requires GITHUB_TOKEN in the environment');
            }
            const args = inputSchema.parse(raw);
            const { owner, repo, branch, message, diff } = args;
            if (!isUniversalDiff(diff)) {
                throw new Error('Input does not look like a universal diff');
            }
            const files = parsePatchFiles(diff);
            const authHeaders = {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': apiVersion,
                Authorization: `Bearer ${token}`,
            };
            const workspace = await mkdtemp(join(tmpdir(), 'mcp-github-apply-'));
            try {
                for (const file of files) {
                    if (!file.isNewFile) {
                        const sourcePath = file.oldPath ?? file.newPath;
                        if (!sourcePath) {
                            throw new Error('Unable to determine source path for patch application');
                        }
                        const contents = await fetchFileContent(ctx, restBase, authHeaders, owner, repo, branch, sourcePath);
                        await writeBaseFile(workspace, sourcePath, contents);
                    }
                    else if (file.newPath) {
                        await mkdir(dirname(join(workspace, file.newPath)), {
                            recursive: true,
                        });
                    }
                }
                await runGitApply(diff, { cwd: workspace });
                const additions = [];
                const deletions = [];
                for (const file of files) {
                    if (file.isDeletedFile) {
                        const target = file.oldPath;
                        if (!target) {
                            throw new Error('Deletion patch missing old path');
                        }
                        deletions.push({ path: target });
                        continue;
                    }
                    const target = file.newPath;
                    if (!target) {
                        throw new Error('Patch missing new path for addition or modification');
                    }
                    const content = await readFile(join(workspace, target));
                    additions.push({
                        path: target,
                        contents: content.toString('base64'),
                    });
                }
                const expectedHeadOid = args.expectedHeadOid ??
                    (await fetchBranchHead(ctx, restBase, authHeaders, owner, repo, branch));
                const [headline, ...rest] = message.split(/\r?\n/);
                const body = rest.join('\n').trim();
                const input = {
                    branch: {
                        repositoryNameWithOwner: `${owner}/${repo}`,
                        branchName: branch,
                    },
                    message: {
                        headline,
                        ...(body.length > 0 ? { body } : {}),
                    },
                    fileChanges: {
                        additions,
                        deletions,
                    },
                    expectedHeadOid,
                };
                const commit = await createCommit(ctx, graphqlBase, token, input);
                return {
                    ok: true,
                    commitOid: commit.oid,
                    commitUrl: commit.url,
                    additions: additions.length,
                    deletions: deletions.length,
                };
            }
            catch (error) {
                if (error instanceof GitApplyError) {
                    const details = [error.stdout.trim(), error.stderr.trim()]
                        .filter((part) => part.length > 0)
                        .join('\n');
                    throw new Error(`git apply exited with code ${error.code ?? 'unknown'}${details ? `: ${details}` : ''}`);
                }
                throw error;
            }
            finally {
                await rm(workspace, { recursive: true, force: true });
            }
        },
    };
};
//# sourceMappingURL=apply-patch.js.map