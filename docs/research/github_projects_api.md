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
The newer project boards use GraphQL. Key objects:
- `projectV2` – represents a board
- `addProjectV2ItemById` – add an issue or pull request to a board
- `updateProjectV2ItemFieldValue` – modify fields like status or assignee

Docs: <https://docs.github.com/en/graphql/overview/explorer>

## Authentication
Both APIs accept a personal access token (classic PAT or fine‑grained PAT) with `project` and `repo` scopes. For GitHub Actions, you can use the `GITHUB_TOKEN` secret, but a PAT is required for cross-repo access.

## Rate Limits
- REST: 5,000 requests per hour per authenticated user
- GraphQL: 5,000 points per hour (query cost varies)

## Recommendation
Start with the REST API for simplicity if using classic Projects. For Projects v2, plan on using GraphQL.

#tags: #research
