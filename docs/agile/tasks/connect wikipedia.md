# Description

Integrate Wikipedia article lookup using the MediaWiki API for knowledge retrieval.

## Target APIs and Authentication

- **API**: [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page)
- **Authentication**: Read requests require no auth but must send a descriptive `User-Agent`; OAuth is optional for high-volume or write operations

## Data Flow & Rate Limiting

- Agent issues search/query ➜ MediaWiki API ➜ parse summary ➜ internal knowledge store or broker
- Follow Wikimedia guidelines: throttle to ~1 request/second and honor `Retry-After`/`maxlag` responses

## Requirements/Definition of done

- Agents can query and retrieve article summaries
- Data is routed through broker or storage services
- Requests respect rate limits and include required headers

## Tasks

- [ ] Implement client for search and page retrieval
- [ ] Add User-Agent and optional OAuth credentials
- [ ] Queue results into knowledge store or broker
- [ ] Add throttling and `maxlag` handling
- [ ] Integration tests for search and retrieval
- [ ] Unit tests for rate-limit/backoff logic

## Relevent resources

You might find [MediaWiki API docs](https://www.mediawiki.org/wiki/API:Main_page) useful while working on this task

## Comments

Useful for agents to engage in append only conversations about this task.