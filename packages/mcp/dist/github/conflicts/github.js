const defaultHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
});
const isJsonObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const toPlainJson = (value) => JSON.parse(JSON.stringify(value));
const deepFreeze = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => deepFreeze(item));
    }
    if (isJsonObject(value)) {
        const frozenEntries = Object.entries(value).reduce((accumulator, [key, entry]) => ({
            ...accumulator,
            [key]: deepFreeze(entry),
        }), {});
        return Object.freeze(frozenEntries);
    }
    return value;
};
export const defaultDelay = (milliseconds) => new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
});
export class GitHubRequestError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = 'GitHubRequestError';
        this.status = status;
    }
}
export const createRestJsonClient = (token, fetchImpl) => async (url, init = {}) => {
    const response = await fetchImpl(url, {
        ...init,
        headers: {
            ...defaultHeaders(token),
            'Content-Type': 'application/json',
            ...(init.headers ?? {}),
        },
    });
    const raw = await response.text();
    const data = raw.trim().length === 0
        ? deepFreeze({})
        : deepFreeze(toPlainJson(JSON.parse(raw)));
    const message = typeof data.message === 'string' ? data.message : response.statusText;
    if (!response.ok) {
        throw new GitHubRequestError(message, response.status);
    }
    return toPlainJson(data);
};
export const createGraphQLClient = (token, fetchImpl) => async (query, variables = {}) => {
    const response = await fetchImpl('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            ...defaultHeaders(token),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });
    const rawPayload = await response.text();
    const payload = deepFreeze(toPlainJson(JSON.parse(rawPayload)));
    const errors = Array.isArray(payload.errors)
        ? payload.errors.filter((candidate) => isJsonObject(candidate))
        : [];
    const firstError = errors[0];
    const messageValue = firstError?.message;
    if (!response.ok) {
        throw new GitHubRequestError(typeof messageValue === 'string' ? messageValue : response.statusText, response.status);
    }
    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors));
    }
    const data = payload.data;
    if (!data) {
        throw new Error('GitHub response missing data');
    }
    return toPlainJson(data);
};
const pullRequestQuery = `
  query ($owner:String!, $name:String!, $number:Int!) {
    repository(owner:$owner, name:$name) {
      pullRequest(number:$number) {
        id
        number
        url
        headRefName
        headRefOid
        baseRefName
        mergeable
        mergeStateStatus
      }
    }
  }
`;
export const createPullRequestFetcher = (gqlClient) => async (coordinates) => {
    const data = await gqlClient(pullRequestQuery, {
        owner: coordinates.repo.owner,
        name: coordinates.repo.name,
        number: coordinates.number,
    });
    const pullRequest = data.repository?.pullRequest;
    if (!pullRequest) {
        throw new Error('Pull request not found');
    }
    return pullRequest;
};
export const pollPullRequestStatus = async (fetcher, coordinates, options = {}) => {
    const configuration = {
        waitForKnown: options.waitForKnown ?? true,
        attempts: options.attempts ?? 10,
        delayMs: options.delayMs ?? 1200,
        delay: options.delay ?? defaultDelay,
    };
    const iterate = async (attempt, current) => {
        if (!configuration.waitForKnown ||
            current.mergeable !== 'UNKNOWN' ||
            attempt >= configuration.attempts) {
            return current;
        }
        await configuration.delay(configuration.delayMs);
        const next = await fetcher(coordinates);
        return iterate(attempt + 1, next);
    };
    const initial = await fetcher(coordinates);
    return iterate(0, initial);
};
export const updatePullRequestBranch = (restClient) => async (coordinates, expectedHeadOid) => {
    const body = expectedHeadOid ? { expected_head_sha: expectedHeadOid } : {};
    const url = `https://api.github.com/repos/${coordinates.repo.owner}/${coordinates.repo.name}/pulls/${coordinates.number}/update-branch`;
    return restClient(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
};
export const enablePullRequestAutoMerge = (gqlClient) => async (pullRequestId, expectedHeadOid, method) => {
    await gqlClient(pullRequestEnableMutation, {
        pr: pullRequestId,
        method,
        expected: expectedHeadOid,
    });
};
const pullRequestEnableMutation = `
  mutation($pr:ID!, $method:PullRequestMergeMethod!, $expected:String!){
    enablePullRequestAutoMerge(input:{pullRequestId:$pr, mergeMethod:$method, expectedHeadOid:$expected}){
      clientMutationId
    }
  }
`;
export const enqueuePullRequest = (gqlClient) => async (pullRequestId) => gqlClient(pullRequestEnqueueMutation, { id: pullRequestId });
const pullRequestEnqueueMutation = `
  mutation($id:ID!){
    enqueuePullRequest(input:{pullRequestId:$id}){
      mergeQueueEntry{
        id
        position
      }
    }
  }
`;
//# sourceMappingURL=github.js.map