import { z } from 'zod';

import type { ToolFactory } from '../../core/types.js';

import {
  fetchPullRequestSummary,
  fetchPullRequestFiles,
  pullRequestIdentityShape,
  PullRequestIdentitySchema,
  type PullRequestFile,
} from './pull-request-api.js';
import {
  parseUnifiedPatch,
  resolveNewLinePosition,
  type ResolveNewLineOptions,
  type ResolutionError,
  type ResolvedPosition,
} from './position-resolver.js';

const mapFileWithHunks = (file: PullRequestFile) =>
  ({
    path: file.path,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
    hunks: file.patch ? parseUnifiedPatch(file.patch) : [],
  }) as const;

const buildResolverSuccess = (
  path: string,
  resolution: ResolvedPosition | ResolutionError,
  prefer: 'graphql' | 'rest',
) => {
  if ('reason' in resolution) {
    return {
      ok: false as const,
      reason: resolution.reason,
      hint:
        resolution.reason === 'LINE_OUTDATED_OR_NOT_IN_DIFF'
          ? 'The line was not found in the latest diff; try a nearby line or comment on the commit.'
          : undefined,
      nearest: resolution.nearest ? [...resolution.nearest] : undefined,
    } as const;
  }
  const graphql = {
    path,
    line: resolution.line,
    side: resolution.side,
    ...(resolution.startLine
      ? { startLine: resolution.startLine, startSide: resolution.startSide }
      : {}),
  } as const;
  const rest = {
    path,
    position: resolution.position,
  } as const;
  return prefer === 'rest'
    ? ({ ok: true as const, rest } as const)
    : ({ ok: true as const, graphql, rest } as const);
};

const resolvePositionForFile = (
  file: PullRequestFile,
  line: number,
  rangeStart: number | undefined,
  prefer: 'graphql' | 'rest',
) => {
  const hunks = file.patch ? parseUnifiedPatch(file.patch) : [];
  const resolution = resolveNewLinePosition({
    hunks,
    targetLine: line,
    rangeStart,
  } satisfies ResolveNewLineOptions);
  return buildResolverSuccess(file.path, resolution, prefer);
};

const specDescription = 'Map a file + new line to GitHub diff coordinates for inline comments.';

const buildNoPatchError = () =>
  ({
    ok: false as const,
    reason: 'PATCH_NOT_FOUND_OR_BINARY' as const,
    hint: 'The requested file has no diff patch (binary file, rename, or not part of the PR).',
  }) as const;

export const githubPrGet: ToolFactory = (ctx) => {
  const spec = {
    name: 'github_pr_get',
    description: 'Fetch metadata for a pull request (ids, SHAs, author).',
    inputSchema: pullRequestIdentityShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = PullRequestIdentitySchema.parse(raw);
    const summary = await fetchPullRequestSummary({ ctx, identity: args });
    return summary;
  };

  return { spec, invoke };
};

export const githubPrFiles: ToolFactory = (ctx) => {
  const spec = {
    name: 'github_pr_files',
    description: 'List files in a pull request with parsed diff hunks for line resolution.',
    inputSchema: pullRequestIdentityShape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = PullRequestIdentitySchema.parse(raw);
    const files = await fetchPullRequestFiles({ ctx, identity: args });
    const mapped = files.map(mapFileWithHunks);
    return { files: mapped } as const;
  };

  return { spec, invoke };
};

export const githubPrResolvePosition: ToolFactory = (ctx) => {
  const shape = {
    ...pullRequestIdentityShape,
    path: z.string().describe('File path within the pull request.'),
    line: z.number().int().positive().describe('Line number from the head commit (new file).'),
    rangeStart: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Optional start line for multi-line comments.'),
    prefer: z
      .enum(['graphql', 'rest'])
      .optional()
      .describe('Select output format; defaults to GraphQL fields.'),
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: 'github_pr_resolve_position',
    description: specDescription,
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const files = await fetchPullRequestFiles({ ctx, identity: args });
    const match = files.find((file) => file.path === args.path);
    if (!match || !match.patch) {
      return buildNoPatchError();
    }
    const prefer = args.prefer ?? 'graphql';
    return resolvePositionForFile(match, args.line, args.rangeStart, prefer);
  };

  return { spec, invoke };
};
