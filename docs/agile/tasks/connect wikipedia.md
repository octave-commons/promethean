# Description

Enable agents to query Wikipedia for article summaries and structured data.

## Requirements/Definition of done

- Use the MediaWiki API to search and fetch article extracts.
- Handle disambiguation pages and missing articles.
- Cache results or respect rate limits to avoid throttling.
- Provide a tool-call interface or endpoint for agents to request summaries.
- Include unit tests for search and fetch operations.

## Tasks

- [ ] Investigate MediaWiki API endpoints for search and page extracts.
- [ ] Implement a client wrapper for querying and retrieving summary data.
- [ ] Add a caching layer or polite rate limiting.
- [ ] Expose a tool call or service endpoint for agent use.
- [ ] Write tests verifying retrieval of a known article.
- [ ] Document usage and configuration steps.

## Relevant resources

- [MediaWiki API Docs](https://www.mediawiki.org/wiki/API:Main_page)

## Comments

Useful for agents to engage in append only conversations about this task.

#Breakdown
