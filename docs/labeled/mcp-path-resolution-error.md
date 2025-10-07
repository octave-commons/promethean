---
uuid: 6d3ad3c5-fb08-4fcf-a3d3-f1ccd68f168f
created_at: '2025-10-03T14:53:00Z'
title: 2025.10.03.14.53.00
filename: MCP Path Resolution Error
description: >-
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
related_to_uuid: []
related_to_title: []
references: []
---
npm error path /home/err/devel/promethean/packages/mcp/config/tritlo/lsp-mcp/package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/home/err/devel/promethean/packages/mcp/config/tritlo/lsp-mcp/package.json'
npm error enoent This is related to npm not being able to find a file.
npm error enoent
[proxy:ts-ls-lsp] [stderr] npm error A complete log of this run can be found in: /home/err/.npm/_logs/2025-10-03T19_50_27_380Z-debug-0.log
[proxy:ts-ls-lsp] stdio transport closed for ts-ls-lsp
[proxy:eslint] stdio transport error for eslint: SyntaxError: Unexpected token 'E', "ESLint MCP"... is not valid JSON
    at JSON.parse (<anonymous>)
    at deserializeMessage (/home/err/devel/promethean/node_modules/.pnpm/@modelcontextprotocol+sdk@1.17.5/node_modules/@modelcontextprotocol/sdk/src/shared/stdio.ts:34:42)
    at ReadBuffer.readMessage (/home/err/devel/promethean/node_modules/.pnpm/@modelcontextprotocol+sdk@1.17.5/node_modules/@modelcontextprotocol/sdk/src/shared/stdio.ts:25:12)
    at StdioClientTransport.processReadBuffer (/home/err/devel/promethean/node_modules/.pnpm/@modelcontextprotocol+sdk@1.17.5/node_modules/@modelcontextprotocol/sdk/src/client/stdio.ts:204:42)
    at Socket.<anonymous> (/home/err/devel/promethean/node_modules/.pnpm/@modelcontextprotocol+sdk@1.17.5/node_modules/@modelcontextprotocol/sdk/src/client/stdio.ts:164:14)
    at Socket.emit (node:events:518:28)
    at addChunk (node:internal/streams/readable:561:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
    at Readable.push (node:internal/streams/readable:392:5)
    at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
[proxy:eslint] [stderr] ESLint MCP started for workspace: /home/err/devel/promethean
Starting stdio server
[proxy:npm-helper] [stderr] [INFO] Initial memory usage: RSS=97MB, Heap=23MB

The command runs now, but it is resolving the wrong paths for these 2 mcp. It can't seem to find ESLint
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- _None_
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
