import { z } from 'zod';

import type { ToolFactory } from '../../core/types.js';

import {
  callGithubGraphql,
  fetchPullRequestSummary,
  pullRequestIdentityShape,
} from './pull-request-api.js';
import { githubPrResolvePosition } from './pull-request-data.js';

const ReviewStartResponseSchema = z.object({
  addPullRequestReview: z.object({ pullRequestReview: z.object({ id: z.string() }) }).optional(),
});

const ReviewCommentResponseSchema = z.object({
  addPullRequestReviewThread: z.object({
    thread: z.object({ id: z.string() }).nullable(),
    pullRequestReview: z.object({ id: z.string() }).nullable(),
  }),
});

const ReviewSubmitResponseSchema = z.object({
  submitPullRequestReview: z.object({
    pullRequestReview: z.object({ id: z.string(), state: z.string() }),
  }),
});

type GraphqlPosition = Readonly<{
  readonly line: number;
  readonly side: string;
  readonly startLine?: number;
  readonly startSide?: string;
}>;

type GraphqlPositionError = Readonly<{
  readonly ok: false;
  readonly reason: string;
  readonly hint?: string;
  readonly nearest?: readonly number[];
}>;

const isGraphqlPositionError = (value: unknown): value is GraphqlPositionError =>
  Boolean(
    value &&
      typeof value === 'object' &&
      'ok' in (value as Record<string, unknown>) &&
      (value as Record<string, unknown>).ok === false,
  );

type ReviewThreadInput = Readonly<{
  readonly pullRequestId: string;
  readonly path: string;
  readonly body: string;
  readonly line: number;
  readonly side: string;
  readonly startLine?: number;
  readonly startSide?: string;
  readonly pullRequestReviewId?: string;
}>;

type ReviewThreadDetails = Readonly<{
  readonly pullRequestId: string;
  readonly path: string;
  readonly reviewId?: string;
  readonly position: GraphqlPosition;
  readonly body: string;
}>;

const buildReviewThreadInput = (details: ReviewThreadDetails): ReviewThreadInput => ({
  pullRequestId: details.pullRequestId,
  path: details.path,
  body: details.body,
  line: details.position.line,
  side: details.position.side,
  ...(details.position.startLine
    ? {
        startLine: details.position.startLine,
        startSide: details.position.startSide,
      }
    : {}),
  ...(details.reviewId ? { pullRequestReviewId: details.reviewId } : {}),
});

const submitReviewThread = async (
  ctx: Parameters<typeof githubPrResolvePosition>[0],
  input: ReviewThreadInput,
) => {
  const data = await callGithubGraphql({
    ctx,
    request: {
      query: `mutation AddReviewThread($input: AddPullRequestReviewThreadInput!) {
        addPullRequestReviewThread(input: $input) {
          thread { id }
          pullRequestReview { id }
        }
      }`,
      variables: { input },
    },
  });
  return ReviewCommentResponseSchema.parse(data);
};

const formatSuggestionBody = (
  body: string,
  suggestion:
    | { readonly before?: readonly string[]; readonly after: readonly string[] }
    | undefined,
): string => {
  if (!suggestion) {
    return body;
  }
  const replacement = suggestion.after.join('\n');
  const segments = ['```suggestion', replacement, '```', body.trim().length > 0 ? body : ''];
  return segments.filter((segment) => segment.length > 0).join('\n\n');
};

const buildInlineCommentSpec = () =>
  ({
    ...pullRequestIdentityShape,
    path: z.string().describe('File path within the pull request.'),
    line: z.number().int().positive().describe('New line number for the comment.'),
    startLine: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Optional starting line for multi-line comments.'),
    body: z.string().describe('Markdown body of the comment.'),
    reviewId: z
      .string()
      .optional()
      .describe('Optional pending review identifier to attach the thread.'),
    suggestion: z
      .object({
        before: z.array(z.string()).default([]),
        after: z.array(z.string()).min(1),
      })
      .optional()
      .describe('Optional GitHub suggestion block configuration.'),
  }) as const;

const resolveGraphqlPosition = async (
  ctx: Parameters<typeof githubPrResolvePosition>[0],
  input: {
    readonly owner: string;
    readonly repo: string;
    readonly number: number;
    readonly path: string;
    readonly line: number;
    readonly startLine?: number;
  },
): Promise<GraphqlPosition | GraphqlPositionError> => {
  const resolver = githubPrResolvePosition(ctx);
  const result = await resolver.invoke({
    ...input,
    rangeStart: input.startLine,
    prefer: 'graphql',
  });
  if (!result || typeof result !== 'object') {
    throw new Error('Unexpected response from github_pr_resolve_position');
  }
  if (isGraphqlPositionError(result)) {
    return result;
  }
  const graphql = (result as { graphql?: GraphqlPosition }).graphql;
  if (!graphql) {
    throw new Error('Position resolver did not return GraphQL fields.');
  }
  return graphql;
};

export const githubPrReviewStart: ToolFactory = (ctx) => {
  const shape = {
    pullRequestId: z.string().describe('GraphQL node id of the pull request.'),
    body: z.string().optional().describe('Optional body text for the pending review.'),
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: 'github_pr_review_start',
    description: 'Create a pending review on a pull request via GraphQL.',
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const data = await callGithubGraphql({
      ctx,
      request: {
        query: `mutation StartReview($pullRequestId: ID!, $body: String) {
          addPullRequestReview(input: { pullRequestId: $pullRequestId, body: $body }) {
            pullRequestReview { id }
          }
        }`,
        variables: {
          pullRequestId: args.pullRequestId,
          body: args.body ?? null,
        },
      },
    });
    const parsed = ReviewStartResponseSchema.parse(data);
    return {
      reviewId: parsed.addPullRequestReview?.pullRequestReview.id ?? null,
    } as const;
  };

  return { spec, invoke };
};

export const githubPrReviewCommentInline: ToolFactory = (ctx) => {
  const shape = buildInlineCommentSpec();
  const Schema = z.object(shape);

  const spec = {
    name: 'github_pr_review_comment_inline',
    description: 'Create an inline review thread on a pull request with automatic diff resolution.',
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const pullRequest = await fetchPullRequestSummary({ ctx, identity: args });
    const graphqlPosition = await resolveGraphqlPosition(ctx, {
      owner: args.owner,
      repo: args.repo,
      number: args.number,
      path: args.path,
      line: args.line,
      startLine: args.startLine,
    });

    if (isGraphqlPositionError(graphqlPosition)) {
      return graphqlPosition;
    }

    const body = formatSuggestionBody(args.body, args.suggestion);
    const inputPayload = buildReviewThreadInput({
      pullRequestId: pullRequest.id,
      path: args.path,
      reviewId: args.reviewId,
      position: graphqlPosition,
      body,
    });
    const parsed = await submitReviewThread(ctx, inputPayload);
    return {
      ok: true as const,
      threadId: parsed.addPullRequestReviewThread.thread?.id ?? null,
      reviewId: parsed.addPullRequestReviewThread.pullRequestReview?.id ?? args.reviewId ?? null,
    } as const;
  };

  return { spec, invoke };
};

export const githubPrReviewSubmit: ToolFactory = (ctx) => {
  const shape = {
    reviewId: z.string().describe('Review identifier returned by GitHub.'),
    event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).describe('Review submission event.'),
    body: z.string().optional().describe('Optional summary body for the submitted review.'),
  } as const;
  const Schema = z.object(shape);

  const spec = {
    name: 'github_pr_review_submit',
    description: 'Submit a pending review with APPROVE, REQUEST_CHANGES, or COMMENT.',
    inputSchema: shape,
  } as const;

  const invoke = async (raw: unknown) => {
    const args = Schema.parse(raw);
    const data = await callGithubGraphql({
      ctx,
      request: {
        query: `mutation SubmitReview($input: SubmitPullRequestReviewInput!) {
          submitPullRequestReview(input: $input) {
            pullRequestReview { id state }
          }
        }`,
        variables: {
          input: {
            pullRequestReviewId: args.reviewId,
            event: args.event,
            body: args.body ?? undefined,
          },
        },
      },
    });
    const parsed = ReviewSubmitResponseSchema.parse(data);
    return {
      reviewId: parsed.submitPullRequestReview.pullRequestReview.id,
      state: parsed.submitPullRequestReview.pullRequestReview.state,
    } as const;
  };

  return { spec, invoke };
};
