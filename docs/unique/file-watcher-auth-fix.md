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
related_to_title: []
related_to_uuid: []
references: []
---
We just updated the filewatcher to use the new auth-service, and we have some type errors. Please fix them, and confirm they are fixed by running pnpm build. ^ref-9044701b-1-0

The directory you are looking for is ./services/ts/file-watcher ^ref-9044701b-3-0

Fix the errors in ./services/ts/file-watcher/src ^ref-9044701b-5-0

Run make build-ts to confirm they are fixed. ^ref-9044701b-7-0

err@err-Stealth-16-AI-Studio-A1VGG:~/devel/promethean/services/ts/file-watcher$ pnpm build ^ref-9044701b-9-0

> file-watcher@0.1.0 build /home/err/devel/promethean/services/ts/file-watcher ^ref-9044701b-11-0
> tsc && node scripts/patch-imports.js

src/index.ts:44:43 - error TS2379: Argument of type '{ repoRoot: string; bridgeUrl: string; authToken: string | undefined; }' is not assignable to parameter of type 'RepoWatcherOptions' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties. ^ref-9044701b-14-0
  Types of property 'authToken' are incompatible.
    Type 'string | undefined' is not assignable to type 'string'.
      Type 'undefined' is not assignable to type 'string'.

 44     const repoWatcher = createRepoWatcher({ ^ref-9044701b-19-0
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
^ref-9044701b-32-0
^ref-9044701b-31-0
^ref-9044701b-29-0
^ref-9044701b-32-0
^ref-9044701b-31-0
^ref-9044701b-29-0
^ref-9044701b-32-0
^ref-9044701b-31-0
^ref-9044701b-29-0
^ref-9044701b-32-0
^ref-9044701b-31-0
^ref-9044701b-29-0

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
err@err-Stealth-16-AI-Studio-A1VGG:~/devel/promethean/services/ts/file-watcher$  w<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [plan-update-confirmation](plan-update-confirmation.md)
- [Promethean Documentation Pipeline Overview](promethean-documentation-pipeline-overview.md)
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Promethean Agent DSL TS Scaffold](promethean-agent-dsl-ts-scaffold.md)
- [Promethean Web UI Setup](promethean-web-ui-setup.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Refactor Frontmatter Processing](refactor-frontmatter-processing.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Pure TypeScript Search Microservice](pure-typescript-search-microservice.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [Reawakening Duck](reawakening-duck.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [parenthetical-extraction](parenthetical-extraction.md)
- [Simple Log Example](simple-log-example.md)
- [graph-ds](graph-ds.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [smart-chatgpt-thingy](smart-chatgpt-thingy.md)
- [Shared Package Structure](shared-package-structure.md)
- [Chroma-Embedding-Refactor](chroma-embedding-refactor.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [Pure-Node Crawl Stack with Playwright and Crawlee](pure-node-crawl-stack-with-playwright-and-crawlee.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [promethean-requirements](promethean-requirements.md)
- [refactor-relations](refactor-relations.md)
- [Language-Agnostic Mirror System](language-agnostic-mirror-system.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [infinite_depth_smoke_animation](infinite-depth-smoke-animation.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Promethean Pipelines: Local TypeScript-First Workflow](promethean-pipelines-local-typescript-first-workflow.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Prometheus Observability Stack](prometheus-observability-stack.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Functional Refactor of TypeScript Document Processing](functional-refactor-of-typescript-document-processing.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Model Upgrade Calm-Down Guide](model-upgrade-calm-down-guide.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [RAG UI Panel with Qdrant and PostgREST](rag-ui-panel-with-qdrant-and-postgrest.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [WebSocket Gateway Implementation](websocket-gateway-implementation.md)
- [Promethean Full-Stack Docker Setup](promethean-full-stack-docker-setup.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [TypeScript Patch for Tool Calling Support](typescript-patch-for-tool-calling-support.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [field-interaction-equations](field-interaction-equations.md)
- [set-assignment-in-lisp-ast](set-assignment-in-lisp-ast.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
## Sources
- [plan-update-confirmation — L986](plan-update-confirmation.md#^ref-b22d79c6-986-0) (line 986, col 0, score 0.69)
- [plan-update-confirmation — L637](plan-update-confirmation.md#^ref-b22d79c6-637-0) (line 637, col 0, score 0.9)
- [plan-update-confirmation — L812](plan-update-confirmation.md#^ref-b22d79c6-812-0) (line 812, col 0, score 0.59)
- [plan-update-confirmation — L827](plan-update-confirmation.md#^ref-b22d79c6-827-0) (line 827, col 0, score 0.66)
- [Chroma Toolkit Consolidation Plan — L146](chroma-toolkit-consolidation-plan.md#^ref-5020e892-146-0) (line 146, col 0, score 0.59)
- [plan-update-confirmation — L640](plan-update-confirmation.md#^ref-b22d79c6-640-0) (line 640, col 0, score 0.6)
- [plan-update-confirmation — L760](plan-update-confirmation.md#^ref-b22d79c6-760-0) (line 760, col 0, score 0.63)
- [plan-update-confirmation — L863](plan-update-confirmation.md#^ref-b22d79c6-863-0) (line 863, col 0, score 0.62)
- [Exception Layer Analysis — L11](exception-layer-analysis.md#^ref-21d5cc09-11-0) (line 11, col 0, score 0.58)
- [plan-update-confirmation — L650](plan-update-confirmation.md#^ref-b22d79c6-650-0) (line 650, col 0, score 0.57)
- [plan-update-confirmation — L662](plan-update-confirmation.md#^ref-b22d79c6-662-0) (line 662, col 0, score 0.57)
- [plan-update-confirmation — L674](plan-update-confirmation.md#^ref-b22d79c6-674-0) (line 674, col 0, score 0.57)
- [plan-update-confirmation — L809](plan-update-confirmation.md#^ref-b22d79c6-809-0) (line 809, col 0, score 0.57)
- [WebSocket Gateway Implementation — L52](websocket-gateway-implementation.md#^ref-e811123d-52-0) (line 52, col 0, score 0.61)
- [prom-lib-rate-limiters-and-replay-api — L256](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-256-0) (line 256, col 0, score 0.7)
- [Reawakening Duck — L43](reawakening-duck.md#^ref-59b5670f-43-0) (line 43, col 0, score 0.68)
- [Promethean Infrastructure Setup — L542](promethean-infrastructure-setup.md#^ref-6deed6ac-542-0) (line 542, col 0, score 0.6)
- [Prompt_Folder_Bootstrap — L145](prompt-folder-bootstrap.md#^ref-bd4f0976-145-0) (line 145, col 0, score 0.63)
- [Prompt_Folder_Bootstrap — L171](prompt-folder-bootstrap.md#^ref-bd4f0976-171-0) (line 171, col 0, score 0.63)
- [TypeScript Patch for Tool Calling Support — L104](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-104-0) (line 104, col 0, score 0.61)
- [Local-Only-LLM-Workflow — L130](local-only-llm-workflow.md#^ref-9a8ab57e-130-0) (line 130, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L96](pure-typescript-search-microservice.md#^ref-d17d3a96-96-0) (line 96, col 0, score 0.61)
- [Dynamic Context Model for Web Components — L165](dynamic-context-model-for-web-components.md#^ref-f7702bf8-165-0) (line 165, col 0, score 0.61)
- [universal-intention-code-fabric — L382](universal-intention-code-fabric.md#^ref-c14edce7-382-0) (line 382, col 0, score 0.67)
- [plan-update-confirmation — L680](plan-update-confirmation.md#^ref-b22d79c6-680-0) (line 680, col 0, score 0.65)
- [Promethean-native config design — L90](promethean-native-config-design.md#^ref-ab748541-90-0) (line 90, col 0, score 0.63)
- [Functional Embedding Pipeline Refactor — L26](functional-embedding-pipeline-refactor.md#^ref-a4a25141-26-0) (line 26, col 0, score 0.61)
- [universal-intention-code-fabric — L395](universal-intention-code-fabric.md#^ref-c14edce7-395-0) (line 395, col 0, score 0.69)
- [plan-update-confirmation — L900](plan-update-confirmation.md#^ref-b22d79c6-900-0) (line 900, col 0, score 0.61)
- [Promethean Infrastructure Setup — L287](promethean-infrastructure-setup.md#^ref-6deed6ac-287-0) (line 287, col 0, score 0.72)
- [Promethean Agent DSL TS Scaffold — L716](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-716-0) (line 716, col 0, score 0.59)
- [plan-update-confirmation — L136](plan-update-confirmation.md#^ref-b22d79c6-136-0) (line 136, col 0, score 0.68)
- [shared-package-layout-clarification — L4](shared-package-layout-clarification.md#^ref-36c8882a-4-0) (line 4, col 0, score 0.64)
- [plan-update-confirmation — L152](plan-update-confirmation.md#^ref-b22d79c6-152-0) (line 152, col 0, score 0.64)
- [plan-update-confirmation — L236](plan-update-confirmation.md#^ref-b22d79c6-236-0) (line 236, col 0, score 0.64)
- [universal-intention-code-fabric — L26](universal-intention-code-fabric.md#^ref-c14edce7-26-0) (line 26, col 0, score 0.64)
- [ecs-offload-workers — L7](ecs-offload-workers.md#^ref-6498b9d7-7-0) (line 7, col 0, score 0.61)
- [Agent Tasks: Persistence Migration to DualStore — L84](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-84-0) (line 84, col 0, score 0.61)
- [field-interaction-equations — L132](field-interaction-equations.md#^ref-b09141b7-132-0) (line 132, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L181](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-181-0) (line 181, col 0, score 0.61)
- [TypeScript Patch for Tool Calling Support — L271](typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-271-0) (line 271, col 0, score 0.61)
- [Promethean Documentation Pipeline Overview — L119](promethean-documentation-pipeline-overview.md#^ref-3a3bf2c9-119-0) (line 119, col 0, score 0.73)
- [shared-package-layout-clarification — L145](shared-package-layout-clarification.md#^ref-36c8882a-145-0) (line 145, col 0, score 0.72)
- [Promethean Web UI Setup — L238](promethean-web-ui-setup.md#^ref-bc5172ca-238-0) (line 238, col 0, score 0.7)
- [Pure TypeScript Search Microservice — L73](pure-typescript-search-microservice.md#^ref-d17d3a96-73-0) (line 73, col 0, score 0.69)
- [Promethean Infrastructure Setup — L33](promethean-infrastructure-setup.md#^ref-6deed6ac-33-0) (line 33, col 0, score 0.65)
- [shared-package-layout-clarification — L161](shared-package-layout-clarification.md#^ref-36c8882a-161-0) (line 161, col 0, score 0.65)
- [Promethean Pipelines: Local TypeScript-First Workflow — L253](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-253-0) (line 253, col 0, score 0.62)
- [Promethean Pipelines: Local TypeScript-First Workflow — L3](promethean-pipelines-local-typescript-first-workflow.md#^ref-6b63edca-3-0) (line 3, col 0, score 0.62)
- [Prometheus Observability Stack — L7](prometheus-observability-stack.md#^ref-e90b5a16-7-0) (line 7, col 0, score 0.62)
- [Dynamic Context Model for Web Components — L196](dynamic-context-model-for-web-components.md#^ref-f7702bf8-196-0) (line 196, col 0, score 0.62)
- [Model Upgrade Calm-Down Guide — L60](model-upgrade-calm-down-guide.md#^ref-db74343f-60-0) (line 60, col 0, score 0.62)
- [Prometheus Observability Stack — L500](prometheus-observability-stack.md#^ref-e90b5a16-500-0) (line 500, col 0, score 0.62)
- [Voice Access Layer Design — L302](voice-access-layer-design.md#^ref-543ed9b3-302-0) (line 302, col 0, score 0.61)
- [Promethean Full-Stack Docker Setup — L3](promethean-full-stack-docker-setup.md#^ref-2c2b48ca-3-0) (line 3, col 0, score 0.61)
- [Shared Package Structure — L147](shared-package-structure.md#^ref-66a72fc3-147-0) (line 147, col 0, score 0.61)
- [Pure TypeScript Search Microservice — L112](pure-typescript-search-microservice.md#^ref-d17d3a96-112-0) (line 112, col 0, score 0.65)
- [Promethean Infrastructure Setup — L335](promethean-infrastructure-setup.md#^ref-6deed6ac-335-0) (line 335, col 0, score 0.64)
- [api-gateway-versioning — L79](api-gateway-versioning.md#^ref-0580dcd3-79-0) (line 79, col 0, score 0.63)
- [api-gateway-versioning — L51](api-gateway-versioning.md#^ref-0580dcd3-51-0) (line 51, col 0, score 0.64)
- [Language-Agnostic Mirror System — L471](language-agnostic-mirror-system.md#^ref-d2b3628c-471-0) (line 471, col 0, score 0.64)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L107](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-107-0) (line 107, col 0, score 0.63)
- [shared-package-layout-clarification — L47](shared-package-layout-clarification.md#^ref-36c8882a-47-0) (line 47, col 0, score 0.63)
- [Per-Domain Policy System for JS Crawler — L117](per-domain-policy-system-for-js-crawler.md#^ref-c03020e1-117-0) (line 117, col 0, score 0.63)
- [ecs-offload-workers — L149](ecs-offload-workers.md#^ref-6498b9d7-149-0) (line 149, col 0, score 0.63)
- [plan-update-confirmation — L667](plan-update-confirmation.md#^ref-b22d79c6-667-0) (line 667, col 0, score 0.66)
- [plan-update-confirmation — L655](plan-update-confirmation.md#^ref-b22d79c6-655-0) (line 655, col 0, score 0.66)
- [plan-update-confirmation — L643](plan-update-confirmation.md#^ref-b22d79c6-643-0) (line 643, col 0, score 0.66)
- [plan-update-confirmation — L694](plan-update-confirmation.md#^ref-b22d79c6-694-0) (line 694, col 0, score 0.65)
- [plan-update-confirmation — L767](plan-update-confirmation.md#^ref-b22d79c6-767-0) (line 767, col 0, score 0.66)
- [plan-update-confirmation — L717](plan-update-confirmation.md#^ref-b22d79c6-717-0) (line 717, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L223](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-223-0) (line 223, col 0, score 0.61)
- [Promethean Agent DSL TS Scaffold — L588](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-588-0) (line 588, col 0, score 0.64)
- [plan-update-confirmation — L948](plan-update-confirmation.md#^ref-b22d79c6-948-0) (line 948, col 0, score 0.63)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L489](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-489-0) (line 489, col 0, score 0.61)
- [Voice Access Layer Design — L183](voice-access-layer-design.md#^ref-543ed9b3-183-0) (line 183, col 0, score 0.61)
- [Promethean Agent Config DSL — L19](promethean-agent-config-dsl.md#^ref-2c00ce45-19-0) (line 19, col 0, score 0.62)
- [Stateful Partitions and Rebalancing — L351](stateful-partitions-and-rebalancing.md#^ref-4330e8f0-351-0) (line 351, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L3](migrate-to-provider-tenant-architecture.md#^ref-54382370-3-0) (line 3, col 0, score 0.62)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L412](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-412-0) (line 412, col 0, score 0.62)
- [Promethean Event Bus MVP v0.1 — L188](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-188-0) (line 188, col 0, score 0.62)
- [polymorphic-meta-programming-engine — L99](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-99-0) (line 99, col 0, score 0.62)
- [Model Upgrade Calm-Down Guide — L41](model-upgrade-calm-down-guide.md#^ref-db74343f-41-0) (line 41, col 0, score 0.62)
- [Migrate to Provider-Tenant Architecture — L261](migrate-to-provider-tenant-architecture.md#^ref-54382370-261-0) (line 261, col 0, score 0.62)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.61)
- [Mongo Outbox Implementation — L222](mongo-outbox-implementation.md#^ref-9c1acd1e-222-0) (line 222, col 0, score 0.61)
- [Promethean Event Bus MVP v0.1 — L259](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-259-0) (line 259, col 0, score 0.61)
- [shared-package-layout-clarification — L156](shared-package-layout-clarification.md#^ref-36c8882a-156-0) (line 156, col 0, score 0.7)
- [Shared Package Structure — L148](shared-package-structure.md#^ref-66a72fc3-148-0) (line 148, col 0, score 0.65)
- [Agent Tasks: Persistence Migration to DualStore — L43](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-43-0) (line 43, col 0, score 0.64)
- [shared-package-layout-clarification — L1](shared-package-layout-clarification.md#^ref-36c8882a-1-0) (line 1, col 0, score 0.64)
- [shared-package-layout-clarification — L128](shared-package-layout-clarification.md#^ref-36c8882a-128-0) (line 128, col 0, score 0.63)
- [Canonical Org-Babel Matplotlib Animation Template — L87](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-87-0) (line 87, col 0, score 0.63)
- [Agent Tasks: Persistence Migration to DualStore — L111](agent-tasks-persistence-migration-to-dualstore.md#^ref-93d2ba51-111-0) (line 111, col 0, score 0.62)
- [RAG UI Panel with Qdrant and PostgREST — L131](rag-ui-panel-with-qdrant-and-postgrest.md#^ref-e1056831-131-0) (line 131, col 0, score 0.62)
- [Local-First Intention→Code Loop with Free Models — L100](local-first-intention-code-loop-with-free-models.md#^ref-871490c7-100-0) (line 100, col 0, score 0.62)
- [set-assignment-in-lisp-ast — L56](set-assignment-in-lisp-ast.md#^ref-c5fba0a0-56-0) (line 56, col 0, score 0.61)
- [shared-package-layout-clarification — L155](shared-package-layout-clarification.md#^ref-36c8882a-155-0) (line 155, col 0, score 0.69)
- [graph-ds — L320](graph-ds.md#^ref-6620e2f2-320-0) (line 320, col 0, score 0.66)
- [obsidian-ignore-node-modules-regex — L12](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-12-0) (line 12, col 0, score 0.63)
- [Shared Package Structure — L51](shared-package-structure.md#^ref-66a72fc3-51-0) (line 51, col 0, score 0.62)
- [Functional Refactor of TypeScript Document Processing — L5](functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-5-0) (line 5, col 0, score 0.62)
- [obsidian-ignore-node-modules-regex — L6](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-6-0) (line 6, col 0, score 0.62)
- [obsidian-ignore-node-modules-regex — L42](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-42-0) (line 42, col 0, score 0.61)
- [Chroma-Embedding-Refactor — L111](chroma-embedding-refactor.md#^ref-8b256935-111-0) (line 111, col 0, score 0.61)
- [Chroma Toolkit Consolidation Plan — L124](chroma-toolkit-consolidation-plan.md#^ref-5020e892-124-0) (line 124, col 0, score 0.61)
- [Promethean Infrastructure Setup — L224](promethean-infrastructure-setup.md#^ref-6deed6ac-224-0) (line 224, col 0, score 0.6)
- [Universal Lisp Interface — L61](universal-lisp-interface.md#^ref-b01856b4-61-0) (line 61, col 0, score 0.6)
- [Chroma-Embedding-Refactor — L282](chroma-embedding-refactor.md#^ref-8b256935-282-0) (line 282, col 0, score 0.6)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L345](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-345-0) (line 345, col 0, score 0.68)
- [Promethean Infrastructure Setup — L415](promethean-infrastructure-setup.md#^ref-6deed6ac-415-0) (line 415, col 0, score 0.68)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L7](ollama-llm-provider-for-pseudo-code-transpiler.md#^ref-b362e12e-7-0) (line 7, col 0, score 0.68)
- [State Snapshots API and Transactional Projector — L93](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-93-0) (line 93, col 0, score 0.66)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L194](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-194-0) (line 194, col 0, score 0.66)
- [Promethean Web UI Setup — L351](promethean-web-ui-setup.md#^ref-bc5172ca-351-0) (line 351, col 0, score 0.66)
- [universal-intention-code-fabric — L252](universal-intention-code-fabric.md#^ref-c14edce7-252-0) (line 252, col 0, score 0.66)
- [Chroma-Embedding-Refactor — L66](chroma-embedding-refactor.md#^ref-8b256935-66-0) (line 66, col 0, score 0.66)
- [zero-copy-snapshots-and-workers — L202](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-202-0) (line 202, col 0, score 0.65)
- [Promethean Agent DSL TS Scaffold — L606](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-606-0) (line 606, col 0, score 0.65)
- [prom-lib-rate-limiters-and-replay-api — L226](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-226-0) (line 226, col 0, score 0.65)
- [Pure-Node Crawl Stack with Playwright and Crawlee — L130](pure-node-crawl-stack-with-playwright-and-crawlee.md#^ref-d527c05d-130-0) (line 130, col 0, score 0.65)
- [plan-update-confirmation — L682](plan-update-confirmation.md#^ref-b22d79c6-682-0) (line 682, col 0, score 0.78)
- [Promethean Agent DSL TS Scaffold — L817](promethean-agent-dsl-ts-scaffold.md#^ref-5158f742-817-0) (line 817, col 0, score 0.7)
- [Refactor Frontmatter Processing — L11](refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0) (line 11, col 0, score 0.69)
- [Promethean-Copilot-Intent-Engine — L33](promethean-copilot-intent-engine.md#^ref-ae24a280-33-0) (line 33, col 0, score 0.68)
- [parenthetical-extraction — L3](parenthetical-extraction.md#^ref-51a4e477-3-0) (line 3, col 0, score 0.67)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.67)
- [smart-chatgpt-thingy — L10](smart-chatgpt-thingy.md#^ref-2facccf8-10-0) (line 10, col 0, score 0.66)
- [plan-update-confirmation — L219](plan-update-confirmation.md#^ref-b22d79c6-219-0) (line 219, col 0, score 0.65)
- [plan-update-confirmation — L303](plan-update-confirmation.md#^ref-b22d79c6-303-0) (line 303, col 0, score 0.65)
- [plan-update-confirmation — L623](plan-update-confirmation.md#^ref-b22d79c6-623-0) (line 623, col 0, score 0.64)
- [promethean-requirements — L4](promethean-requirements.md#^ref-95205cd3-4-0) (line 4, col 0, score 0.64)
- [refactor-relations — L10](refactor-relations.md#^ref-41ce0216-10-0) (line 10, col 0, score 0.64)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.63)
- [infinite_depth_smoke_animation — L7](infinite-depth-smoke-animation.md#^ref-92a052a5-7-0) (line 7, col 0, score 0.63)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
