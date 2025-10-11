---
uuid: "6f391c98-8559-46e1-8899-c5503b247068"
title: "mcp-path-resolution-error"
slug: "mcp-path-resolution-error"
status: "incoming"
priority: "P3"
labels: ["docops", "labeled"]
created_at: "2025-10-11T01:03:32.221Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---


























## 🗂 Source

- Path: docs/labeled/mcp-path-resolution-error.md

## 📝 Context Summary

---

title: 2025.10.03.14.53.00
filename: MCP Path Resolution Error

  The npm command fails to locate the package.json file in the specified path,
  causing a 'ENOENT' error. This issue also triggers an ESLint MCP communication
  failure due to invalid JSON parsing, indicating misconfigured path resolution
  for the MCP services.
tags:
  - npm
  - ENOENT
  - path resolution
  - ESLint
  - MCP
  - package.json
  - error handling

references: []
---
npm error path /home/err/devel/promethean/packages/mcp/config/tritlo/lsp-mcp/package.json

npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/home/err/devel/promethean/packages/mcp/config/tritlo/lsp-mcp/package.json'
npm error enoent This is related to npm not being able to find a file.
npm error enoent
$proxy:ts-ls-lsp [stderr] npm error A complete log of this run can be found in: /home/err/.npm/_logs/2025-10-03T19_50_27_380Z-debug-0.log
$proxy:ts-ls-lsp stdio transport closed for ts-ls-lsp
[proxy:eslint] stdio transport error for eslint: SyntaxError: Unexpected token 'E', "ESLint MCP"... is not valid JSON
    at JSON.parse (<anonymous>)
    at deserializeMessage /home/err/devel/promethean/nod

## 📋 Tasks

- [ ] Draft actionable subtasks from the summary
- [ ] Define acceptance criteria
- [ ] Link back to related labeled docs

























