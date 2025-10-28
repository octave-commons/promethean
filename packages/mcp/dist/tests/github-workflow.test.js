import test from 'ava';
import { strToU8, zipSync } from 'fflate';
import { githubWorkflowGetJobLogs, githubWorkflowGetRunLogs } from '../tools/github/workflows.js';
const buildResponse = (body) => new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/zip' },
});
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const runRunLogsTest = async ({ is, deepEqual }) => {
    const archive = zipSync({
        'logs/1_initialize.txt': strToU8('hello\nworld'),
    });
    const fetchStub = (async (input, init) => {
        const url = typeof input === 'string' ? input : String(input);
        is(url, 'https://api.github.test/repos/promethean/mcp/actions/runs/42/logs');
        const headers = (init?.headers ?? {});
        is(headers['Authorization'], 'Bearer secret');
        return buildResponse(archive).clone();
    });
    const tool = githubWorkflowGetRunLogs({
        env: {
            GITHUB_BASE_URL: 'https://api.github.test',
            GITHUB_API_VERSION: '2022-11-28',
            GITHUB_TOKEN: 'secret',
        },
        fetch: fetchStub,
        now: () => new Date(),
    });
    const result = (await tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        runId: 42,
    }));
    is(result.archiveSize, archive.byteLength);
    is(result.fileCount, 1);
    deepEqual(result.files, [
        {
            path: 'logs/1_initialize.txt',
            size: 11,
            lineCount: 2,
            content: 'hello\nworld',
        },
    ]);
};
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const runJobLogsTest = async ({ is, deepEqual }) => {
    const archive = zipSync({
        'logs/2_run-tests.txt': strToU8('ok\n'),
    });
    const fetchStub = (async (input) => {
        const url = typeof input === 'string' ? input : String(input);
        is(url, 'https://api.github.test/repos/promethean/mcp/actions/jobs/987654/logs');
        return buildResponse(archive).clone();
    });
    const tool = githubWorkflowGetJobLogs({
        env: {
            GITHUB_BASE_URL: 'https://api.github.test',
        },
        fetch: fetchStub,
        now: () => new Date(),
    });
    const result = (await tool.invoke({
        owner: 'promethean',
        repo: 'mcp',
        jobId: '987654',
    }));
    is(result.fileCount, 1);
    deepEqual(result.files, [
        {
            path: 'logs/2_run-tests.txt',
            size: 3,
            lineCount: 2,
            content: 'ok\n',
        },
    ]);
};
test('github_workflow_get_run_logs returns extracted run logs', runRunLogsTest);
test('github_workflow_get_job_logs returns extracted job logs', runJobLogsTest);
//# sourceMappingURL=github-workflow.test.js.map