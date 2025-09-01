---
uuid: 9044701b-03c9-4a30-92c4-46b1bd66c11e
created_at: 2025.08.20.20.08.21.md
filename: file-watcher-auth-fix
description: >-
  Fixed type errors in file-watcher by updating auth-service integration and
  resolving TS2379, TS6192, TS1308, TS2353, and TS2375 issues.
tags:
  - typescript
  - auth-service
  - file-watcher
  - type-errors
  - patch-imports
  - build-ts
related_to_title:
  - plan-update-confirmation
related_to_uuid:
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
references:
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 637
    col: 1
    score: 0.9
---
We just updated the filewatcher to use the new auth-service, and we have some type errors. Please fix them, and confirm they are fixed by running pnpm build.

The directory you are looking for is ./services/ts/file-watcher

Fix the errors in ./services/ts/file-watcher/src

Run make build-ts to confirm they are fixed.

err@err-Stealth-16-AI-Studio-A1VGG:~/devel/promethean/services/ts/file-watcher$ pnpm build

> file-watcher@0.1.0 build /home/err/devel/promethean/services/ts/file-watcher
> tsc && node scripts/patch-imports.js

src/index.ts:44:43 - error TS2379: Argument of type '{ repoRoot: string; bridgeUrl: string; authToken: string | undefined; }' is not assignable to parameter of type 'RepoWatcherOptions' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
  Types of property 'authToken' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.

 44     const repoWatcher = createRepoWatcher({
                                              ~
 45         repoRoot,
    ~~~~~~~~~~~~~~~~~
... 
 47         authToken: authToken || undefined,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 48     });
    ~~~~~

src/repo-watcher.ts:2:1 - error TS6192: All imports in import declaration are unused.

2 import { join, relative } from 'path';
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/repo-watcher.ts:95:44 - error TS1308: 'await' expressions are only allowed within async functions and at the top levels of modules.

95     const { createTokenProviderFromEnv } = await import('./token-client.js');
                                              ~~~~~

  src/repo-watcher.ts:83:17
    83 export function createRepoWatcher({
                       ~~~~~~~~~~~~~~~~~
    Did you mean to mark this function as 'async'?

src/repo-watcher.ts:114:9 - error TS2353: Object literal may only specify known properties, and 'dot' does not exist in type 'WatchOptions'.

114         dot: true,
            ~~~

src/token-client.ts:45:11 - error TS2375: Type '{ authUrl: string; clientId: string; clientSecret: string; scope: string; audience: string | undefined; }' is not assignable to type 'ClientCredsConfig' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
  Types of property 'audience' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.

45     const cfg: ClientCredsConfig = {
             ~~~


Found 5 errors in 3 files.

Errors  Files
     1  src/index.ts:44
     3  src/repo-watcher.ts:2
     1  src/token-client.ts:45
 ELIFECYCLE  Command failed with exit code 2.
err@err-Stealth-16-AI-Studio-A1VGG:~/devel/promethean/services/ts/file-watcher$  w
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [plan-update-confirmation](plan-update-confirmation.md)

## Sources
- [plan-update-confirmation — L637](plan-update-confirmation.md#L637) (line 637, col 1, score 0.9)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
