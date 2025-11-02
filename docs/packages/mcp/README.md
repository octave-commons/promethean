```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/mcp
```
**Folder:** `packages/mcp`
```
```
**Version:** `0.1.0`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/mcp"]
  D1["@promethean-os/discord"]
  D2["@promethean-os/kanban"]
  A --> D1["@promethean-os/discord"]
  A --> D2["@promethean-os/kanban"]
  click D1 "../discord/README.md" "@promethean-os/discord"
  click D2 "../kanban/README.md" "@promethean-os/kanban"
```
## Dependencies
- @promethean-os/discord$../discord/README.md
- @promethean-os/kanban$../kanban/README.md
## Dependents
- _None_

## Included modules
- `@promethean-os/mcp/github/conflicts` — GitHub merge assistance helpers and MCP server factory.
- `@promethean-os/mcp/ollama` — Task parsing and streaming execution helpers for Ollama MCP integrations.
```


## 📁 Implementation

### Core Files

- [261](../../../packages/mcp/src/261)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/mcp/src)
- [VS Code](vscode://file/packages/mcp/src)


## 📚 API Reference

### Interfaces

#### [- **auth/config.ts**](../../../packages/mcp/src/[src/auth/config.ts](../../../packages/mcp/src/auth/config.ts) (307 lines)#L1)

#### [- **auth/factory.ts**](../../../packages/mcp/src/[src/auth/factory.ts](../../../packages/mcp/src/auth/factory.ts) (357 lines)#L1)

#### [- **auth/fastify-integration.ts**](../../../packages/mcp/src/[src/auth/fastify-integration.ts](../../../packages/mcp/src/auth/fastify-integration.ts) (351 lines)#L1)

#### [- **auth/integration.ts**](../../../packages/mcp/src/[src/auth/integration.ts](../../../packages/mcp/src/auth/integration.ts) (531 lines)#L1)

#### [- **auth/mcp-auth-adapter.ts**](../../../packages/mcp/src/[src/auth/mcp-auth-adapter.ts](../../../packages/mcp/src/auth/mcp-auth-adapter.ts) (381 lines)#L1)

#### [- **auth/mcp-authorizer.ts**](../../../packages/mcp/src/[src/auth/mcp-authorizer.ts](../../../packages/mcp/src/auth/mcp-authorizer.ts) (637 lines)#L1)

#### [- **auth/middleware.ts**](../../../packages/mcp/src/[src/auth/middleware.ts](../../../packages/mcp/src/auth/middleware.ts) (633 lines)#L1)

#### [- **auth/oauth/index.ts**](../../../packages/mcp/src/[src/auth/oauth/index.ts](../../../packages/mcp/src/auth/oauth/index.ts) (473 lines)#L1)

#### [- **auth/oauth/jwt.ts**](../../../packages/mcp/src/[src/auth/oauth/jwt.ts](../../../packages/mcp/src/auth/oauth/jwt.ts) (326 lines)#L1)

#### [- **auth/oauth/providers/github.ts**](../../../packages/mcp/src/[src/auth/oauth/providers/github.ts](../../../packages/mcp/src/auth/oauth/providers/github.ts) (275 lines)#L1)

#### [- **auth/oauth/providers/google.ts**](../../../packages/mcp/src/[src/auth/oauth/providers/google.ts](../../../packages/mcp/src/auth/oauth/providers/google.ts) (280 lines)#L1)

#### [- **auth/oauth/routes.ts**](../../../packages/mcp/src/[src/auth/oauth/routes.ts](../../../packages/mcp/src/auth/oauth/routes.ts) (523 lines)#L1)

#### [- **auth/oauth/simple-routes.ts**](../../../packages/mcp/src/[src/auth/oauth/simple-routes.ts](../../../packages/mcp/src/auth/oauth/simple-routes.ts) (979 lines)#L1)

#### [- **auth/oauth/types.ts**](../../../packages/mcp/src/[src/auth/oauth/types.ts](../../../packages/mcp/src/auth/oauth/types.ts) (173 lines)#L1)

#### [- **auth/oauth-main.ts**](../../../packages/mcp/src/[src/auth/oauth-main.ts](../../../packages/mcp/src/auth/oauth-main.ts) (342 lines)#L1)

#### [- **auth/types.ts**](../../../packages/mcp/src/[src/auth/types.ts](../../../packages/mcp/src/auth/types.ts) (72 lines)#L1)

#### [- **auth/ui/oauth-login.ts**](../../../packages/mcp/src/[src/auth/ui/oauth-login.ts](../../../packages/mcp/src/auth/ui/oauth-login.ts) (461 lines)#L1)

#### [- **auth/users/models.ts**](../../../packages/mcp/src/[src/auth/users/models.ts](../../../packages/mcp/src/auth/users/models.ts) (180 lines)#L1)

#### [- **auth/users/registry.ts**](../../../packages/mcp/src/[src/auth/users/registry.ts](../../../packages/mcp/src/auth/users/registry.ts) (741 lines)#L1)

#### [- **bin/proxy.ts**](../../../packages/mcp/src/[src/bin/proxy.ts](../../../packages/mcp/src/bin/proxy.ts) (244 lines)#L1)

#### [- **config/auth-config.ts**](../../../packages/mcp/src/[src/config/auth-config.ts](../../../packages/mcp/src/config/auth-config.ts) (324 lines)#L1)

#### [- **config/load-config.ts**](../../../packages/mcp/src/[src/config/load-config.ts](../../../packages/mcp/src/config/load-config.ts) (223 lines)#L1)

#### [- **config/load-exec-config.ts**](../../../packages/mcp/src/[src/config/load-exec-config.ts](../../../packages/mcp/src/config/load-exec-config.ts) (91 lines)#L1)

#### [- **core/authentication.ts**](../../../packages/mcp/src/[src/core/authentication.ts](../../../packages/mcp/src/core/authentication.ts) (489 lines)#L1)

#### [- **core/authorization.ts**](../../../packages/mcp/src/[src/core/authorization.ts](../../../packages/mcp/src/core/authorization.ts) (766 lines)#L1)

#### [- **core/mcp-server.ts**](../../../packages/mcp/src/[src/core/mcp-server.ts](../../../packages/mcp/src/core/mcp-server.ts) (86 lines)#L1)

#### [- **core/openapi.ts**](../../../packages/mcp/src/[src/core/openapi.ts](../../../packages/mcp/src/core/openapi.ts) (315 lines)#L1)

#### [- **core/registry.ts**](../../../packages/mcp/src/[src/core/registry.ts](../../../packages/mcp/src/core/registry.ts) (25 lines)#L1)

#### [- **core/resolve-config.ts**](../../../packages/mcp/src/[src/core/resolve-config.ts](../../../packages/mcp/src/core/resolve-config.ts) (76 lines)#L1)

#### [- **core/security-middleware.ts**](../../../packages/mcp/src/[src/core/security-middleware.ts](../../../packages/mcp/src/core/security-middleware.ts) (689 lines)#L1)

#### [- **core/tool-ids.ts**](../../../packages/mcp/src/[src/core/tool-ids.ts](../../../packages/mcp/src/core/tool-ids.ts) (26 lines)#L1)

#### [- **core/transports/fastify.ts**](../../../packages/mcp/src/[src/core/transports/fastify.ts](../../../packages/mcp/src/core/transports/fastify.ts) (1986 lines)#L1)

#### [- **core/transports/session-id.ts**](../../../packages/mcp/src/[src/core/transports/session-id.ts](../../../packages/mcp/src/core/transports/session-id.ts) (50 lines)#L1)

#### [- **core/transports/stdio.ts**](../../../packages/mcp/src/[src/core/transports/stdio.ts](../../../packages/mcp/src/core/transports/stdio.ts) (12 lines)#L1)

#### [- **core/types.ts**](../../../packages/mcp/src/[src/core/types.ts](../../../packages/mcp/src/core/types.ts) (55 lines)#L1)

#### [- **files.ts**](../../../packages/mcp/src/[src/files.ts](../../../packages/mcp/src/files.ts) (345 lines)#L1)

#### [- **github/conflicts/github.ts**](../../../packages/mcp/src/[src/github/conflicts/github.ts](../../../packages/mcp/src/github/conflicts/github.ts) (332 lines)#L1)

#### [- **github/conflicts/index.ts**](../../../packages/mcp/src/[src/github/conflicts/index.ts](../../../packages/mcp/src/github/conflicts/index.ts) (3 lines)#L1)

#### [- **github/conflicts/server.ts**](../../../packages/mcp/src/[src/github/conflicts/server.ts](../../../packages/mcp/src/github/conflicts/server.ts) (186 lines)#L1)

#### [- **github/sandboxes/git.ts**](../../../packages/mcp/src/[src/github/sandboxes/git.ts](../../../packages/mcp/src/github/sandboxes/git.ts) (261 lines)#L1)

#### [- **github/sandboxes/index.ts**](../../../packages/mcp/src/[src/github/sandboxes/index.ts](../../../packages/mcp/src/github/sandboxes/index.ts) (13 lines)#L1)

#### [- **github/sandboxes/server.ts**](../../../packages/mcp/src/[src/github/sandboxes/server.ts](../../../packages/mcp/src/github/sandboxes/server.ts) (154 lines)#L1)

#### [- **http/ui-page.ts**](../../../packages/mcp/src/[src/http/ui-page.ts](../../../packages/mcp/src/http/ui-page.ts) (18 lines)#L1)

#### [- **index.ts**](../../../packages/mcp/src/[src/index.ts](../../../packages/mcp/src/index.ts) (533 lines)#L1)

#### [- **jsedn.d.ts**](../../../packages/mcp/src/[src/jsedn.d.ts](../../../packages/mcp/src/jsedn.d.ts) (6 lines)#L1)

#### [- **ollama/either.ts**](../../../packages/mcp/src/[src/ollama/either.ts](../../../packages/mcp/src/ollama/either.ts) (19 lines)#L1)

#### [- **ollama/index.ts**](../../../packages/mcp/src/[src/ollama/index.ts](../../../packages/mcp/src/ollama/index.ts) (21 lines)#L1)

#### [- **ollama/runner.ts**](../../../packages/mcp/src/[src/ollama/runner.ts](../../../packages/mcp/src/ollama/runner.ts) (671 lines)#L1)

#### [- **ollama/task.ts**](../../../packages/mcp/src/[src/ollama/task.ts](../../../packages/mcp/src/ollama/task.ts) (39 lines)#L1)

#### [- **proxy/config.ts**](../../../packages/mcp/src/[src/proxy/config.ts](../../../packages/mcp/src/proxy/config.ts) (203 lines)#L1)

#### [- **proxy/proxy-factory.ts**](../../../packages/mcp/src/[src/proxy/proxy-factory.ts](../../../packages/mcp/src/proxy/proxy-factory.ts) (63 lines)#L1)

#### [- **proxy/sdk-stdio-proxy.ts**](../../../packages/mcp/src/[src/proxy/sdk-stdio-proxy.ts](../../../packages/mcp/src/proxy/sdk-stdio-proxy.ts) (207 lines)#L1)

#### [- **proxy/stdio-proxy.ts**](../../../packages/mcp/src/[src/proxy/stdio-proxy.ts](../../../packages/mcp/src/proxy/stdio-proxy.ts) (315 lines)#L1)

#### [- **security/index.ts**](../../../packages/mcp/src/[src/security/index.ts](../../../packages/mcp/src/security/index.ts) (14 lines)#L1)

#### [- **security/middleware.ts**](../../../packages/mcp/src/[src/security/middleware.ts](../../../packages/mcp/src/security/middleware.ts) (998 lines)#L1)

#### [- **test/authorization-simple.test.ts**](../../../packages/mcp/src/[src/test/authorization-simple.test.ts](../../../packages/mcp/src/test/authorization-simple.test.ts) (209 lines)#L1)

#### [- **test/authorization.test.ts**](../../../packages/mcp/src/[src/test/authorization.test.ts](../../../packages/mcp/src/test/authorization.test.ts) (693 lines)#L1)

#### [- **tests/apply-patch.test.ts**](../../../packages/mcp/src/[src/tests/apply-patch.test.ts](../../../packages/mcp/src/tests/apply-patch.test.ts) (222 lines)#L1)

#### [- **tests/basic-test.ts**](../../../packages/mcp/src/[src/tests/basic-test.ts](../../../packages/mcp/src/tests/basic-test.ts) (18 lines)#L1)

#### [- **tests/chatgpt-simulation-negative.test.ts**](../../../packages/mcp/src/[src/tests/chatgpt-simulation-negative.test.ts](../../../packages/mcp/src/tests/chatgpt-simulation-negative.test.ts) (190 lines)#L1)

#### [- **tests/comprehensive-security.test.ts**](../../../packages/mcp/src/[src/tests/comprehensive-security.test.ts](../../../packages/mcp/src/tests/comprehensive-security.test.ts) (652 lines)#L1)

#### [- **tests/config-write.test.ts**](../../../packages/mcp/src/[src/tests/config-write.test.ts](../../../packages/mcp/src/tests/config-write.test.ts) (90 lines)#L1)

#### [- **tests/config.test.ts**](../../../packages/mcp/src/[src/tests/config.test.ts](../../../packages/mcp/src/tests/config.test.ts) (135 lines)#L1)

#### [- **tests/debug-filtering-unit.test.ts**](../../../packages/mcp/src/[src/tests/debug-filtering-unit.test.ts](../../../packages/mcp/src/tests/debug-filtering-unit.test.ts) (182 lines)#L1)

#### [- **tests/debug-test.ts**](../../../packages/mcp/src/[src/tests/debug-test.ts](../../../packages/mcp/src/tests/debug-test.ts) (20 lines)#L1)

#### [- **tests/discord-security-simple.test.ts**](../../../packages/mcp/src/[src/tests/discord-security-simple.test.ts](../../../packages/mcp/src/tests/discord-security-simple.test.ts) (298 lines)#L1)

#### [- **tests/discord-tools.test.ts**](../../../packages/mcp/src/[src/tests/discord-tools.test.ts](../../../packages/mcp/src/tests/discord-tools.test.ts) (177 lines)#L1)

#### [- **tests/exec.test.ts**](../../../packages/mcp/src/[src/tests/exec.test.ts](../../../packages/mcp/src/tests/exec.test.ts) (142 lines)#L1)

#### [- **tests/fastify-proxy-negative.test.ts**](../../../packages/mcp/src/[src/tests/fastify-proxy-negative.test.ts](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts) (516 lines)#L1)

#### [- **tests/fastify-proxy-registry-integration.test.ts**](../../../packages/mcp/src/[src/tests/fastify-proxy-registry-integration.test.ts](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts) (578 lines)#L1)

#### [- **tests/fastify-transport.integration.test.ts**](../../../packages/mcp/src/[src/tests/fastify-transport.integration.test.ts](../../../packages/mcp/src/tests/fastify-transport.integration.test.ts) (509 lines)#L1)

#### [- **tests/fastify.test.ts**](../../../packages/mcp/src/[src/tests/fastify.test.ts](../../../packages/mcp/src/tests/fastify.test.ts) (37 lines)#L1)

#### [- **tests/files-security-simple.test.ts**](../../../packages/mcp/src/[src/tests/files-security-simple.test.ts](../../../packages/mcp/src/tests/files-security-simple.test.ts) (64 lines)#L1)

#### [- **tests/files-security.test.ts**](../../../packages/mcp/src/[src/tests/files-security.test.ts](../../../packages/mcp/src/tests/files-security.test.ts) (242 lines)#L1)

#### [- **tests/files-tools-edgecases.test.ts**](../../../packages/mcp/src/[src/tests/files-tools-edgecases.test.ts](../../../packages/mcp/src/tests/files-tools-edgecases.test.ts) (379 lines)#L1)

#### [- **tests/files-tools-integration.test.ts**](../../../packages/mcp/src/[src/tests/files-tools-integration.test.ts](../../../packages/mcp/src/tests/files-tools-integration.test.ts) (550 lines)#L1)

#### [- **tests/files-tools.test.ts**](../../../packages/mcp/src/[src/tests/files-tools.test.ts](../../../packages/mcp/src/tests/files-tools.test.ts) (549 lines)#L1)

#### [- **tests/files.test.ts**](../../../packages/mcp/src/[src/tests/files.test.ts](../../../packages/mcp/src/tests/files.test.ts) (16 lines)#L1)

#### [- **tests/git-tools.test.ts**](../../../packages/mcp/src/[src/tests/git-tools.test.ts](../../../packages/mcp/src/tests/git-tools.test.ts) (148 lines)#L1)

#### [- **tests/github-conflicts.test.ts**](../../../packages/mcp/src/[src/tests/github-conflicts.test.ts](../../../packages/mcp/src/tests/github-conflicts.test.ts) (147 lines)#L1)

#### [- **tests/github-contents.test.ts**](../../../packages/mcp/src/[src/tests/github-contents.test.ts](../../../packages/mcp/src/tests/github-contents.test.ts) (224 lines)#L1)

#### [- **tests/github-pr-tools.test.ts**](../../../packages/mcp/src/[src/tests/github-pr-tools.test.ts](../../../packages/mcp/src/tests/github-pr-tools.test.ts) (248 lines)#L1)

#### [- **tests/github-request.test.ts**](../../../packages/mcp/src/[src/tests/github-request.test.ts](../../../packages/mcp/src/tests/github-request.test.ts) (55 lines)#L1)

#### [- **tests/github-review.test.ts**](../../../packages/mcp/src/[src/tests/github-review.test.ts](../../../packages/mcp/src/tests/github-review.test.ts) (147 lines)#L1)

#### [- **tests/github-workflow.test.ts**](../../../packages/mcp/src/[src/tests/github-workflow.test.ts](../../../packages/mcp/src/tests/github-workflow.test.ts) (106 lines)#L1)

#### [- **tests/http-config.test.ts**](../../../packages/mcp/src/[src/tests/http-config.test.ts](../../../packages/mcp/src/tests/http-config.test.ts) (90 lines)#L1)

#### [- **tests/mcp-endpoint-integration.test.ts**](../../../packages/mcp/src/[src/tests/mcp-endpoint-integration.test.ts](../../../packages/mcp/src/tests/mcp-endpoint-integration.test.ts) (557 lines)#L1)

#### [- **tests/mcp-endpoint-simple.test.ts**](../../../packages/mcp/src/[src/tests/mcp-endpoint-simple.test.ts](../../../packages/mcp/src/tests/mcp-endpoint-simple.test.ts) (162 lines)#L1)

#### [- **tests/mcp-server-integration.test.ts**](../../../packages/mcp/src/[src/tests/mcp-server-integration.test.ts](../../../packages/mcp/src/tests/mcp-server-integration.test.ts) (401 lines)#L1)

#### [- **tests/mcp-server.test.ts**](../../../packages/mcp/src/[src/tests/mcp-server.test.ts](../../../packages/mcp/src/tests/mcp-server.test.ts) (159 lines)#L1)

#### [- **tests/nx.test.ts**](../../../packages/mcp/src/[src/tests/nx.test.ts](../../../packages/mcp/src/tests/nx.test.ts) (94 lines)#L1)

#### [- **tests/oauth-fastify-integration.test.ts**](../../../packages/mcp/src/[src/tests/oauth-fastify-integration.test.ts](../../../packages/mcp/src/tests/oauth-fastify-integration.test.ts) (151 lines)#L1)

#### [- **tests/oauth-integration.test.ts**](../../../packages/mcp/src/[src/tests/oauth-integration.test.ts](../../../packages/mcp/src/tests/oauth-integration.test.ts) (340 lines)#L1)

#### [- **tests/oauth-security.test.ts**](../../../packages/mcp/src/[src/tests/oauth-security.test.ts](../../../packages/mcp/src/tests/oauth-security.test.ts) (326 lines)#L1)

#### [- **tests/ollama-parse-task.test.ts**](../../../packages/mcp/src/[src/tests/ollama-parse-task.test.ts](../../../packages/mcp/src/tests/ollama-parse-task.test.ts) (29 lines)#L1)

#### [- **tests/ollama-run-task.test.ts**](../../../packages/mcp/src/[src/tests/ollama-run-task.test.ts](../../../packages/mcp/src/tests/ollama-run-task.test.ts) (293 lines)#L1)

#### [- **tests/openapi.test.ts**](../../../packages/mcp/src/[src/tests/openapi.test.ts](../../../packages/mcp/src/tests/openapi.test.ts) (115 lines)#L1)

#### [- **tests/pnpm.test.ts**](../../../packages/mcp/src/[src/tests/pnpm.test.ts](../../../packages/mcp/src/tests/pnpm.test.ts) (115 lines)#L1)

#### [- **tests/proxy-comparison.test.ts**](../../../packages/mcp/src/[src/tests/proxy-comparison.test.ts](../../../packages/mcp/src/tests/proxy-comparison.test.ts) (168 lines)#L1)

#### [- **tests/proxy-config.test.ts**](../../../packages/mcp/src/[src/tests/proxy-config.test.ts](../../../packages/mcp/src/tests/proxy-config.test.ts) (59 lines)#L1)

#### [- **tests/sandboxes.test.ts**](../../../packages/mcp/src/[src/tests/sandboxes.test.ts](../../../packages/mcp/src/tests/sandboxes.test.ts) (113 lines)#L1)

#### [- **tests/security.test.ts**](../../../packages/mcp/src/[src/tests/security.test.ts](../../../packages/mcp/src/tests/security.test.ts) (244 lines)#L1)

#### [- **tests/serena-sdk-proxy.test.ts**](../../../packages/mcp/src/[src/tests/serena-sdk-proxy.test.ts](../../../packages/mcp/src/tests/serena-sdk-proxy.test.ts) (85 lines)#L1)

#### [- **tests/stdio-proxy-timing-negative.test.ts**](../../../packages/mcp/src/[src/tests/stdio-proxy-timing-negative.test.ts](../../../packages/mcp/src/tests/stdio-proxy-timing-negative.test.ts) (194 lines)#L1)

#### [- **tests/stdio-proxy.test.ts**](../../../packages/mcp/src/[src/tests/stdio-proxy.test.ts](../../../packages/mcp/src/tests/stdio-proxy.test.ts) (75 lines)#L1)

#### [- **tests/validate-config.test.ts**](../../../packages/mcp/src/[src/tests/validate-config.test.ts](../../../packages/mcp/src/tests/validate-config.test.ts) (180 lines)#L1)

#### [- **tests/validation-integration.test.ts**](../../../packages/mcp/src/[src/tests/validation-integration.test.ts](../../../packages/mcp/src/tests/validation-integration.test.ts) (189 lines)#L1)

#### [- **tools/apply-patch.ts**](../../../packages/mcp/src/[src/tools/apply-patch.ts](../../../packages/mcp/src/tools/apply-patch.ts) (200 lines)#L1)

#### [- **tools/discord.ts**](../../../packages/mcp/src/[src/tools/discord.ts](../../../packages/mcp/src/tools/discord.ts) (201 lines)#L1)

#### [- **tools/exec.ts**](../../../packages/mcp/src/[src/tools/exec.ts](../../../packages/mcp/src/tools/exec.ts) (303 lines)#L1)

#### [- **tools/files-tools.ts**](../../../packages/mcp/src/[src/tools/files-tools.ts](../../../packages/mcp/src/tools/files-tools.ts) (170 lines)#L1)

#### [- **tools/github/apply-patch.ts**](../../../packages/mcp/src/[src/tools/github/apply-patch.ts](../../../packages/mcp/src/tools/github/apply-patch.ts) (494 lines)#L1)

#### [- **tools/github/base64.ts**](../../../packages/mcp/src/[src/tools/github/base64.ts](../../../packages/mcp/src/tools/github/base64.ts) (86 lines)#L1)

#### [- **tools/github/code-review.ts**](../../../packages/mcp/src/[src/tools/github/code-review.ts](../../../packages/mcp/src/tools/github/code-review.ts) (944 lines)#L1)

#### [- **tools/github/contents.ts**](../../../packages/mcp/src/[src/tools/github/contents.ts](../../../packages/mcp/src/tools/github/contents.ts) (155 lines)#L1)

#### [- **tools/github/graphql.ts**](../../../packages/mcp/src/[src/tools/github/graphql.ts](../../../packages/mcp/src/tools/github/graphql.ts) (41 lines)#L1)

#### [- **tools/github/position-resolver.ts**](../../../packages/mcp/src/[src/tools/github/position-resolver.ts](../../../packages/mcp/src/tools/github/position-resolver.ts) (302 lines)#L1)

#### [- **tools/github/pull-request-api.ts**](../../../packages/mcp/src/[src/tools/github/pull-request-api.ts](../../../packages/mcp/src/tools/github/pull-request-api.ts) (212 lines)#L1)

#### [- **tools/github/pull-request-data.ts**](../../../packages/mcp/src/[src/tools/github/pull-request-data.ts](../../../packages/mcp/src/tools/github/pull-request-data.ts) (157 lines)#L1)

#### [- **tools/github/pull-request-review.ts**](../../../packages/mcp/src/[src/tools/github/pull-request-review.ts](../../../packages/mcp/src/tools/github/pull-request-review.ts) (298 lines)#L1)

#### [- **tools/github/rate-limit.ts**](../../../packages/mcp/src/[src/tools/github/rate-limit.ts](../../../packages/mcp/src/tools/github/rate-limit.ts) (25 lines)#L1)

#### [- **tools/github/request.ts**](../../../packages/mcp/src/[src/tools/github/request.ts](../../../packages/mcp/src/tools/github/request.ts) (238 lines)#L1)

#### [- **tools/github/workflows.ts**](../../../packages/mcp/src/[src/tools/github/workflows.ts](../../../packages/mcp/src/tools/github/workflows.ts) (166 lines)#L1)

#### [- **tools/help.ts**](../../../packages/mcp/src/[src/tools/help.ts](../../../packages/mcp/src/tools/help.ts) (106 lines)#L1)

#### [- **tools/nx.ts**](../../../packages/mcp/src/[src/tools/nx.ts](../../../packages/mcp/src/tools/nx.ts) (213 lines)#L1)

#### [- **tools/ollama.ts**](../../../packages/mcp/src/[src/tools/ollama.ts](../../../packages/mcp/src/tools/ollama.ts) (386 lines)#L1)

#### [- **tools/pnpm.ts**](../../../packages/mcp/src/[src/tools/pnpm.ts](../../../packages/mcp/src/tools/pnpm.ts) (301 lines)#L1)

#### [- **tools/process-manager.ts**](../../../packages/mcp/src/[src/tools/process-manager.ts](../../../packages/mcp/src/tools/process-manager.ts) (741 lines)#L1)

#### [- **tools/sandboxes.ts**](../../../packages/mcp/src/[src/tools/sandboxes.ts](../../../packages/mcp/src/tools/sandboxes.ts) (89 lines)#L1)

#### [- **tools/search.ts**](../../../packages/mcp/src/[src/tools/search.ts](../../../packages/mcp/src/tools/search.ts) (164 lines)#L1)

#### [- **tools/tdd.ts**](../../../packages/mcp/src/[src/tools/tdd.ts](../../../packages/mcp/src/tools/tdd.ts) (345 lines)#L1)

#### [- **tools/validate-config.ts**](../../../packages/mcp/src/[src/tools/validate-config.ts](../../../packages/mcp/src/tools/validate-config.ts) (277 lines)#L1)

#### [- **validation/comprehensive.ts**](../../../packages/mcp/src/[src/validation/comprehensive.ts](../../../packages/mcp/src/validation/comprehensive.ts) (978 lines)#L1)

#### [- **validation/index.ts**](../../../packages/mcp/src/[src/validation/index.ts](../../../packages/mcp/src/validation/index.ts) (35 lines)#L1)

#### [- **AuthenticationFactory**](../../../packages/mcp/src/[AuthenticationFactory](../../../packages/mcp/src/auth/factory.ts#L39)

#### [- **OAuthFastifyIntegration**](../../../packages/mcp/src/[OAuthFastifyIntegration](../../../packages/mcp/src/auth/fastify-integration.ts#L32)

#### [- **OAuthIntegration**](../../../packages/mcp/src/[OAuthIntegration](../../../packages/mcp/src/auth/integration.ts#L42)

#### [- **wraps**](../../../packages/mcp/src/[wraps](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L27)

#### [- **McpAuthFastifyAdapter**](../../../packages/mcp/src/[McpAuthFastifyAdapter](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L30)

#### [- **loadOAuthConfig()**](../../../packages/mcp/src/[loadOAuthConfig()](../../../packages/mcp/src/auth/config.ts#L36)

#### [- **validateOAuthConfig()**](../../../packages/mcp/src/[validateOAuthConfig()](../../../packages/mcp/src/auth/config.ts#L176)

#### [- **getOAuthConfigSummary()**](../../../packages/mcp/src/[getOAuthConfigSummary()](../../../packages/mcp/src/auth/config.ts#L279)

#### [- **createOAuthFastifyIntegration()**](../../../packages/mcp/src/[createOAuthFastifyIntegration()](../../../packages/mcp/src/auth/fastify-integration.ts#L333)

#### [- **registerOAuthWithFastify()**](../../../packages/mcp/src/[registerOAuthWithFastify()](../../../packages/mcp/src/auth/fastify-integration.ts#L342)

#### [- **GitHub**](../../../packages/mcp/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/mcp/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/mcp/src/[AuthenticationFactory](../../../packages/mcp/src/auth/factory.ts#L39)

#### [**Description**](../../../packages/mcp/src/Main class for authenticationfactory functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthFastifyIntegration](../../../packages/mcp/src/auth/fastify-integration.ts#L32)

#### [**Description**](../../../packages/mcp/src/Main class for oauthfastifyintegration functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/fastify-integration.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthIntegration](../../../packages/mcp/src/auth/integration.ts#L42)

#### [**Description**](../../../packages/mcp/src/Main class for oauthintegration functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/integration.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[wraps](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L27)

#### [**Description**](../../../packages/mcp/src/Main class for wraps functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-auth-adapter.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[McpAuthFastifyAdapter](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L30)

#### [**Description**](../../../packages/mcp/src/Main class for mcpauthfastifyadapter functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-auth-adapter.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[McpAuthorizer](../../../packages/mcp/src/auth/mcp-authorizer.ts#L75)

#### [**Description**](../../../packages/mcp/src/Main class for mcpauthorizer functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-authorizer.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[McpAuthMiddleware](../../../packages/mcp/src/auth/middleware.ts#L64)

#### [**Description**](../../../packages/mcp/src/Main class for mcpauthmiddleware functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthSystem](../../../packages/mcp/src/auth/oauth/index.ts#L27)

#### [**Description**](../../../packages/mcp/src/Main class for oauthsystem functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/index.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[JwtTokenManager](../../../packages/mcp/src/auth/oauth/jwt.ts#L54)

#### [**Description**](../../../packages/mcp/src/Main class for jwttokenmanager functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/jwt.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GitHubOAuthProvider](../../../packages/mcp/src/auth/oauth/providers/github.ts#L24)

#### [**Description**](../../../packages/mcp/src/Main class for githuboauthprovider functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/providers/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GoogleOAuthProvider](../../../packages/mcp/src/auth/oauth/providers/google.ts#L25)

#### [**Description**](../../../packages/mcp/src/Main class for googleoauthprovider functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/providers/google.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthSystemManager](../../../packages/mcp/src/auth/oauth-main.ts#L28)

#### [**Description**](../../../packages/mcp/src/Main class for oauthsystemmanager functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth-main.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthSystemFactory](../../../packages/mcp/src/auth/oauth-main.ts#L190)

#### [**Description**](../../../packages/mcp/src/Main class for oauthsystemfactory functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth-main.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthLoginComponent](../../../packages/mcp/src/auth/ui/oauth-login.ts#L44)

#### [**Description**](../../../packages/mcp/src/Main class for oauthlogincomponent functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[UserRegistry](../../../packages/mcp/src/auth/users/registry.ts#L33)

#### [**Description**](../../../packages/mcp/src/Main class for userregistry functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/users/registry.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[RateLimiter](../../../packages/mcp/src/core/authentication.ts#L73)

#### [**Description**](../../../packages/mcp/src/Main class for ratelimiter functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuthenticationManager](../../../packages/mcp/src/core/authentication.ts#L132)

#### [**Description**](../../../packages/mcp/src/Main class for authenticationmanager functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuditLogger](../../../packages/mcp/src/core/authorization.ts#L384)

#### [**Description**](../../../packages/mcp/src/Main class for auditlogger functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityMiddleware](../../../packages/mcp/src/core/security-middleware.ts#L96)

#### [**Description**](../../../packages/mcp/src/Main class for securitymiddleware functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GitHubRequestError](../../../packages/mcp/src/github/conflicts/github.ts#L100)

#### [**Description**](../../../packages/mcp/src/Main class for githubrequesterror functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GitCommandError](../../../packages/mcp/src/github/sandboxes/git.ts#L14)

#### [**Description**](../../../packages/mcp/src/Main class for gitcommanderror functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/sandboxes/git.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SdkStdioProxy](../../../packages/mcp/src/proxy/sdk-stdio-proxy.ts#L14)

#### [**Description**](../../../packages/mcp/src/Main class for sdkstdioproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/sdk-stdio-proxy.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[StdioHttpProxy](../../../packages/mcp/src/proxy/stdio-proxy.ts#L135)

#### [**Description**](../../../packages/mcp/src/Main class for stdiohttpproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/stdio-proxy.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[RateLimitStore](../../../packages/mcp/src/security/middleware.ts#L107)

#### [**Description**](../../../packages/mcp/src/Main class for ratelimitstore functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[BlockedIpStore](../../../packages/mcp/src/security/middleware.ts#L197)

#### [**Description**](../../../packages/mcp/src/Main class for blockedipstore functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[McpSecurityMiddleware](../../../packages/mcp/src/security/middleware.ts#L244)

#### [**Description**](../../../packages/mcp/src/Main class for mcpsecuritymiddleware functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L37)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L97)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L157)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L219)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L289)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L371)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[MockStreamableHTTPServerTransport](../../../packages/mcp/src/tests/fastify-proxy-negative.test.ts#L457)

#### [**Description**](../../../packages/mcp/src/Main class for mockstreamablehttpservertransport functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-negative.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[MockStreamableHTTPServerTransport](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L44)

#### [**Description**](../../../packages/mcp/src/Main class for mockstreamablehttpservertransport functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L59)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FastProxy](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L165)

#### [**Description**](../../../packages/mcp/src/Main class for fastproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[MockRegistry](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L243)

#### [**Description**](../../../packages/mcp/src/Main class for mockregistry functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FastProxy](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L248)

#### [**Description**](../../../packages/mcp/src/Main class for fastproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[StrictProxy](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L361)

#### [**Description**](../../../packages/mcp/src/Main class for strictproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[EchoProxy](../../../packages/mcp/src/tests/fastify-proxy-registry-integration.test.ts#L446)

#### [**Description**](../../../packages/mcp/src/Main class for echoproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-proxy-registry-integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeStreamableHTTPServerTransport](../../../packages/mcp/src/tests/fastify-transport.integration.test.ts#L46)

#### [**Description**](../../../packages/mcp/src/Main class for fakestreamablehttpservertransport functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-transport.integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeStdioClientTransport](../../../packages/mcp/src/tests/fastify-transport.integration.test.ts#L70)

#### [**Description**](../../../packages/mcp/src/Main class for fakestdioclienttransport functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-transport.integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeProxy](../../../packages/mcp/src/tests/fastify-transport.integration.test.ts#L376)

#### [**Description**](../../../packages/mcp/src/Main class for fakeproxy functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/fastify-transport.integration.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeMcpServer](../../../packages/mcp/src/tests/mcp-server.test.ts#L11)

#### [**Description**](../../../packages/mcp/src/Main class for fakemcpserver functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/mcp-server.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeMcpServer](../../../packages/mcp/src/tests/mcp-server.test.ts#L51)

#### [**Description**](../../../packages/mcp/src/Main class for fakemcpserver functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/mcp-server.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeMcpServer](../../../packages/mcp/src/tests/mcp-server.test.ts#L85)

#### [**Description**](../../../packages/mcp/src/Main class for fakemcpserver functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/mcp-server.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[FakeMcpServer](../../../packages/mcp/src/tests/mcp-server.test.ts#L125)

#### [**Description**](../../../packages/mcp/src/Main class for fakemcpserver functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tests/mcp-server.test.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GitApplyError](../../../packages/mcp/src/tools/apply-patch.ts#L29)

#### [**Description**](../../../packages/mcp/src/Main class for gitapplyerror functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/apply-patch.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[GitApplyError](../../../packages/mcp/src/tools/github/apply-patch.ts#L28)

#### [**Description**](../../../packages/mcp/src/Main class for gitapplyerror functionality.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/apply-patch.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadOAuthConfig()](../../../packages/mcp/src/auth/config.ts#L36)

#### [**Description**](../../../packages/mcp/src/Key function for loadoauthconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateOAuthConfig()](../../../packages/mcp/src/auth/config.ts#L176)

#### [**Description**](../../../packages/mcp/src/Key function for validateoauthconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getOAuthConfigSummary()](../../../packages/mcp/src/auth/config.ts#L279)

#### [**Description**](../../../packages/mcp/src/Key function for getoauthconfigsummary operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createOAuthFastifyIntegration()](../../../packages/mcp/src/auth/fastify-integration.ts#L333)

#### [**Description**](../../../packages/mcp/src/Key function for createoauthfastifyintegration operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/fastify-integration.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[registerOAuthWithFastify()](../../../packages/mcp/src/auth/fastify-integration.ts#L342)

#### [**Description**](../../../packages/mcp/src/Key function for registeroauthwithfastify operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/fastify-integration.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createMcpAuthFastifyAdapter()](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L362)

#### [**Description**](../../../packages/mcp/src/Key function for createmcpauthfastifyadapter operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-auth-adapter.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[initializeMcpAuthWithFastify()](../../../packages/mcp/src/auth/mcp-auth-adapter.ts#L369)

#### [**Description**](../../../packages/mcp/src/Key function for initializemcpauthwithfastify operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-auth-adapter.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createMcpAuthorizer()](../../../packages/mcp/src/auth/mcp-authorizer.ts#L585)

#### [**Description**](../../../packages/mcp/src/Key function for createmcpauthorizer operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-authorizer.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[MCP_RESOURCE_REQUIREMENTS()](../../../packages/mcp/src/auth/mcp-authorizer.ts#L592)

#### [**Description**](../../../packages/mcp/src/Key function for mcp_resource_requirements operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/mcp-authorizer.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createAuthMiddleware()](../../../packages/mcp/src/auth/middleware.ts#L626)

#### [**Description**](../../../packages/mcp/src/Key function for createauthmiddleware operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[registerOAuthRoutes()](../../../packages/mcp/src/auth/oauth/routes.ts#L67)

#### [**Description**](../../../packages/mcp/src/Key function for registeroauthroutes operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/routes.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[registerSimpleOAuthRoutes()](../../../packages/mcp/src/auth/oauth/simple-routes.ts#L51)

#### [**Description**](../../../packages/mcp/src/Key function for registersimpleoauthroutes operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth/simple-routes.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[initializeOAuthSystem()](../../../packages/mcp/src/auth/oauth-main.ts#L153)

#### [**Description**](../../../packages/mcp/src/Key function for initializeoauthsystem operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth-main.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getOAuthSystemManager()](../../../packages/mcp/src/auth/oauth-main.ts#L172)

#### [**Description**](../../../packages/mcp/src/Key function for getoauthsystemmanager operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth-main.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[setupOAuthWithFastify()](../../../packages/mcp/src/auth/oauth-main.ts#L179)

#### [**Description**](../../../packages/mcp/src/Key function for setupoauthwithfastify operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/oauth-main.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[DEFAULT_OAUTH_PROVIDERS()](../../../packages/mcp/src/auth/ui/oauth-login.ts#L379)

#### [**Description**](../../../packages/mcp/src/Key function for default_oauth_providers operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createOAuthLogin()](../../../packages/mcp/src/auth/ui/oauth-login.ts#L403)

#### [**Description**](../../../packages/mcp/src/Key function for createoauthlogin operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[handleOAuthCallback()](../../../packages/mcp/src/auth/ui/oauth-login.ts#L420)

#### [**Description**](../../../packages/mcp/src/Key function for handleoauthcallback operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[defaultAuthConfig()](../../../packages/mcp/src/config/auth-config.ts#L178)

#### [**Description**](../../../packages/mcp/src/Key function for defaultauthconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/auth-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getAuthConfig()](../../../packages/mcp/src/config/auth-config.ts#L241)

#### [**Description**](../../../packages/mcp/src/Key function for getauthconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/auth-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[CONFIG_FILE_NAME()](../../../packages/mcp/src/config/load-config.ts#L5)

#### [**Description**](../../../packages/mcp/src/Key function for config_file_name operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[CONFIG_ROOT()](../../../packages/mcp/src/config/load-config.ts#L8)

#### [**Description**](../../../packages/mcp/src/Key function for config_root operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ConfigSchema()](../../../packages/mcp/src/config/load-config.ts#L58)

#### [**Description**](../../../packages/mcp/src/Key function for configschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[findConfigPath()](../../../packages/mcp/src/config/load-config.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for findconfigpath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolveConfigPath()](../../../packages/mcp/src/config/load-config.ts#L117)

#### [**Description**](../../../packages/mcp/src/Key function for resolveconfigpath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createDefaultConfig()](../../../packages/mcp/src/config/load-config.ts#L143)

#### [**Description**](../../../packages/mcp/src/Key function for createdefaultconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[saveConfigFile()](../../../packages/mcp/src/config/load-config.ts#L150)

#### [**Description**](../../../packages/mcp/src/Key function for saveconfigfile operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadConfigWithSource()](../../../packages/mcp/src/config/load-config.ts#L163)

#### [**Description**](../../../packages/mcp/src/Key function for loadconfigwithsource operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadConfig()](../../../packages/mcp/src/config/load-config.ts#L218)

#### [**Description**](../../../packages/mcp/src/Key function for loadconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadApprovedExecConfig()](../../../packages/mcp/src/config/load-exec-config.ts#L66)

#### [**Description**](../../../packages/mcp/src/Key function for loadapprovedexecconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/load-exec-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[authenticationManager()](../../../packages/mcp/src/core/authentication.ts#L469)

#### [**Description**](../../../packages/mcp/src/Key function for authenticationmanager operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createAuthContext()](../../../packages/mcp/src/core/authentication.ts#L472)

#### [**Description**](../../../packages/mcp/src/Key function for createauthcontext operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[auditLogger()](../../../packages/mcp/src/core/authorization.ts#L416)

#### [**Description**](../../../packages/mcp/src/Key function for auditlogger operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createAuthorizedToolFactory()](../../../packages/mcp/src/core/authorization.ts#L566)

#### [**Description**](../../../packages/mcp/src/Key function for createauthorizedtoolfactory operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[applyAuthorization()](../../../packages/mcp/src/core/authorization.ts#L643)

#### [**Description**](../../../packages/mcp/src/Key function for applyauthorization operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getToolAuthRequirements()](../../../packages/mcp/src/core/authorization.ts#L659)

#### [**Description**](../../../packages/mcp/src/Key function for gettoolauthrequirements operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getToolsByPermissionLevel()](../../../packages/mcp/src/core/authorization.ts#L666)

#### [**Description**](../../../packages/mcp/src/Key function for gettoolsbypermissionlevel operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getDangerousTools()](../../../packages/mcp/src/core/authorization.ts#L675)

#### [**Description**](../../../packages/mcp/src/Key function for getdangeroustools operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getCurrentAuthConfig()](../../../packages/mcp/src/core/authorization.ts#L684)

#### [**Description**](../../../packages/mcp/src/Key function for getcurrentauthconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isStrictModeEnabled()](../../../packages/mcp/src/core/authorization.ts#L691)

#### [**Description**](../../../packages/mcp/src/Key function for isstrictmodeenabled operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isAuthRequiredForDangerous()](../../../packages/mcp/src/core/authorization.ts#L698)

#### [**Description**](../../../packages/mcp/src/Key function for isauthrequiredfordangerous operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isAdminIpWhitelisted()](../../../packages/mcp/src/core/authorization.ts#L705)

#### [**Description**](../../../packages/mcp/src/Key function for isadminipwhitelisted operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateAdminIp()](../../../packages/mcp/src/core/authorization.ts#L713)

#### [**Description**](../../../packages/mcp/src/Key function for validateadminip operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getStrictModeDeniedTools()](../../../packages/mcp/src/core/authorization.ts#L736)

#### [**Description**](../../../packages/mcp/src/Key function for getstrictmodedeniedtools operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getAuthorizationHealth()](../../../packages/mcp/src/core/authorization.ts#L745)

#### [**Description**](../../../packages/mcp/src/Key function for getauthorizationhealth operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authorization.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createMcpServer()](../../../packages/mcp/src/core/mcp-server.ts#L25)

#### [**Description**](../../../packages/mcp/src/Key function for createmcpserver operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/mcp-server.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[toolToActionDefinition()](../../../packages/mcp/src/core/openapi.ts#L112)

#### [**Description**](../../../packages/mcp/src/Key function for tooltoactiondefinition operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/openapi.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createEndpointOpenApiDocument()](../../../packages/mcp/src/core/openapi.ts#L278)

#### [**Description**](../../../packages/mcp/src/Key function for createendpointopenapidocument operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/openapi.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[encodeActionPathSegment()](../../../packages/mcp/src/core/openapi.ts#L311)

#### [**Description**](../../../packages/mcp/src/Key function for encodeactionpathsegment operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/openapi.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isZodValidationError()](../../../packages/mcp/src/core/openapi.ts#L313)

#### [**Description**](../../../packages/mcp/src/Key function for iszodvalidationerror operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/openapi.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[buildRegistry()](../../../packages/mcp/src/core/registry.ts#L4)

#### [**Description**](../../../packages/mcp/src/Key function for buildregistry operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/registry.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolveHttpEndpoints()](../../../packages/mcp/src/core/resolve-config.ts#L24)

#### [**Description**](../../../packages/mcp/src/Key function for resolvehttpendpoints operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/resolve-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolveStdioTools()](../../../packages/mcp/src/core/resolve-config.ts#L68)

#### [**Description**](../../../packages/mcp/src/Key function for resolvestdiotools operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/resolve-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[securityMiddleware()](../../../packages/mcp/src/core/security-middleware.ts#L682)

#### [**Description**](../../../packages/mcp/src/Key function for securitymiddleware operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createSecurityMiddleware()](../../../packages/mcp/src/core/security-middleware.ts#L685)

#### [**Description**](../../../packages/mcp/src/Key function for createsecuritymiddleware operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeToolId()](../../../packages/mcp/src/core/tool-ids.ts#L9)

#### [**Description**](../../../packages/mcp/src/Key function for normalizetoolid operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/tool-ids.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeToolIds()](../../../packages/mcp/src/core/tool-ids.ts#L22)

#### [**Description**](../../../packages/mcp/src/Key function for normalizetoolids operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/tool-ids.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[fastifyTransport()](../../../packages/mcp/src/core/transports/fastify.ts#L596)

#### [**Description**](../../../packages/mcp/src/Key function for fastifytransport operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/transports/fastify.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createSessionIdGenerator()](../../../packages/mcp/src/core/transports/session-id.ts#L39)

#### [**Description**](../../../packages/mcp/src/Key function for createsessionidgenerator operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/transports/session-id.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[stdioTransport()](../../../packages/mcp/src/core/transports/stdio.ts#L4)

#### [**Description**](../../../packages/mcp/src/Key function for stdiotransport operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/transports/stdio.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[getMcpRoot()](../../../packages/mcp/src/files.ts#L7)

#### [**Description**](../../../packages/mcp/src/Key function for getmcproot operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeToRoot()](../../../packages/mcp/src/files.ts#L13)

#### [**Description**](../../../packages/mcp/src/Key function for normalizetoroot operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isInsideRoot()](../../../packages/mcp/src/files.ts#L35)

#### [**Description**](../../../packages/mcp/src/Key function for isinsideroot operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolvePath()](../../../packages/mcp/src/files.ts#L44)

#### [**Description**](../../../packages/mcp/src/Key function for resolvepath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[viewFile()](../../../packages/mcp/src/files.ts#L68)

#### [**Description**](../../../packages/mcp/src/Key function for viewfile operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[listDirectory()](../../../packages/mcp/src/files.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for listdirectory operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[treeDirectory()](../../../packages/mcp/src/files.ts#L163)

#### [**Description**](../../../packages/mcp/src/Key function for treedirectory operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[writeFileContent()](../../../packages/mcp/src/files.ts#L279)

#### [**Description**](../../../packages/mcp/src/Key function for writefilecontent operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[writeFileLines()](../../../packages/mcp/src/files.ts#L303)

#### [**Description**](../../../packages/mcp/src/Key function for writefilelines operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/files.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[defaultDelay()](../../../packages/mcp/src/github/conflicts/github.ts#L95)

#### [**Description**](../../../packages/mcp/src/Key function for defaultdelay operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createRestJsonClient()](../../../packages/mcp/src/github/conflicts/github.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for createrestjsonclient operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createGraphQLClient()](../../../packages/mcp/src/github/conflicts/github.ts#L136)

#### [**Description**](../../../packages/mcp/src/Key function for creategraphqlclient operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createPullRequestFetcher()](../../../packages/mcp/src/github/conflicts/github.ts#L195)

#### [**Description**](../../../packages/mcp/src/Key function for createpullrequestfetcher operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pollPullRequestStatus()](../../../packages/mcp/src/github/conflicts/github.ts#L217)

#### [**Description**](../../../packages/mcp/src/Key function for pollpullrequeststatus operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[updatePullRequestBranch()](../../../packages/mcp/src/github/conflicts/github.ts#L255)

#### [**Description**](../../../packages/mcp/src/Key function for updatepullrequestbranch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[enablePullRequestAutoMerge()](../../../packages/mcp/src/github/conflicts/github.ts#L273)

#### [**Description**](../../../packages/mcp/src/Key function for enablepullrequestautomerge operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[enqueuePullRequest()](../../../packages/mcp/src/github/conflicts/github.ts#L295)

#### [**Description**](../../../packages/mcp/src/Key function for enqueuepullrequest operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/github.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createConflictServer()](../../../packages/mcp/src/github/conflicts/server.ts#L163)

#### [**Description**](../../../packages/mcp/src/Key function for createconflictserver operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/server.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[server()](../../../packages/mcp/src/github/conflicts/server.ts#L185)

#### [**Description**](../../../packages/mcp/src/Key function for server operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/conflicts/server.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createSandbox()](../../../packages/mcp/src/github/sandboxes/git.ts#L162)

#### [**Description**](../../../packages/mcp/src/Key function for createsandbox operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/sandboxes/git.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[listSandboxes()](../../../packages/mcp/src/github/sandboxes/git.ts#L213)

#### [**Description**](../../../packages/mcp/src/Key function for listsandboxes operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/sandboxes/git.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[removeSandbox()](../../../packages/mcp/src/github/sandboxes/git.ts#L245)

#### [**Description**](../../../packages/mcp/src/Key function for removesandbox operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/sandboxes/git.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createSandboxServer()](../../../packages/mcp/src/github/sandboxes/server.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for createsandboxserver operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/github/sandboxes/server.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[renderUiPage()](../../../packages/mcp/src/http/ui-page.ts#L1)

#### [**Description**](../../../packages/mcp/src/Key function for renderuipage operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/http/ui-page.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadHttpTransportConfig()](../../../packages/mcp/src/index.ts#L384)

#### [**Description**](../../../packages/mcp/src/Key function for loadhttptransportconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/index.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[main()](../../../packages/mcp/src/index.ts#L401)

#### [**Description**](../../../packages/mcp/src/Key function for main operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/index.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[parse()](../../../packages/mcp/src/jsedn.d.ts#L2)

#### [**Description**](../../../packages/mcp/src/Key function for parse operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[stringify()](../../../packages/mcp/src/jsedn.d.ts#L3)

#### [**Description**](../../../packages/mcp/src/Key function for stringify operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[toJS()](../../../packages/mcp/src/jsedn.d.ts#L4)

#### [**Description**](../../../packages/mcp/src/Key function for tojs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/jsedn.d.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[left()](../../../packages/mcp/src/ollama/either.ts#L6)

#### [**Description**](../../../packages/mcp/src/Key function for left operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[right()](../../../packages/mcp/src/ollama/either.ts#L7)

#### [**Description**](../../../packages/mcp/src/Key function for right operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isLeft()](../../../packages/mcp/src/ollama/either.ts#L9)

#### [**Description**](../../../packages/mcp/src/Key function for isleft operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isRight()](../../../packages/mcp/src/ollama/either.ts#L11)

#### [**Description**](../../../packages/mcp/src/Key function for isright operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[mapRight()](../../../packages/mcp/src/ollama/either.ts#L14)

#### [**Description**](../../../packages/mcp/src/Key function for mapright operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[mapLeft()](../../../packages/mcp/src/ollama/either.ts#L17)

#### [**Description**](../../../packages/mcp/src/Key function for mapleft operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/either.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[runTask()](../../../packages/mcp/src/ollama/runner.ts#L545)

#### [**Description**](../../../packages/mcp/src/Key function for runtask operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/runner.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[TaskSchema()](../../../packages/mcp/src/ollama/task.ts#L28)

#### [**Description**](../../../packages/mcp/src/Key function for taskschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/task.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[parseTask()](../../../packages/mcp/src/ollama/task.ts#L33)

#### [**Description**](../../../packages/mcp/src/Key function for parsetask operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/ollama/task.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[loadStdioServerSpecs()](../../../packages/mcp/src/proxy/config.ts#L177)

#### [**Description**](../../../packages/mcp/src/Key function for loadstdioserverspecs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createProxy()](../../../packages/mcp/src/proxy/proxy-factory.ts#L26)

#### [**Description**](../../../packages/mcp/src/Key function for createproxy operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/proxy-factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[selectProxyImplementation()](../../../packages/mcp/src/proxy/proxy-factory.ts#L45)

#### [**Description**](../../../packages/mcp/src/Key function for selectproxyimplementation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/proxy-factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createStdioEnv()](../../../packages/mcp/src/proxy/stdio-proxy.ts#L45)

#### [**Description**](../../../packages/mcp/src/Key function for createstdioenv operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/stdio-proxy.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolveCommandPath()](../../../packages/mcp/src/proxy/stdio-proxy.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for resolvecommandpath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/stdio-proxy.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[DEFAULT_SECURITY_CONFIG()](../../../packages/mcp/src/security/middleware.ts#L39)

#### [**Description**](../../../packages/mcp/src/Key function for default_security_config operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createSecurityMiddleware()](../../../packages/mcp/src/security/middleware.ts#L993)

#### [**Description**](../../../packages/mcp/src/Key function for createsecuritymiddleware operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[applyPatchTool()](../../../packages/mcp/src/tools/apply-patch.ts#L133)

#### [**Description**](../../../packages/mcp/src/Key function for applypatchtool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/apply-patch.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createDiscordSendMessageTool()](../../../packages/mcp/src/tools/discord.ts#L176)

#### [**Description**](../../../packages/mcp/src/Key function for creatediscordsendmessagetool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/discord.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[createDiscordListMessagesTool()](../../../packages/mcp/src/tools/discord.ts#L182)

#### [**Description**](../../../packages/mcp/src/Key function for creatediscordlistmessagestool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/discord.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[discordSendMessage()](../../../packages/mcp/src/tools/discord.ts#L188)

#### [**Description**](../../../packages/mcp/src/Key function for discordsendmessage operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/discord.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[discordListMessages()](../../../packages/mcp/src/tools/discord.ts#L189)

#### [**Description**](../../../packages/mcp/src/Key function for discordlistmessages operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/discord.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[discordTools()](../../../packages/mcp/src/tools/discord.ts#L191)

#### [**Description**](../../../packages/mcp/src/Key function for discordtools operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/discord.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[execRunTool()](../../../packages/mcp/src/tools/exec.ts#L225)

#### [**Description**](../../../packages/mcp/src/Key function for execruntool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/exec.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[execListTool()](../../../packages/mcp/src/tools/exec.ts#L278)

#### [**Description**](../../../packages/mcp/src/Key function for execlisttool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/exec.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesListDirectory()](../../../packages/mcp/src/tools/files-tools.ts#L17)

#### [**Description**](../../../packages/mcp/src/Key function for fileslistdirectory operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/files-tools.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesTreeDirectory()](../../../packages/mcp/src/tools/files-tools.ts#L46)

#### [**Description**](../../../packages/mcp/src/Key function for filestreedirectory operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/files-tools.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesViewFile()](../../../packages/mcp/src/tools/files-tools.ts#L81)

#### [**Description**](../../../packages/mcp/src/Key function for filesviewfile operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/files-tools.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesWriteFileContent()](../../../packages/mcp/src/tools/files-tools.ts#L110)

#### [**Description**](../../../packages/mcp/src/Key function for fileswritefilecontent operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/files-tools.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesWriteFileLines()](../../../packages/mcp/src/tools/files-tools.ts#L138)

#### [**Description**](../../../packages/mcp/src/Key function for fileswritefilelines operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/files-tools.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[inputSchema()](../../../packages/mcp/src/tools/github/apply-patch.ts#L350)

#### [**Description**](../../../packages/mcp/src/Key function for inputschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/apply-patch.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubApplyPatchTool()](../../../packages/mcp/src/tools/github/apply-patch.ts#L359)

#### [**Description**](../../../packages/mcp/src/Key function for githubapplypatchtool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/apply-patch.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeGithubPayload()](../../../packages/mcp/src/tools/github/base64.ts#L81)

#### [**Description**](../../../packages/mcp/src/Key function for normalizegithubpayload operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/base64.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[isBase64String()](../../../packages/mcp/src/tools/github/base64.ts#L84)

#### [**Description**](../../../packages/mcp/src/Key function for isbase64string operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/base64.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewOpenPullRequest()](../../../packages/mcp/src/tools/github/code-review.ts#L145)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewopenpullrequest operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewGetComments()](../../../packages/mcp/src/tools/github/code-review.ts#L203)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewgetcomments operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewGetReviewComments()](../../../packages/mcp/src/tools/github/code-review.ts#L296)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewgetreviewcomments operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewSubmitComment()](../../../packages/mcp/src/tools/github/code-review.ts#L408)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewsubmitcomment operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewRequestChangesFromCodex()](../../../packages/mcp/src/tools/github/code-review.ts#L482)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewrequestchangesfromcodex operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewSubmitReview()](../../../packages/mcp/src/tools/github/code-review.ts#L578)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewsubmitreview operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewGetActionStatus()](../../../packages/mcp/src/tools/github/code-review.ts#L655)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewgetactionstatus operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewCommit()](../../../packages/mcp/src/tools/github/code-review.ts#L804)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewcommit operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewPush()](../../../packages/mcp/src/tools/github/code-review.ts#L838)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewpush operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewCheckoutBranch()](../../../packages/mcp/src/tools/github/code-review.ts#L869)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewcheckoutbranch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewCreateBranch()](../../../packages/mcp/src/tools/github/code-review.ts#L892)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewcreatebranch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubReviewRevertCommits()](../../../packages/mcp/src/tools/github/code-review.ts#L918)

#### [**Description**](../../../packages/mcp/src/Key function for githubreviewrevertcommits operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/code-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubContentsWrite()](../../../packages/mcp/src/tools/github/contents.ts#L105)

#### [**Description**](../../../packages/mcp/src/Key function for githubcontentswrite operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/contents.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubGraphqlTool()](../../../packages/mcp/src/tools/github/graphql.ts#L4)

#### [**Description**](../../../packages/mcp/src/Key function for githubgraphqltool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/graphql.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[parseUnifiedPatch()](../../../packages/mcp/src/tools/github/position-resolver.ts#L180)

#### [**Description**](../../../packages/mcp/src/Key function for parseunifiedpatch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/position-resolver.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolveNewLinePosition()](../../../packages/mcp/src/tools/github/position-resolver.ts#L230)

#### [**Description**](../../../packages/mcp/src/Key function for resolvenewlineposition operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/position-resolver.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ResolvePositionResultSchema()](../../../packages/mcp/src/tools/github/position-resolver.ts#L265)

#### [**Description**](../../../packages/mcp/src/Key function for resolvepositionresultschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/position-resolver.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ResolvePositionErrorSchema()](../../../packages/mcp/src/tools/github/position-resolver.ts#L284)

#### [**Description**](../../../packages/mcp/src/Key function for resolvepositionerrorschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/position-resolver.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pullRequestIdentityShape()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L12)

#### [**Description**](../../../packages/mcp/src/Key function for pullrequestidentityshape operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[PullRequestIdentitySchema()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L18)

#### [**Description**](../../../packages/mcp/src/Key function for pullrequestidentityschema operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[DEFAULT_REST_BASE()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L38)

#### [**Description**](../../../packages/mcp/src/Key function for default_rest_base operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[DEFAULT_GRAPHQL_BASE()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L39)

#### [**Description**](../../../packages/mcp/src/Key function for default_graphql_base operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[buildRestHeaders()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L69)

#### [**Description**](../../../packages/mcp/src/Key function for buildrestheaders operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[buildGraphqlHeaders()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L76)

#### [**Description**](../../../packages/mcp/src/Key function for buildgraphqlheaders operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[fetchPullRequestSummary()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L112)

#### [**Description**](../../../packages/mcp/src/Key function for fetchpullrequestsummary operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[fetchPullRequestFiles()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L142)

#### [**Description**](../../../packages/mcp/src/Key function for fetchpullrequestfiles operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[callGithubGraphql()](../../../packages/mcp/src/tools/github/pull-request-api.ts#L173)

#### [**Description**](../../../packages/mcp/src/Key function for callgithubgraphql operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-api.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrGet()](../../../packages/mcp/src/tools/github/pull-request-data.ts#L87)

#### [**Description**](../../../packages/mcp/src/Key function for githubprget operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-data.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrFiles()](../../../packages/mcp/src/tools/github/pull-request-data.ts#L103)

#### [**Description**](../../../packages/mcp/src/Key function for githubprfiles operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-data.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrResolvePosition()](../../../packages/mcp/src/tools/github/pull-request-data.ts#L120)

#### [**Description**](../../../packages/mcp/src/Key function for githubprresolveposition operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-data.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrReviewStart()](../../../packages/mcp/src/tools/github/pull-request-review.ts#L173)

#### [**Description**](../../../packages/mcp/src/Key function for githubprreviewstart operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrReviewCommentInline()](../../../packages/mcp/src/tools/github/pull-request-review.ts#L211)

#### [**Description**](../../../packages/mcp/src/Key function for githubprreviewcommentinline operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubPrReviewSubmit()](../../../packages/mcp/src/tools/github/pull-request-review.ts#L256)

#### [**Description**](../../../packages/mcp/src/Key function for githubprreviewsubmit operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/pull-request-review.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubRateLimitTool()](../../../packages/mcp/src/tools/github/rate-limit.ts#L3)

#### [**Description**](../../../packages/mcp/src/Key function for githubratelimittool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/rate-limit.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubRequestTool()](../../../packages/mcp/src/tools/github/request.ts#L176)

#### [**Description**](../../../packages/mcp/src/Key function for githubrequesttool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/request.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubWorkflowGetRunLogs()](../../../packages/mcp/src/tools/github/workflows.ts#L107)

#### [**Description**](../../../packages/mcp/src/Key function for githubworkflowgetrunlogs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/workflows.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[githubWorkflowGetJobLogs()](../../../packages/mcp/src/tools/github/workflows.ts#L137)

#### [**Description**](../../../packages/mcp/src/Key function for githubworkflowgetjoblogs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/github/workflows.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[help()](../../../packages/mcp/src/tools/help.ts#L16)

#### [**Description**](../../../packages/mcp/src/Key function for help operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/help.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[toolset()](../../../packages/mcp/src/tools/help.ts#L62)

#### [**Description**](../../../packages/mcp/src/Key function for toolset operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/help.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[endpoints()](../../../packages/mcp/src/tools/help.ts#L87)

#### [**Description**](../../../packages/mcp/src/Key function for endpoints operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/help.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[resolvePreset()](../../../packages/mcp/src/tools/nx.ts#L140)

#### [**Description**](../../../packages/mcp/src/Key function for resolvepreset operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/nx.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[buildNxGenerateArgs()](../../../packages/mcp/src/tools/nx.ts#L154)

#### [**Description**](../../../packages/mcp/src/Key function for buildnxgenerateargs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/nx.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[nxGeneratePackage()](../../../packages/mcp/src/tools/nx.ts#L204)

#### [**Description**](../../../packages/mcp/src/Key function for nxgeneratepackage operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/nx.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[__test__()](../../../packages/mcp/src/tools/nx.ts#L207)

#### [**Description**](../../../packages/mcp/src/Key function for __test__ operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/nx.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[__resetOllamaForTests()](../../../packages/mcp/src/tools/ollama.ts#L86)

#### [**Description**](../../../packages/mcp/src/Key function for __resetollamafortests operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaPull()](../../../packages/mcp/src/tools/ollama.ts#L107)

#### [**Description**](../../../packages/mcp/src/Key function for ollamapull operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaListModels()](../../../packages/mcp/src/tools/ollama.ts#L133)

#### [**Description**](../../../packages/mcp/src/Key function for ollamalistmodels operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaListTemplates()](../../../packages/mcp/src/tools/ollama.ts#L142)

#### [**Description**](../../../packages/mcp/src/Key function for ollamalisttemplates operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaCreateTemplate()](../../../packages/mcp/src/tools/ollama.ts#L150)

#### [**Description**](../../../packages/mcp/src/Key function for ollamacreatetemplate operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaEnqueueJobFromTemplate()](../../../packages/mcp/src/tools/ollama.ts#L175)

#### [**Description**](../../../packages/mcp/src/Key function for ollamaenqueuejobfromtemplate operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaStartConversation()](../../../packages/mcp/src/tools/ollama.ts#L209)

#### [**Description**](../../../packages/mcp/src/Key function for ollamastartconversation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaEnqueueGenerateJob()](../../../packages/mcp/src/tools/ollama.ts#L252)

#### [**Description**](../../../packages/mcp/src/Key function for ollamaenqueuegeneratejob operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaEnqueueChatCompletion()](../../../packages/mcp/src/tools/ollama.ts#L287)

#### [**Description**](../../../packages/mcp/src/Key function for ollamaenqueuechatcompletion operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaGetQueue()](../../../packages/mcp/src/tools/ollama.ts#L359)

#### [**Description**](../../../packages/mcp/src/Key function for ollamagetqueue operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ollamaRemoveJob()](../../../packages/mcp/src/tools/ollama.ts#L368)

#### [**Description**](../../../packages/mcp/src/Key function for ollamaremovejob operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/ollama.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeStringList()](../../../packages/mcp/src/tools/pnpm.ts#L115)

#### [**Description**](../../../packages/mcp/src/Key function for normalizestringlist operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[normalizeFilters()](../../../packages/mcp/src/tools/pnpm.ts#L118)

#### [**Description**](../../../packages/mcp/src/Key function for normalizefilters operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[buildPnpmArgs()](../../../packages/mcp/src/tools/pnpm.ts#L124)

#### [**Description**](../../../packages/mcp/src/Key function for buildpnpmargs operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pnpmInstall()](../../../packages/mcp/src/tools/pnpm.ts#L287)

#### [**Description**](../../../packages/mcp/src/Key function for pnpminstall operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pnpmAdd()](../../../packages/mcp/src/tools/pnpm.ts#L288)

#### [**Description**](../../../packages/mcp/src/Key function for pnpmadd operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pnpmRemove()](../../../packages/mcp/src/tools/pnpm.ts#L289)

#### [**Description**](../../../packages/mcp/src/Key function for pnpmremove operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[pnpmRunScript()](../../../packages/mcp/src/tools/pnpm.ts#L290)

#### [**Description**](../../../packages/mcp/src/Key function for pnpmrunscript operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[__test__()](../../../packages/mcp/src/tools/pnpm.ts#L292)

#### [**Description**](../../../packages/mcp/src/Key function for __test__ operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/pnpm.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processGetTaskRunnerConfig()](../../../packages/mcp/src/tools/process-manager.ts#L589)

#### [**Description**](../../../packages/mcp/src/Key function for processgettaskrunnerconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processUpdateTaskRunnerConfig()](../../../packages/mcp/src/tools/process-manager.ts#L599)

#### [**Description**](../../../packages/mcp/src/Key function for processupdatetaskrunnerconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processEnqueueTask()](../../../packages/mcp/src/tools/process-manager.ts#L623)

#### [**Description**](../../../packages/mcp/src/Key function for processenqueuetask operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processStopTask()](../../../packages/mcp/src/tools/process-manager.ts#L650)

#### [**Description**](../../../packages/mcp/src/Key function for processstoptask operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processGetStdout()](../../../packages/mcp/src/tools/process-manager.ts#L690)

#### [**Description**](../../../packages/mcp/src/Key function for processgetstdout operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processGetStderr()](../../../packages/mcp/src/tools/process-manager.ts#L708)

#### [**Description**](../../../packages/mcp/src/Key function for processgetstderr operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[processGetQueue()](../../../packages/mcp/src/tools/process-manager.ts#L726)

#### [**Description**](../../../packages/mcp/src/Key function for processgetqueue operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[__resetProcessManagerForTests()](../../../packages/mcp/src/tools/process-manager.ts#L736)

#### [**Description**](../../../packages/mcp/src/Key function for __resetprocessmanagerfortests operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/process-manager.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[sandboxCreateTool()](../../../packages/mcp/src/tools/sandboxes.ts#L35)

#### [**Description**](../../../packages/mcp/src/Key function for sandboxcreatetool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/sandboxes.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[sandboxListTool()](../../../packages/mcp/src/tools/sandboxes.ts#L53)

#### [**Description**](../../../packages/mcp/src/Key function for sandboxlisttool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/sandboxes.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[sandboxDeleteTool()](../../../packages/mcp/src/tools/sandboxes.ts#L71)

#### [**Description**](../../../packages/mcp/src/Key function for sandboxdeletetool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/sandboxes.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[filesSearch()](../../../packages/mcp/src/tools/search.ts#L50)

#### [**Description**](../../../packages/mcp/src/Key function for filessearch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/search.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddScaffoldTest()](../../../packages/mcp/src/tools/tdd.ts#L74)

#### [**Description**](../../../packages/mcp/src/Key function for tddscaffoldtest operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddChangedFiles()](../../../packages/mcp/src/tools/tdd.ts#L124)

#### [**Description**](../../../packages/mcp/src/Key function for tddchangedfiles operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddRunTests()](../../../packages/mcp/src/tools/tdd.ts#L153)

#### [**Description**](../../../packages/mcp/src/Key function for tddruntests operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddStartWatch()](../../../packages/mcp/src/tools/tdd.ts#L206)

#### [**Description**](../../../packages/mcp/src/Key function for tddstartwatch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddGetWatchChanges()](../../../packages/mcp/src/tools/tdd.ts#L225)

#### [**Description**](../../../packages/mcp/src/Key function for tddgetwatchchanges operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddStopWatch()](../../../packages/mcp/src/tools/tdd.ts#L237)

#### [**Description**](../../../packages/mcp/src/Key function for tddstopwatch operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddCoverage()](../../../packages/mcp/src/tools/tdd.ts#L249)

#### [**Description**](../../../packages/mcp/src/Key function for tddcoverage operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddPropertyCheck()](../../../packages/mcp/src/tools/tdd.ts#L287)

#### [**Description**](../../../packages/mcp/src/Key function for tddpropertycheck operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[tddMutationScore()](../../../packages/mcp/src/tools/tdd.ts#L315)

#### [**Description**](../../../packages/mcp/src/Key function for tddmutationscore operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/tdd.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateConfig()](../../../packages/mcp/src/tools/validate-config.ts#L233)

#### [**Description**](../../../packages/mcp/src/Key function for validateconfig operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/tools/validate-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validatePathSecurity()](../../../packages/mcp/src/validation/comprehensive.ts#L255)

#### [**Description**](../../../packages/mcp/src/Key function for validatepathsecurity operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateSinglePath()](../../../packages/mcp/src/validation/comprehensive.ts#L329)

#### [**Description**](../../../packages/mcp/src/Key function for validatesinglepath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validatePathArrayFull()](../../../packages/mcp/src/validation/comprehensive.ts#L351)

#### [**Description**](../../../packages/mcp/src/Key function for validatepatharrayfull operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateMcpOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L390)

#### [**Description**](../../../packages/mcp/src/Key function for validatemcpoperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateGitHubOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L466)

#### [**Description**](../../../packages/mcp/src/Key function for validategithuboperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validatePnpmOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L536)

#### [**Description**](../../../packages/mcp/src/Key function for validatepnpmoperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateNxOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L620)

#### [**Description**](../../../packages/mcp/src/Key function for validatenxoperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateTddOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L693)

#### [**Description**](../../../packages/mcp/src/Key function for validatetddoperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateSearchOperation()](../../../packages/mcp/src/validation/comprehensive.ts#L793)

#### [**Description**](../../../packages/mcp/src/Key function for validatesearchoperation operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateMcpTool()](../../../packages/mcp/src/validation/comprehensive.ts#L900)

#### [**Description**](../../../packages/mcp/src/Key function for validatemcptool operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateMcpPath()](../../../packages/mcp/src/validation/index.ts#L25)

#### [**Description**](../../../packages/mcp/src/Key function for validatemcppath operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/index.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[validateMcpPathArray()](../../../packages/mcp/src/validation/index.ts#L32)

#### [**Description**](../../../packages/mcp/src/Key function for validatemcppatharray operations.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/index.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuthenticationSystem](../../../packages/mcp/src/auth/factory.ts#L28)

#### [**Description**](../../../packages/mcp/src/Type definition for authenticationsystem.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthLoginConfig](../../../packages/mcp/src/auth/ui/oauth-login.ts#L11)

#### [**Description**](../../../packages/mcp/src/Type definition for oauthloginconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthProvider](../../../packages/mcp/src/auth/ui/oauth-login.ts#L22)

#### [**Description**](../../../packages/mcp/src/Type definition for oauthprovider.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[OAuthLoginState](../../../packages/mcp/src/auth/ui/oauth-login.ts#L35)

#### [**Description**](../../../packages/mcp/src/Type definition for oauthloginstate.#L1)

#### [**File**](../../../packages/mcp/src/`src/auth/ui/oauth-login.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuthConfig](../../../packages/mcp/src/config/auth-config.ts#L8)

#### [**Description**](../../../packages/mcp/src/Type definition for authconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/config/auth-config.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[JwtConfig](../../../packages/mcp/src/core/authentication.ts#L15)

#### [**Description**](../../../packages/mcp/src/Type definition for jwtconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ApiKeyConfig](../../../packages/mcp/src/core/authentication.ts#L23)

#### [**Description**](../../../packages/mcp/src/Type definition for apikeyconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ApiKeyInfo](../../../packages/mcp/src/core/authentication.ts#L30)

#### [**Description**](../../../packages/mcp/src/Type definition for apikeyinfo.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuthResult](../../../packages/mcp/src/core/authentication.ts#L46)

#### [**Description**](../../../packages/mcp/src/Type definition for authresult.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuthContext](../../../packages/mcp/src/core/authentication.ts#L56)

#### [**Description**](../../../packages/mcp/src/Type definition for authcontext.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/authentication.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityConfig](../../../packages/mcp/src/core/security-middleware.ts#L12)

#### [**Description**](../../../packages/mcp/src/Type definition for securityconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityEvent](../../../packages/mcp/src/core/security-middleware.ts#L56)

#### [**Description**](../../../packages/mcp/src/Type definition for securityevent.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityStats](../../../packages/mcp/src/core/security-middleware.ts#L87)

#### [**Description**](../../../packages/mcp/src/Type definition for securitystats.#L1)

#### [**File**](../../../packages/mcp/src/`src/core/security-middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ProxyInstance](../../../packages/mcp/src/proxy/proxy-factory.ts#L7)

#### [**Description**](../../../packages/mcp/src/Type definition for proxyinstance.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/proxy-factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ProxyOptions](../../../packages/mcp/src/proxy/proxy-factory.ts#L18)

#### [**Description**](../../../packages/mcp/src/Type definition for proxyoptions.#L1)

#### [**File**](../../../packages/mcp/src/`src/proxy/proxy-factory.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityConfig](../../../packages/mcp/src/security/middleware.ts#L14)

#### [**Description**](../../../packages/mcp/src/Type definition for securityconfig.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityContext](../../../packages/mcp/src/security/middleware.ts#L59)

#### [**Description**](../../../packages/mcp/src/Type definition for securitycontext.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[SecurityViolation](../../../packages/mcp/src/security/middleware.ts#L70)

#### [**Description**](../../../packages/mcp/src/Type definition for securityviolation.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[AuditLogEntry](../../../packages/mcp/src/security/middleware.ts#L86)

#### [**Description**](../../../packages/mcp/src/Type definition for auditlogentry.#L1)

#### [**File**](../../../packages/mcp/src/`src/security/middleware.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[ValidationResult](../../../packages/mcp/src/validation/comprehensive.ts#L64)

#### [**Description**](../../../packages/mcp/src/Type definition for validationresult.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [**Location**](../../../packages/mcp/src/[PathValidationResult](../../../packages/mcp/src/validation/comprehensive.ts#L70)

#### [**Description**](../../../packages/mcp/src/Type definition for pathvalidationresult.#L1)

#### [**File**](../../../packages/mcp/src/`src/validation/comprehensive.ts`#L1)

#### [Code links saved to](../../../packages/mcp/src//home/err/devel/promethean/tmp/mcp-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*