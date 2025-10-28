import test from 'ava';
import nock from 'nock';
import { createGraphQLClient, createPullRequestFetcher, createRestJsonClient, pollPullRequestStatus, updatePullRequestBranch, } from '../github/conflicts/github.js';
const coordinates = {
    repo: { owner: 'riatzukiza', name: 'promethean' },
    number: 42,
};
test.before(() => {
    nock.disableNetConnect();
});
test.after(() => {
    nock.enableNetConnect();
});
test.afterEach(() => {
    nock.cleanAll();
});
const createSequenceFetcher = (sequence) => {
    const iterator = sequence[Symbol.iterator]();
    const fallback = sequence.at(-1);
    if (!fallback) {
        throw new Error('sequence must contain at least one entry');
    }
    return async () => {
        const next = iterator.next();
        if (next.done) {
            return fallback;
        }
        return next.value ?? fallback;
    };
};
test('pollPullRequestStatus resolves UNKNOWN states', async (t) => {
    const statuses = [
        {
            id: 'pr1',
            number: 42,
            url: 'https://example.test/pr/42',
            headRefName: 'feature',
            headRefOid: 'abc',
            baseRefName: 'main',
            mergeable: 'UNKNOWN',
            mergeStateStatus: 'UNKNOWN',
        },
        {
            id: 'pr1',
            number: 42,
            url: 'https://example.test/pr/42',
            headRefName: 'feature',
            headRefOid: 'abc',
            baseRefName: 'main',
            mergeable: 'MERGEABLE',
            mergeStateStatus: 'CLEAN',
        },
    ];
    const fetcher = createSequenceFetcher(statuses);
    const result = await pollPullRequestStatus(fetcher, coordinates, {
        attempts: 5,
        delayMs: 0,
        delay: async () => undefined,
    });
    t.is(result.mergeable, 'MERGEABLE');
});
test('updatePullRequestBranch forwards expected head sha', async (t) => {
    const scope = nock('https://api.github.com', {
        reqheaders: {
            authorization: 'Bearer token',
            accept: 'application/vnd.github+json',
            'content-type': 'application/json',
        },
    })
        .put('/repos/riatzukiza/promethean/pulls/42/update-branch', {
        expected_head_sha: 'deadbeef',
    })
        .reply(200, { message: 'updated' });
    const restClient = createRestJsonClient('token', fetch);
    const update = updatePullRequestBranch(restClient);
    const response = await update(coordinates, 'deadbeef');
    t.deepEqual(response, { message: 'updated' });
    t.true(scope.isDone());
});
test('createPullRequestFetcher retrieves pull request metadata', async (t) => {
    const scope = nock('https://api.github.com', {
        reqheaders: {
            authorization: 'Bearer token',
            accept: 'application/vnd.github+json',
            'content-type': 'application/json',
        },
    })
        .post('/graphql', (body) => {
        t.deepEqual(body.variables, {
            owner: 'riatzukiza',
            name: 'promethean',
            number: 42,
        });
        return true;
    })
        .reply(200, {
        data: {
            repository: {
                pullRequest: {
                    id: 'pr1',
                    number: 42,
                    url: 'https://example.test/pr/42',
                    headRefName: 'feature',
                    headRefOid: 'abc',
                    baseRefName: 'main',
                    mergeable: 'MERGEABLE',
                    mergeStateStatus: 'CLEAN',
                },
            },
        },
    });
    const gqlClient = createGraphQLClient('token', fetch);
    const fetcher = createPullRequestFetcher(gqlClient);
    const status = await fetcher(coordinates);
    t.is(status.id, 'pr1');
    t.is(status.mergeable, 'MERGEABLE');
    t.true(scope.isDone());
});
//# sourceMappingURL=github-conflicts.test.js.map