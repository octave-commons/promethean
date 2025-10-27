---
uuid: 85fab9fa-277e-4031-a937-11a1c28b46ab
created_at: '2025-09-26T14:36:44Z'
title: 2025.09.26.14.36.44
filename: GitHub Review Integration
description: >-
  This document describes the GitHub review endpoint catalog for integrating
  pull request changes with Codex. It specifies tools for GitHub API
  interactions and file system operations to manage code reviews effectively.
tags:
  - github
  - pull request
  - code review
  - codex
  - api
  - endpoint
  - integration
---
```json
{
  "transport": "http",
  "endpoints":{
    "github/mcp":{
      "tools": [
      "github.request",
      "github.graphql",
      "github.rate-limit"
      ]
    },
    "fs/mcp":{
      "tools":[
        "files.list-directory",
        "files.tree-directory",
        "files.view-file",
        "files.write-content",
        "files.write-lines",
        "files.search"
      ]
    }
  }
}
```

`github.review.requestChangesFromCodex` belongs in the GitHub review endpoint catalog.
It files an issue-level pull request comment that always tags `@codex`, ensuring the
agent sees every request for changes.
