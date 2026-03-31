---
```
uuid: 485d1089-0ed2-461f-94e4-8e8a72a76e36
```
```
created_at: '2025-09-05T11:50:42Z'
```
filename: 'Docops Devlog: Streaming Fixes'
title: 'Docops Devlog: Streaming Fixes'
```
description: >-
```
  The docops system is experiencing frequent refresh failures due to large
  request sizes. To resolve this, the solution involves streaming backend
  results to the frontend instead of bulk requests. This approach ensures
  efficient handling by providing metadata first (file count, names, sizes)
  followed by incremental data delivery.
tags:
  - streaming
  - backend
  - frontend
  - metadata
  - pagination
  - request
  - timeout
```
related_to_uuid: []
```
```
related_to_title: []
```
references: []
---
# Docops devlog
Refresh status frequently fails, probably because the request is just too big.
it should be streamed.

All of the results from the backend need to be streamed to the frontend, because bulk rest, sse, or websocket requests/events/messages
are brittle and we have timeouts on everything.

The first message is for meta data:
How many files
their names
their size

we get that already in the file explorer

Then from there everything else is either streamed, requested one at a time, or paginated.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
