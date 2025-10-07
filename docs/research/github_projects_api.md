# Research: GitHub Projects Board API

This note summarizes the endpoints and references needed for synchronizing our local kanban board with a GitHub Projects board.

## REST API (Classic Projects)
- `POST /repos/{owner}/{repo}/projects` – create a project.
- `GET /repos/{owner}/{repo}/projects` – list projects.
- `POST /projects/{project_id}/columns` – create a column.
- `POST /projects/columns/{column_id}/cards` – create a card from an issue or note.
- `PATCH /projects/columns/cards/{card_id}` – update or move a card.

See the official docs: <https://docs.github.com/en/rest/projects>

## GraphQL API (Projects v2)
The newer project boards use GraphQL. Key objects and mutations:
- `projectV2` – represents a board
- `addProjectV2ItemById` – add an issue or pull request to a board
- `createProjectV2` – create a board
- `updateProjectV2ItemFieldValue` – modify fields like status or assignee
- `deleteProjectV2Item` – remove an item

Docs: <https://docs.github.com/en/graphql/overview/explorer>

## Authentication
Both APIs accept a personal access token (classic PAT or fine‑grained PAT) with `project` and `repo` scopes. For GitHub Actions, you can use the `GITHUB_TOKEN` secret, but a PAT is required for cross-repo access. REST calls pass the token via `Authorization: Bearer <token>` while GraphQL uses the same header against `https://api.github.com/graphql`.

## Rate Limits
- REST: 5,000 requests per hour per authenticated user
- GraphQL: 5,000 points per hour (query cost varies)

## curl examples

### REST
```bash
curl -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/octocat/Hello-World/projects
```
Unauthenticated calls return `401` requiring a token.

### GraphQL
```bash
curl -X POST https://api.github.com/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"query":"{viewer {login}}"}'
```
Without `Authorization` the API responds with a rate‑limit or auth error.

## Mapping Local Board to GitHub Projects
`docs/agile/boards/kanban.md` uses columns such as **Ice Box**, **Ready**, and **In Progress**. In classic Projects these map directly to project columns. In Projects v2 they correspond to options in the built‑in `Status` field. Each task file becomes a project item whose status reflects its column.

## Sync Approach
Our current tooling uses the local script `scripts/github_board_sync.py` invoked via `make board-sync` for manual updates. A GitHub Action $`.github/workflows/sync_board.yml`$ can run the same script on `main` to keep the board updated after merges.

## Recommendation
Start with the REST API for classic boards or GraphQL for Projects v2. Use the local script for development and the GitHub Action for continuous synchronization.
