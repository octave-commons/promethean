import { execFile, type ExecFileOptions } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';

import type { ToolContext, ToolFactory, ToolSpec } from '../../core/types.js';

const execFileAsync = promisify(execFile);
const GIT_EXEC_OPTS: ExecFileOptions & { encoding: 'utf8' } = {
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024,
};

const ensureCwd = (cwd?: string): string => cwd ?? process.cwd();

const runGit = async (
  args: readonly string[],
  cwd?: string,
): Promise<{ stdout: string; stderr: string }> => {
  const result = await execFileAsync('git', [...args], {
    ...GIT_EXEC_OPTS,
    cwd: ensureCwd(cwd),
  });
  return { stdout: result.stdout, stderr: result.stderr };
};

const createGithubGraphqlClient = (ctx: ToolContext) => {
  const endpoint = ctx.env.GITHUB_GRAPHQL_URL ?? 'https://api.github.com/graphql';
  const token = ctx.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'github.review tools require GITHUB_TOKEN in the environment to call GitHub GraphQL.',
    );
  }

  return async <T>({
    query,
    variables,
    schema,
  }: {
    query: string;
    variables?: Record<string, unknown>;
    schema: z.ZodType<T>;
  }): Promise<T> => {
    const res = await ctx.fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: variables ?? {},
      }),
    });

    const payload = (await res.json()) as {
      data?: unknown;
      errors?: ReadonlyArray<{ message?: string }>;
    };
    if (!res.ok) {
      throw new Error(
        `[github.review] GraphQL request failed with ${res.status}: ${JSON.stringify(payload)}`,
      );
    }
    if (payload.errors?.length) {
      const message = payload.errors
        .map((err: { message?: string }) => err.message ?? 'Unknown error')
        .join('; ');
      throw new Error(`[github.review] GraphQL errors: ${message}`);
    }
    if (!payload.data) {
      throw new Error('[github.review] GraphQL response missing data field');
    }
    return schema.parse(payload.data);
  };
};

const RepositoryIdSchema = z.object({
  repository: z
    .object({
      id: z.string(),
    })
    .nullable(),
});

const PullRequestIdSchema = z.object({
  repository: z
    .object({
      pullRequest: z
        .object({
          id: z.string(),
        })
        .nullable(),
    })
    .nullable(),
});

const getRepositoryId = async (
  client: ReturnType<typeof createGithubGraphqlClient>,
  owner: string,
  name: string,
): Promise<string> => {
  const data = await client({
    query: `query RepoId($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
      }
    }`,
    variables: { owner, name },
    schema: RepositoryIdSchema,
  });
  const repo = data.repository;
  if (!repo) {
    throw new Error(`[github.review] Repository not found: ${owner}/${name}`);
  }
  return repo.id;
};

const getPullRequestId = async (
  client: ReturnType<typeof createGithubGraphqlClient>,
  owner: string,
  name: string,
  number: number,
): Promise<string> => {
  const data = await client({
    query: `query PullRequestId($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          id
        }
      }
    }`,
    variables: { owner, name, number },
    schema: PullRequestIdSchema,
  });
  const repo = data.repository;
  const pr = repo?.pullRequest;
  if (!pr) {
    throw new Error(`[github.review] Pull request not found: ${owner}/${name}#${number}`);
  }
  return pr.id;
};

export const githubReviewOpenPullRequest: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    baseRefName: z.string(),
    headRefName: z.string(),
    title: z.string(),
    body: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  const ResponseSchema = z.object({
    createPullRequest: z.object({
      pullRequest: z.object({
        id: z.string(),
        number: z.number().int(),
        url: z.string(),
      }),
    }),
  });
  return {
    spec: {
      name: 'github_review_open_pull_request',
      description:
        'Open a new pull request targeting a base branch with the provided title and body.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const repositoryId = await getRepositoryId(client, args.owner, args.repo);
      const data = await client({
        query: `mutation OpenPullRequest($input: CreatePullRequestInput!) {
          createPullRequest(input: $input) {
            pullRequest {
              id
              number
              url
            }
          }
        }`,
        variables: {
          input: {
            repositoryId,
            baseRefName: args.baseRefName,
            headRefName: args.headRefName,
            title: args.title,
            body: args.body ?? '',
          },
        },
        schema: ResponseSchema,
      });
      return data.createPullRequest.pullRequest;
    },
  };
};

export const githubReviewGetComments: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
    pageSize: z.number().int().min(1).max(100).default(50),
    after: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  const ResponseSchema = z.object({
    repository: z
      .object({
        pullRequest: z
          .object({
            comments: z.object({
              totalCount: z.number().int(),
              pageInfo: z.object({
                endCursor: z.string().nullable(),
                hasNextPage: z.boolean(),
              }),
              nodes: z.array(
                z.object({
                  id: z.string(),
                  body: z.string(),
                  createdAt: z.string(),
                  url: z.string(),
                  author: z
                    .object({
                      login: z.string(),
                    })
                    .nullable(),
                }),
              ),
            }),
          })
          .nullable(),
      })
      .nullable(),
  });
  return {
    spec: {
      name: 'github_review_get_comments',
      description: 'List issue comments on a pull request with pagination support.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const data = await client({
        query: `query PullRequestComments($owner: String!, $name: String!, $number: Int!, $first: Int!, $after: String) {
          repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
              comments(first: $first, after: $after) {
                totalCount
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  id
                  body
                  createdAt
                  url
                  author {
                    login
                  }
                }
              }
            }
          }
        }`,
        variables: {
          owner: args.owner,
          name: args.repo,
          number: args.number,
          first: args.pageSize,
          after: args.after ?? null,
        },
        schema: ResponseSchema,
      });
      const pr = data.repository?.pullRequest;
      if (!pr) {
        throw new Error(
          `[github.review] Pull request not found: ${args.owner}/${args.repo}#${args.number}`,
        );
      }
      return pr.comments;
    },
  };
};

export const githubReviewGetReviewComments: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
    pageSize: z.number().int().min(1).max(50).default(20),
    after: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  const CommentNode = z.object({
    id: z.string(),
    body: z.string(),
    createdAt: z.string(),
    url: z.string(),
    author: z
      .object({
        login: z.string(),
      })
      .nullable(),
    path: z.string(),
    position: z.number().int().nullable(),
    originalPosition: z.number().int().nullable(),
    diffHunk: z.string(),
  });
  const ResponseSchema = z.object({
    repository: z
      .object({
        pullRequest: z
          .object({
            reviewThreads: z.object({
              pageInfo: z.object({
                endCursor: z.string().nullable(),
                hasNextPage: z.boolean(),
              }),
              nodes: z.array(
                z.object({
                  id: z.string(),
                  isResolved: z.boolean(),
                  comments: z.object({
                    nodes: z.array(CommentNode),
                  }),
                }),
              ),
            }),
          })
          .nullable(),
      })
      .nullable(),
  });
  return {
    spec: {
      name: 'github_review_get_review_comments',
      description: 'Fetch review thread comments (diff comments) for a pull request.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const data = await client({
        query: `query PullRequestReviewThreads($owner: String!, $name: String!, $number: Int!, $first: Int!, $after: String) {
          repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
              reviewThreads(first: $first, after: $after) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  id
                  isResolved
                  comments(first: 100) {
                    nodes {
                      id
                      body
                      createdAt
                      url
                      author {
                        login
                      }
                      path
                      position
                      originalPosition
                      diffHunk
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          owner: args.owner,
          name: args.repo,
          number: args.number,
          first: args.pageSize,
          after: args.after ?? null,
        },
        schema: ResponseSchema,
      });
      const pr = data.repository?.pullRequest;
      if (!pr) {
        throw new Error(
          `[github.review] Pull request not found: ${args.owner}/${args.repo}#${args.number}`,
        );
      }
      return pr.reviewThreads;
    },
  };
};

export const githubReviewSubmitComment: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
    body: z.string(),
  } as const;
  const Schema = z.object(shape);
  const ResponseSchema = z.object({
    addComment: z.object({
      commentEdge: z
        .object({
          node: z
            .object({
              id: z.string(),
              url: z.string(),
              createdAt: z.string(),
              body: z.string(),
              author: z
                .object({
                  login: z.string(),
                })
                .nullable(),
            })
            .nullable(),
        })
        .nullable(),
    }),
  });
  return {
    spec: {
      name: 'github_review_submit_comment',
      description: 'Submit an issue-level comment on a pull request.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const pullRequestId = await getPullRequestId(client, args.owner, args.repo, args.number);
      const data = await client({
        query: `mutation SubmitComment($input: AddCommentInput!) {
          addComment(input: $input) {
            commentEdge {
              node {
                id
                url
                createdAt
                body
                author {
                  login
                }
              }
            }
          }
        }`,
        variables: {
          input: {
            subjectId: pullRequestId,
            body: args.body,
          },
        },
        schema: ResponseSchema,
      });
      const node = data.addComment.commentEdge?.node;
      if (!node) {
        throw new Error('[github.review] Comment submission succeeded without comment node');
      }
      return node;
    },
  };
};

export const githubReviewRequestChangesFromCodex: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
    message: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  const ResponseSchema = z.object({
    addComment: z.object({
      commentEdge: z
        .object({
          node: z
            .object({
              id: z.string(),
              url: z.string(),
              createdAt: z.string(),
              body: z.string(),
              author: z
                .object({
                  login: z.string(),
                })
                .nullable(),
            })
            .nullable(),
        })
        .nullable(),
    }),
  });

  const buildCommentBody = (message?: string): string => {
    const trimmed = message?.trim();
    if (!trimmed) {
      return '@codex Requesting changes on this pull request.';
    }
    return trimmed.includes('@codex') ? trimmed : `@codex ${trimmed}`;
  };

  return {
    spec: {
      name: 'github_review_request_changes_from_codex',
      description:
        'Request changes from Codex by posting an issue-level pull request comment tagging @codex.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const pullRequestId = await getPullRequestId(client, args.owner, args.repo, args.number);
      const data = await client({
        query: `mutation RequestChangesFromCodex($input: AddCommentInput!) {
          addComment(input: $input) {
            commentEdge {
              node {
                id
                url
                createdAt
                body
                author {
                  login
                }
              }
            }
          }
        }`,
        variables: {
          input: {
            subjectId: pullRequestId,
            body: buildCommentBody(args.message),
          },
        },
        schema: ResponseSchema,
      });
      const node = data.addComment.commentEdge?.node;
      if (!node) {
        throw new Error('[github.review] Codex request succeeded without comment node');
      }
      return node;
    },
  };
};

const ReviewCommentInputSchema = z
  .object({
    path: z.string(),
    body: z.string(),
    position: z.number().int().positive().optional(),
    line: z.number().int().positive().optional(),
    side: z.enum(['LEFT', 'RIGHT']).optional(),
  })
  .refine((value) => typeof value.position === 'number' || typeof value.line === 'number', {
    message: 'Either position or line must be provided for a review comment',
  });

export const githubReviewSubmitReview: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
    event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).default('COMMENT'),
    body: z.string().optional(),
    comments: z.array(ReviewCommentInputSchema).default([]),
  } as const;
  const Schema = z.object(shape);
  const ResponseSchema = z.object({
    addPullRequestReview: z.object({
      pullRequestReview: z
        .object({
          id: z.string(),
          state: z.string(),
          submittedAt: z.string().nullable(),
          url: z.string().nullable(),
        })
        .nullable(),
    }),
  });
  return {
    spec: {
      name: 'github_review_submit_review',
      description: 'Create a pull request review with optional summary body and inline comments.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const pullRequestId = await getPullRequestId(client, args.owner, args.repo, args.number);
      const comments = args.comments.map((comment) => {
        const base: Record<string, unknown> = {
          path: comment.path,
          body: comment.body,
        };
        if (typeof comment.position === 'number') {
          base.position = comment.position;
        } else if (typeof comment.line === 'number') {
          base.line = comment.line;
          base.side = comment.side ?? 'RIGHT';
        }
        return base;
      });
      const data = await client({
        query: `mutation SubmitPullRequestReview($input: AddPullRequestReviewInput!) {
          addPullRequestReview(input: $input) {
            pullRequestReview {
              id
              state
              submittedAt
              url
            }
          }
        }`,
        variables: {
          input: {
            pullRequestId,
            event: args.event,
            body: args.body ?? undefined,
            comments,
          },
        },
        schema: ResponseSchema,
      });
      const review = data.addPullRequestReview.pullRequestReview;
      if (!review) {
        throw new Error('[github.review] Review submission did not return review data');
      }
      return review;
    },
  };
};

export const githubReviewGetActionStatus: ToolFactory = (ctx) => {
  const shape = {
    owner: z.string(),
    repo: z.string(),
    number: z.number().int(),
  } as const;
  const Schema = z.object(shape);
  const CheckRunSchema = z.object({
    __typename: z.literal('CheckRun'),
    name: z.string(),
    status: z.string(),
    conclusion: z.string().nullable(),
    detailsUrl: z.string().nullable(),
  });
  const StatusContextSchema = z.object({
    __typename: z.literal('StatusContext'),
    context: z.string(),
    state: z.string(),
    targetUrl: z.string().nullable(),
  });
  const ResponseSchema = z.object({
    repository: z
      .object({
        pullRequest: z
          .object({
            commits: z.object({
              nodes: z.array(
                z.object({
                  commit: z.object({
                    oid: z.string(),
                    statusCheckRollup: z
                      .object({
                        state: z.string().nullable(),
                        contexts: z
                          .object({
                            nodes: z.array(
                              z.discriminatedUnion('__typename', [
                                CheckRunSchema,
                                StatusContextSchema,
                              ]),
                            ),
                          })
                          .nullable(),
                      })
                      .nullable(),
                  }),
                }),
              ),
            }),
          })
          .nullable(),
      })
      .nullable(),
  });
  return {
    spec: {
      name: 'github_review_get_action_status',
      description:
        'Fetch the latest workflow and check status for the most recent pull request commit.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const client = createGithubGraphqlClient(ctx);
      const data = await client({
        query: `query PullRequestStatus($owner: String!, $name: String!, $number: Int!) {
          repository(owner: $owner, name: $name) {
            pullRequest(number: $number) {
              commits(last: 1) {
                nodes {
                  commit {
                    oid
                    statusCheckRollup {
                      state
                      contexts(last: 20) {
                        nodes {
                          __typename
                          ... on CheckRun {
                            name
                            status
                            conclusion
                            detailsUrl
                          }
                          ... on StatusContext {
                            context
                            state
                            targetUrl
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          owner: args.owner,
          name: args.repo,
          number: args.number,
        },
        schema: ResponseSchema,
      });
      const pr = data.repository?.pullRequest;
      if (!pr) {
        throw new Error(
          `[github.review] Pull request not found: ${args.owner}/${args.repo}#${args.number}`,
        );
      }
      const commit = pr.commits.nodes[0]?.commit;
      if (!commit) {
        return {
          latestCommit: null,
          status: null,
          contexts: [],
        } as const;
      }
      const rollup = commit.statusCheckRollup;
      const contextNodes = rollup?.contexts?.nodes ?? [];
      const contexts = contextNodes.map((node) => {
        if (node.__typename === 'CheckRun') {
          return {
            type: 'CheckRun' as const,
            name: node.name,
            status: node.status,
            conclusion: node.conclusion,
            url: node.detailsUrl ?? null,
          };
        }
        return {
          type: 'StatusContext' as const,
          name: node.context,
          status: node.state,
          conclusion: null,
          url: node.targetUrl ?? null,
        };
      });
      return {
        latestCommit: commit.oid,
        status: rollup?.state ?? null,
        contexts: contexts ?? [],
      } as const;
    },
  };
};

export const githubReviewCommit: ToolFactory = () => {
  const shape = {
    message: z.string(),
    paths: z.array(z.string()).optional(),
    all: z.boolean().default(false),
    allowEmpty: z.boolean().default(false),
    cwd: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  return {
    spec: {
      name: 'github_review_commit',
      description:
        'Create a git commit. Optionally stage specific paths or use --all/--allow-empty.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const cwd = ensureCwd(args.cwd);
      if (args.paths?.length) {
        await runGit(['add', ...args.paths], cwd);
      } else if (args.all) {
        await runGit(['add', '--all'], cwd);
      }
      const commitArgs = ['commit', '--message', args.message] as string[];
      if (args.allowEmpty) commitArgs.push('--allow-empty');
      const { stdout, stderr } = await runGit(commitArgs, cwd);
      return { committed: true as const, stdout, stderr };
    },
  };
};

export const githubReviewPush: ToolFactory = () => {
  const shape = {
    branch: z.string(),
    remote: z.string().default('origin'),
    cwd: z.string().optional(),
    setUpstream: z.boolean().default(false),
    forceWithLease: z.boolean().default(false),
  } as const;
  const Schema = z.object(shape);
  return {
    spec: {
      name: 'github_review_push',
      description:
        'Push the current branch to the specified remote with optional upstream/force settings.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const cwd = ensureCwd(args.cwd);
      const gitArgs = ['push'] as string[];
      if (args.setUpstream) gitArgs.push('--set-upstream');
      if (args.forceWithLease) gitArgs.push('--force-with-lease');
      gitArgs.push(args.remote, args.branch);
      const { stdout, stderr } = await runGit(gitArgs, cwd);
      return { pushed: true as const, stdout, stderr };
    },
  };
};

export const githubReviewCheckoutBranch: ToolFactory = () => {
  const shape = {
    branch: z.string(),
    cwd: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  return {
    spec: {
      name: 'github_review_checkout_branch',
      description: 'Check out an existing git branch.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const cwd = ensureCwd(args.cwd);
      const { stdout, stderr } = await runGit(['checkout', args.branch], cwd);
      return { checkedOut: args.branch, stdout, stderr };
    },
  };
};

export const githubReviewCreateBranch: ToolFactory = () => {
  const shape = {
    branch: z.string(),
    startPoint: z.string().optional(),
    cwd: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  return {
    spec: {
      name: 'github_review_create_branch',
      description: 'Create and check out a new git branch optionally from a specific start point.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const cwd = ensureCwd(args.cwd);
      const gitArgs = ['checkout', '-b', args.branch] as string[];
      if (args.startPoint) gitArgs.push(args.startPoint);
      const { stdout, stderr } = await runGit(gitArgs, cwd);
      return { branch: args.branch, stdout, stderr };
    },
  };
};

export const githubReviewRevertCommits: ToolFactory = () => {
  const shape = {
    commits: z.array(z.string()).min(1),
    noCommit: z.boolean().default(false),
    cwd: z.string().optional(),
  } as const;
  const Schema = z.object(shape);
  return {
    spec: {
      name: 'github_review_revert_commits',
      description: 'Revert one or more commits using git revert.',
      inputSchema: Schema.shape,
      stability: 'experimental',
      since: '0.1.0',
    } satisfies ToolSpec,
    invoke: async (raw: unknown) => {
      const args = Schema.parse(raw);
      const cwd = ensureCwd(args.cwd);
      const gitArgs = ['revert'] as string[];
      if (args.noCommit) gitArgs.push('--no-commit');
      gitArgs.push(...args.commits);
      const { stdout, stderr } = await runGit(gitArgs, cwd);
      return { reverted: args.commits, stdout, stderr };
    },
  };
};
