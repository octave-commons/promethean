import test, { type ExecutionContext } from "ava";
import type { ReadonlyDeep } from "type-fest";
import { strToU8, zipSync } from "fflate";

import {
  githubWorkflowGetJobLogs,
  githubWorkflowGetRunLogs,
} from "../tools/github/workflows.js";

const buildResponse = (body: ReadonlyDeep<Uint8Array>): Response =>
  new Response(body, {
    status: 200,
    headers: { "content-type": "application/zip" },
  });

type WorkflowLogResult = Readonly<{
  readonly archiveSize: number;
  readonly archiveBase64: string;
  readonly fileCount: number;
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly size: number;
    readonly lineCount: number;
    readonly content: string;
  }>;
}>;

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const runRunLogsTest = async ({
  is,
  true: assertTrue,
  deepEqual,
}: ReadonlyDeep<ExecutionContext>) => {
  const archive = zipSync({
    "logs/1_initialize.txt": strToU8("hello\nworld"),
  });
  const fetchStub = (async (
    input: ReadonlyDeep<Parameters<typeof fetch>[0]>,
    init?: ReadonlyDeep<Parameters<typeof fetch>[1]>,
  ) => {
    const url = typeof input === "string" ? input : String(input);
    is(
      url,
      "https://api.github.test/repos/promethean/mcp/actions/runs/42/logs",
    );
    const headers = (init?.headers ?? {}) as Readonly<Record<string, string>>;
    is(headers["Authorization"], "Bearer secret");
    return buildResponse(archive).clone();
  }) satisfies typeof fetch;
  const tool = githubWorkflowGetRunLogs({
    env: {
      GITHUB_BASE_URL: "https://api.github.test",
      GITHUB_API_VERSION: "2022-11-28",
      GITHUB_TOKEN: "secret",
    },
    fetch: fetchStub,
    now: () => new Date(),
  });

  const result = (await tool.invoke({
    owner: "promethean",
    repo: "mcp",
    runId: 42,
  })) as WorkflowLogResult;
  is(result.archiveSize, archive.byteLength);
  assertTrue(result.archiveBase64.length > 0);
  is(result.fileCount, 1);
  deepEqual(result.files, [
    {
      path: "logs/1_initialize.txt",
      size: 11,
      lineCount: 2,
      content: "hello\nworld",
    },
  ]);
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const runJobLogsTest = async ({
  is,
  deepEqual,
}: ReadonlyDeep<ExecutionContext>) => {
  const archive = zipSync({
    "logs/2_run-tests.txt": strToU8("ok\n"),
  });
  const fetchStub = (async (
    input: ReadonlyDeep<Parameters<typeof fetch>[0]>,
  ) => {
    const url = typeof input === "string" ? input : String(input);
    is(
      url,
      "https://api.github.test/repos/promethean/mcp/actions/jobs/987654/logs",
    );
    return buildResponse(archive).clone();
  }) satisfies typeof fetch;
  const tool = githubWorkflowGetJobLogs({
    env: {
      GITHUB_BASE_URL: "https://api.github.test",
    },
    fetch: fetchStub,
    now: () => new Date(),
  });

  const result = (await tool.invoke({
    owner: "promethean",
    repo: "mcp",
    jobId: "987654",
  })) as {
    fileCount: number;
    files: ReadonlyArray<{ path: string; content: string }>;
  };

  is(result.fileCount, 1);
  deepEqual(result.files, [
    {
      path: "logs/2_run-tests.txt",
      size: 3,
      lineCount: 2,
      content: "ok\n",
    },
  ]);
};

test("github.workflow.getRunLogs returns extracted run logs", runRunLogsTest);
test("github.workflow.getJobLogs returns extracted job logs", runJobLogsTest);
