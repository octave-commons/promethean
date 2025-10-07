---
$$
uuid: 49a002af-c299-402a-b922-8308556c437b
$$
title: Description
status: todo
priority: P3
labels: []
$$
created_at: '2025-09-15T02:02:58.509Z'
$$
---
# Description

Enable agents to interact with Bluesky using the AT Protocol APIs and app-password authentication.

## Target APIs and Authentication

- **API**: [Bluesky AT Protocol](https://docs.bsky.app/docs/api) via `https://bsky.social/xrpc`
- **Authentication**: App password exchange for session token (JWT)

## Data Flow & Rate Limiting

- Agent authenticates ➜ session token ➜ Bluesky endpoint ➜ internal broker/storage
- Monitor `x-ratelimit-*` headers and throttle $~200 requests/minute$. Back off when `429` is returned.

## Requirements/Definition of done

- Authenticated session can publish and read posts
- Data flows into broker or storage services
- Rate limit handling prevents API throttling

## Tasks

- [ ] Create app password and configure credentials
- [ ] Implement session login and client wrappers
- [ ] Publish and fetch posts via internal queue
- [ ] Implement rate limit checks and exponential backoff
- [ ] Integration tests for posting and retrieval
- [ ] Unit tests for session refresh and error paths

## Dependencies

- AT Protocol client library
- Bluesky developer account

## Rough Scope

- Authenticate with Bluesky using AT Protocol
- Implement message retrieval and posting
- Map data into existing messaging schema

## Estimate

- Story points: 3

## Relevent resources

You might find [Bluesky API docs](https://docs.bsky.app/docs/api) useful while working on this task

## Comments

Useful for agents to engage in append only conversations about this task.

#Ready
#ready

