---
uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
created_at: 2025.08.24.09.41.40.md
filename: Chroma Toolkit Consolidation Plan
description: >-
  Centralizes Chroma client management across services with a single shared
  toolkit, standardizing embedding functions, retention policies, and
  cross-language consistency. Eliminates duplicated clients and ensures
  predictable cleanup.
tags:
  - Chroma
  - client
  - consolidation
  - embedding
  - retention
  - policy
  - cross-language
  - migration
related_to_title:
  - prom-lib-rate-limiters-and-replay-api
  - Dynamic Context Model for Web Components
  - Promethean-native config design
  - Migrate to Provider-Tenant Architecture
  - Prompt_Folder_Bootstrap
  - ecs-scheduler-and-prefabs
  - Sibilant Meta-Prompt DSL
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Model Selection for Lightweight Conversational Tasks
  - Promethean Event Bus MVP v0.1
  - Per-Domain Policy System for JS Crawler
  - aionian-circuit-math
  - ecs-offload-workers
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - Cross-Target Macro System in Sibilant
  - Exception Layer Analysis
  - Cross-Language Runtime Polymorphism
  - archetype-ecs
  - JavaScript
  - eidolon-field-math-foundations
  - Event Bus MVP
  - i3-bluetooth-setup
  - polymorphic-meta-programming-engine
  - Event Bus Projections Architecture
  - Fnord Tracer Protocol
  - js-to-lisp-reverse-compiler
  - Mongo Outbox Implementation
  - Agent Reflections and Prompt Evolution
  - Canonical Org-Babel Matplotlib Animation Template
  - EidolonField
  - field-interaction-equations
  - Voice Access Layer Design
  - Promethean Agent Config DSL
  - polyglot-repl-interface-layer
  - System Scheduler with Resource-Aware DAG
  - sibilant-meta-string-templating-runtime
  - Promethean Infrastructure Setup
related_to_uuid:
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - ab748541-020e-4a7e-b07d-28173bd5bea2
  - 54382370-1931-4a19-a634-46735708a9ea
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - af5d2824-faad-476c-a389-e912d9bc672c
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - 58191024-d04a-4520-8aae-a18be7b94263
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - ba244286-4e84-425b-8bf6-b80c4eb783fc
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
references: []
---

### ✅ Recommended Consolidation Plan

centralize around a **single shared Chroma toolkit**:

1.  **Create `shared/ts/chroma/`**

*   Export one `getChromaClient()` singleton with lazy init.

*   Standardize env config (`CHROMA_URL`, `CHROMA_DB_IMPL`, `CHROMA_PERSIST_DIR`).

*   Provide helpers:

        *   `getOrCreateCollection(name, embeddingFn?, metadata?)`

        *   `listCollections()`

        *   `cleanupCollection(name, policy)`


        → All TS services (`discord-embedder`, `cephalon`, `smartgpt-bridge`) import from here.

        2.  **Unify Embedding Functions**

        *   Consolidate `RemoteEmbeddingFunction` + `embedding/versioning` into this toolkit.

        *   Guarantee every collection has consistent naming (`family__version__driver__fn`).

        3.  **Shared Retention Policy**

        *   Move `chromaCleanup` (currently only in SmartGPT Bridge) into shared.

        *   Support TTL (delete older than X days) + capped size (`LOG_MAX_CHROMA`).

        4.  **Cross-language consistency**

        *   Align `scripts/index_project_files.py` with TS API:

        *   Same env vars.

        *   Same collection family naming.

        *   Option: wrap Python indexer behind a service, so you don’t need direct Chroma Python calls in production.

        5.  **Docs & Migration**

        *   Update `docs/notes` and `docs/file-structure.md` to point to the **single Chroma toolkit**.

        *   Mark local `services/ts/chroma/` as deprecated once everything points to `shared/ts/chroma/`.


* * *

⚡ This gives us:

*   One **source of truth** for Chroma configuration + lifecycle.

*   No more duplicated clients sprinkled across services.

*   Predictable **cleanup & retention** policies.

*   Cleaner service code: `const client = getChromaClient()` everywhere.



Here’s the **Mongo usage inside `services/ts/`**. It’s widespread and parallels what we saw for Chroma:

* * *

### 📦 **services/ts/discord-embedder/**

*   `src/index.ts`:

    ```ts
    import { MongoClient, ObjectId, Collection } from 'mongodb';
    const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
    const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
    await mongoClient.connect();
    const db = mongoClient.db('database');
    ```
    *   Stores Discord messages in **Mongo** alongside embeddings in **Chroma**.


* * *

### 📦 **services/ts/cephalon/**

*   `src/collectionManager.ts`:

    ```ts
    import { Collection, MongoClient, ObjectId } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    const db = mongoClient.db('database');
    const mongoCollection = db.collection<CollectionEntry>(family);
    ```
    *   Implements a **dual persistence layer**:

    *   `chromaCollection.add(...)`

    *   `mongoCollection.insertOne(...)`


* * *

### 📦 **services/ts/kanban-processor/**

*   `src/index.ts`:

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    mongoClient.connect();
    const mongoCollection = mongoClient.db('database').collection(`${agentName}_kanban`);
    ```
    *   Tracks kanban card state in Mongo.


* * *

### 📦 **services/ts/markdown-graph/**

*   `src/index.ts` + `src/graph.ts`:

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = new GraphDB(client, repoPath);
    ```
    *   Backs the **markdown graph database** with Mongo.


* * *

### 📦 **services/ts/smartgpt-bridge/**

*   `src/mongo.js`: central connection logic with `mongoose`.

    ```ts
    import mongoose from 'mongoose';
    export async function initMongo() { ... }
    export async function cleanupMongo() { ... }
    ```
    *   Used in:

    *   `fastifyAuth.js`, `rbac.js` (auth/user models in Mongo).

    *   `utils/DualSink.js`:

        ```ts
        this.mongoModel = mongoose.model(name, schema);
        await this.mongoModel.create(entry);
        ```

        Mirrors everything into **Chroma** as well.

        *   `logging/index.js`: `mongoChromaLogger(app)`.

        *   `routes/v0/sinks.js`: query sinks from Mongo.


* * *<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Promethean-native config design](promethean-native-config-design.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [ecs-offload-workers](ecs-offload-workers.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [Exception Layer Analysis](exception-layer-analysis.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [archetype-ecs](archetype-ecs.md)
- [JavaScript](chunks/javascript.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Event Bus MVP](event-bus-mvp.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [js-to-lisp-reverse-compiler](js-to-lisp-reverse-compiler.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [EidolonField](eidolonfield.md)
- [field-interaction-equations](field-interaction-equations.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [Promethean Agent Config DSL](promethean-agent-config-dsl.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
