---
title: "feat: index links from discord images"
status: "open"
created: "8/3/2025, 1:25:39 AM"
url: "https://github.com/riatzukiza/promethean/pull/167"
opened_by: "riatzukiza"
assignees: []
requested_reviewers: []
updateMode: "append"
allowDelete: true
---

# feat: index links from discord images
## Summary
- add discord link collector service and associated MongoDB collection
- document link collector service and register in build config
- test link collector's URL extraction from messages with images

## Testing
- pipenv sync --dev
- make test-python-service-discordlinkcollector
- flake8 services/py/discordlinkcollector shared/py/mongodb.py
- make lint *(fails: services/py/tts/app.py:49:1: E303 too many blank lines (5))*
- make build *(fails: make: *** [Makefile.ts:39: build-ts] Error 1)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688efc3a5a948324b7fd23c04439ac07




---
### New status: "open"

# feat: index links from discord images
## Summary
- add discord link collector service and associated MongoDB collection
- document link collector service and register in build config
- test link collector's URL extraction from messages with images

## Testing
- pipenv sync --dev
- make test-python-service-discordlinkcollector
- flake8 services/py/discordlinkcollector shared/py/mongodb.py
- make lint *(fails: services/py/tts/app.py:49:1: E303 too many blank lines (5))*
- make build *(fails: make: *** [Makefile.ts:39: build-ts] Error 1)*

- - -- - -
https://chatgpt.com/codex/tasks/taske688efc3a5a948324b7fd23c04439ac07
