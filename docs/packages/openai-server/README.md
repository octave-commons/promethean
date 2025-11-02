```
<!-- SYMPKG:PKG:BEGIN -->
```
# @promethean-os/openai-server
```
**Folder:** `packages/openai-server`
```
```
**Version:** `0.0.0`
```
```
**Domain:** `_root`
```
```mermaid
graph LR
  A["@promethean-os/openai-server"]
  D1["@promethean-os/utils"]
  A --> D1["@promethean-os/utils"]
  click D1 "../utils/README.md" "@promethean-os/utils"
```
## Dependencies
- @promethean-os/utils$../utils/README.md
## Dependents
- _None_
```


## 📁 Implementation

### Core Files

- [43](../../../packages/openai-server/src/43)

### View Source

- [GitHub](https://github.com/promethean-ai/promethean/tree/main/packages/openai-server/src)
- [VS Code](vscode://file/packages/openai-server/src)


## 📚 API Reference

### Interfaces

#### [- **auth/authMiddleware.ts**](../../../packages/openai-server/src/[src/auth/authMiddleware.ts](../../../packages/openai-server/src/auth/authMiddleware.ts) (233 lines)#L1)

#### [- **auth/jwtService.ts**](../../../packages/openai-server/src/[src/auth/jwtService.ts](../../../packages/openai-server/src/auth/jwtService.ts) (155 lines)#L1)

#### [- **auth/rbac.ts**](../../../packages/openai-server/src/[src/auth/rbac.ts](../../../packages/openai-server/src/auth/rbac.ts) (139 lines)#L1)

#### [- **index.ts**](../../../packages/openai-server/src/[src/index.ts](../../../packages/openai-server/src/index.ts) (40 lines)#L1)

#### [- **openai/defaultHandler.ts**](../../../packages/openai-server/src/[src/openai/defaultHandler.ts](../../../packages/openai-server/src/openai/defaultHandler.ts) (73 lines)#L1)

#### [- **openai/ollamaHandler.ts**](../../../packages/openai-server/src/[src/openai/ollamaHandler.ts](../../../packages/openai-server/src/openai/ollamaHandler.ts) (190 lines)#L1)

#### [- **openai/types.ts**](../../../packages/openai-server/src/[src/openai/types.ts](../../../packages/openai-server/src/openai/types.ts) (52 lines)#L1)

#### [- **queue/state.ts**](../../../packages/openai-server/src/[src/queue/state.ts](../../../packages/openai-server/src/queue/state.ts) (205 lines)#L1)

#### [- **queue/taskQueue.ts**](../../../packages/openai-server/src/[src/queue/taskQueue.ts](../../../packages/openai-server/src/queue/taskQueue.ts) (178 lines)#L1)

#### [- **queue/types.ts**](../../../packages/openai-server/src/[src/queue/types.ts](../../../packages/openai-server/src/queue/types.ts) (48 lines)#L1)

#### [- **security/config.ts**](../../../packages/openai-server/src/[src/security/config.ts](../../../packages/openai-server/src/security/config.ts) (122 lines)#L1)

#### [- **security/contentSanitizer.ts**](../../../packages/openai-server/src/[src/security/contentSanitizer.ts](../../../packages/openai-server/src/security/contentSanitizer.ts) (275 lines)#L1)

#### [- **security/inputValidation.ts**](../../../packages/openai-server/src/[src/security/inputValidation.ts](../../../packages/openai-server/src/security/inputValidation.ts) (320 lines)#L1)

#### [- **security/rateLimiting.ts**](../../../packages/openai-server/src/[src/security/rateLimiting.ts](../../../packages/openai-server/src/security/rateLimiting.ts) (268 lines)#L1)

#### [- **security/securityHeaders.ts**](../../../packages/openai-server/src/[src/security/securityHeaders.ts](../../../packages/openai-server/src/security/securityHeaders.ts) (100 lines)#L1)

#### [- **server/chatCompletionRoute.ts**](../../../packages/openai-server/src/[src/server/chatCompletionRoute.ts](../../../packages/openai-server/src/server/chatCompletionRoute.ts) (144 lines)#L1)

#### [- **server/createServer.ts**](../../../packages/openai-server/src/[src/server/createServer.ts](../../../packages/openai-server/src/server/createServer.ts) (245 lines)#L1)

#### [- **server/fastifyTypes.ts**](../../../packages/openai-server/src/[src/server/fastifyTypes.ts](../../../packages/openai-server/src/server/fastifyTypes.ts) (37 lines)#L1)

#### [- **server/queueRoutes.ts**](../../../packages/openai-server/src/[src/server/queueRoutes.ts](../../../packages/openai-server/src/server/queueRoutes.ts) (101 lines)#L1)

#### [- **tests/helpers/test-utils.ts**](../../../packages/openai-server/src/[src/tests/helpers/test-utils.ts](../../../packages/openai-server/src/tests/helpers/test-utils.ts) (178 lines)#L1)

#### [- **tests/ollamaHandler.test.ts**](../../../packages/openai-server/src/[src/tests/ollamaHandler.test.ts](../../../packages/openai-server/src/tests/ollamaHandler.test.ts) (184 lines)#L1)

#### [- **tests/security.test.ts**](../../../packages/openai-server/src/[src/tests/security.test.ts](../../../packages/openai-server/src/tests/security.test.ts) (304 lines)#L1)

#### [- **tests/server.test.ts**](../../../packages/openai-server/src/[src/tests/server.test.ts](../../../packages/openai-server/src/tests/server.test.ts) (136 lines)#L1)

#### [- **tests/taskQueue.test.ts**](../../../packages/openai-server/src/[src/tests/taskQueue.test.ts](../../../packages/openai-server/src/tests/taskQueue.test.ts) (78 lines)#L1)

#### [- **tests/test-types.ts**](../../../packages/openai-server/src/[src/tests/test-types.ts](../../../packages/openai-server/src/tests/test-types.ts) (6 lines)#L1)

#### [- **types/deepReadonly.ts**](../../../packages/openai-server/src/[src/types/deepReadonly.ts](../../../packages/openai-server/src/types/deepReadonly.ts) (14 lines)#L1)

#### [- **types/security.ts**](../../../packages/openai-server/src/[src/types/security.ts](../../../packages/openai-server/src/types/security.ts) (93 lines)#L1)

#### [- **AuthMiddleware**](../../../packages/openai-server/src/[AuthMiddleware](../../../packages/openai-server/src/auth/authMiddleware.ts#L9)

#### [- **JWTService**](../../../packages/openai-server/src/[JWTService](../../../packages/openai-server/src/auth/jwtService.ts#L19)

#### [- **RBAC**](../../../packages/openai-server/src/[RBAC](../../../packages/openai-server/src/auth/rbac.ts#L6)

#### [- **ContentSanitizer**](../../../packages/openai-server/src/[ContentSanitizer](../../../packages/openai-server/src/security/contentSanitizer.ts#L7)

#### [- **InputValidationService**](../../../packages/openai-server/src/[InputValidationService](../../../packages/openai-server/src/security/inputValidation.ts#L49)

#### [- **jwtSign()**](../../../packages/openai-server/src/[jwtSign()](../../../packages/openai-server/src/auth/jwtService.ts#L8)

#### [- **createDefaultChatCompletionHandler()**](../../../packages/openai-server/src/[createDefaultChatCompletionHandler()](../../../packages/openai-server/src/openai/defaultHandler.ts#L38)

#### [- **createOllamaChatCompletionHandler()**](../../../packages/openai-server/src/[createOllamaChatCompletionHandler()](../../../packages/openai-server/src/openai/ollamaHandler.ts#L171)

#### [- **createQueueStateController()**](../../../packages/openai-server/src/[createQueueStateController()](../../../packages/openai-server/src/queue/state.ts#L83)

#### [- **toSnapshot()**](../../../packages/openai-server/src/[toSnapshot()](../../../packages/openai-server/src/queue/state.ts#L109)

#### [- **GitHub**](../../../packages/openai-server/src/[View on GitHub](https#L1)

#### [- **VS Code**](../../../packages/openai-server/src/[Open in VS Code](vscode#L1)

#### [**Location**](../../../packages/openai-server/src/[AuthMiddleware](../../../packages/openai-server/src/auth/authMiddleware.ts#L9)

#### [**Description**](../../../packages/openai-server/src/Main class for authmiddleware functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/auth/authMiddleware.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[JWTService](../../../packages/openai-server/src/auth/jwtService.ts#L19)

#### [**Description**](../../../packages/openai-server/src/Main class for jwtservice functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/auth/jwtService.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[RBAC](../../../packages/openai-server/src/auth/rbac.ts#L6)

#### [**Description**](../../../packages/openai-server/src/Main class for rbac functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/auth/rbac.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[ContentSanitizer](../../../packages/openai-server/src/security/contentSanitizer.ts#L7)

#### [**Description**](../../../packages/openai-server/src/Main class for contentsanitizer functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/contentSanitizer.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[InputValidationService](../../../packages/openai-server/src/security/inputValidation.ts#L49)

#### [**Description**](../../../packages/openai-server/src/Main class for inputvalidationservice functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/inputValidation.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[MemoryStore](../../../packages/openai-server/src/security/rateLimiting.ts#L7)

#### [**Description**](../../../packages/openai-server/src/Main class for memorystore functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/rateLimiting.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[RateLimitingService](../../../packages/openai-server/src/security/rateLimiting.ts#L58)

#### [**Description**](../../../packages/openai-server/src/Main class for ratelimitingservice functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/rateLimiting.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[SecurityHeadersService](../../../packages/openai-server/src/security/securityHeaders.ts#L7)

#### [**Description**](../../../packages/openai-server/src/Main class for securityheadersservice functionality.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/securityHeaders.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[jwtSign()](../../../packages/openai-server/src/auth/jwtService.ts#L8)

#### [**Description**](../../../packages/openai-server/src/Key function for jwtsign operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/auth/jwtService.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createDefaultChatCompletionHandler()](../../../packages/openai-server/src/openai/defaultHandler.ts#L38)

#### [**Description**](../../../packages/openai-server/src/Key function for createdefaultchatcompletionhandler operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/openai/defaultHandler.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createOllamaChatCompletionHandler()](../../../packages/openai-server/src/openai/ollamaHandler.ts#L171)

#### [**Description**](../../../packages/openai-server/src/Key function for createollamachatcompletionhandler operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/openai/ollamaHandler.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createQueueStateController()](../../../packages/openai-server/src/queue/state.ts#L83)

#### [**Description**](../../../packages/openai-server/src/Key function for createqueuestatecontroller operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/state.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[toSnapshot()](../../../packages/openai-server/src/queue/state.ts#L109)

#### [**Description**](../../../packages/openai-server/src/Key function for tosnapshot operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/state.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[enqueueState()](../../../packages/openai-server/src/queue/state.ts#L131)

#### [**Description**](../../../packages/openai-server/src/Key function for enqueuestate operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/state.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[completeState()](../../../packages/openai-server/src/queue/state.ts#L144)

#### [**Description**](../../../packages/openai-server/src/Key function for completestate operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/state.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[startNextState()](../../../packages/openai-server/src/queue/state.ts#L172)

#### [**Description**](../../../packages/openai-server/src/Key function for startnextstate operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/state.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createTaskQueue()](../../../packages/openai-server/src/queue/taskQueue.ts#L150)

#### [**Description**](../../../packages/openai-server/src/Key function for createtaskqueue operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/queue/taskQueue.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createSecurityConfig()](../../../packages/openai-server/src/security/config.ts#L6)

#### [**Description**](../../../packages/openai-server/src/Key function for createsecurityconfig operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/config.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[validateSecurityConfig()](../../../packages/openai-server/src/security/config.ts#L64)

#### [**Description**](../../../packages/openai-server/src/Key function for validatesecurityconfig operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/config.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[getValidatedSecurityConfig()](../../../packages/openai-server/src/security/config.ts#L113)

#### [**Description**](../../../packages/openai-server/src/Key function for getvalidatedsecurityconfig operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/security/config.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[registerChatCompletionRoute()](../../../packages/openai-server/src/server/chatCompletionRoute.ts#L88)

#### [**Description**](../../../packages/openai-server/src/Key function for registerchatcompletionroute operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/server/chatCompletionRoute.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createOpenAICompliantServer()](../../../packages/openai-server/src/server/createServer.ts#L174)

#### [**Description**](../../../packages/openai-server/src/Key function for createopenaicompliantserver operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/server/createServer.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[registerQueueRoutes()](../../../packages/openai-server/src/server/queueRoutes.ts#L83)

#### [**Description**](../../../packages/openai-server/src/Key function for registerqueueroutes operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/server/queueRoutes.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createTestServer()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L32)

#### [**Description**](../../../packages/openai-server/src/Key function for createtestserver operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createAuthenticatedUser()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L47)

#### [**Description**](../../../packages/openai-server/src/Key function for createauthenticateduser operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createTestToken()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L56)

#### [**Description**](../../../packages/openai-server/src/Key function for createtesttoken operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[mockOpenAIResponse()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L69)

#### [**Description**](../../../packages/openai-server/src/Key function for mockopenairesponse operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[createTestServerWithAuth()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L93)

#### [**Description**](../../../packages/openai-server/src/Key function for createtestserverwithauth operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[expectSecurityHeaders()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L114)

#### [**Description**](../../../packages/openai-server/src/Key function for expectsecurityheaders operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[expectRateLimitHeaders()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L145)

#### [**Description**](../../../packages/openai-server/src/Key function for expectratelimitheaders operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[expectCORSHeaders()](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L161)

#### [**Description**](../../../packages/openai-server/src/Key function for expectcorsheaders operations.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[TestUser](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L6)

#### [**Description**](../../../packages/openai-server/src/Type definition for testuser.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[TestServerOptions](../../../packages/openai-server/src/tests/helpers/test-utils.ts#L12)

#### [**Description**](../../../packages/openai-server/src/Type definition for testserveroptions.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/helpers/test-utils.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[TestContext](../../../packages/openai-server/src/tests/test-types.ts#L3)

#### [**Description**](../../../packages/openai-server/src/Type definition for testcontext.#L1)

#### [**File**](../../../packages/openai-server/src/`src/tests/test-types.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[User](../../../packages/openai-server/src/types/security.ts#L5)

#### [**Description**](../../../packages/openai-server/src/Type definition for user.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[JWTPayload](../../../packages/openai-server/src/types/security.ts#L15)

#### [**Description**](../../../packages/openai-server/src/Type definition for jwtpayload.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[AuthTokens](../../../packages/openai-server/src/types/security.ts#L24)

#### [**Description**](../../../packages/openai-server/src/Type definition for authtokens.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[AuthConfig](../../../packages/openai-server/src/types/security.ts#L30)

#### [**Description**](../../../packages/openai-server/src/Type definition for authconfig.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[RateLimitConfig](../../../packages/openai-server/src/types/security.ts#L38)

#### [**Description**](../../../packages/openai-server/src/Type definition for ratelimitconfig.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[SecurityConfig](../../../packages/openai-server/src/types/security.ts#L46)

#### [**Description**](../../../packages/openai-server/src/Type definition for securityconfig.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[SecurityContext](../../../packages/openai-server/src/types/security.ts#L63)

#### [**Description**](../../../packages/openai-server/src/Type definition for securitycontext.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[AuthResult](../../../packages/openai-server/src/types/security.ts#L69)

#### [**Description**](../../../packages/openai-server/src/Type definition for authresult.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[InputValidationResult](../../../packages/openai-server/src/types/security.ts#L76)

#### [**Description**](../../../packages/openai-server/src/Type definition for inputvalidationresult.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [**Location**](../../../packages/openai-server/src/[SecurityHeaders](../../../packages/openai-server/src/types/security.ts#L85)

#### [**Description**](../../../packages/openai-server/src/Type definition for securityheaders.#L1)

#### [**File**](../../../packages/openai-server/src/`src/types/security.ts`#L1)

#### [Code links saved to](../../../packages/openai-server/src//home/err/devel/promethean/tmp/openai-server-code-links.json#L1)



---

*Enhanced with code links via SYMPKG documentation enhancer*