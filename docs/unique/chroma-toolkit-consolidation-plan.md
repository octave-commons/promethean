---
uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
created_at: chroma-toolkit-consolidation-plan.md
filename: chroma-toolkit-consolidation-plan
title: chroma-toolkit-consolidation-plan
description: >-
  This document outlines a plan to centralize Chroma database management across
  multiple services by creating a single shared toolkit. It includes
  standardizing environment configurations, embedding functions, retention
  policies, and ensuring cross-language consistency. The consolidation aims to
  eliminate duplicated clients and improve maintainability through a unified
  source of truth.
tags:
  - chroma
  - consolidation
  - shared-toolkit
  - environment-config
  - embedding-functions
  - retention-policy
  - cross-language
  - service-migration
---

### ✅ Recommended Consolidation Plan

centralize around a **single shared Chroma toolkit**: ^ref-5020e892-4-0

1.  **Create `shared/ts/chroma/`** ^ref-5020e892-6-0

*   Export one `getChromaClient()` singleton with lazy init.

*   Standardize env config (`CHROMA_URL`, `CHROMA_DB_IMPL`, `CHROMA_PERSIST_DIR`). ^ref-5020e892-10-0

*   Provide helpers: ^ref-5020e892-12-0

        *   `getOrCreateCollection(name, embeddingFn?, metadata?)` ^ref-5020e892-14-0

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

⚡ This gives us: ^ref-5020e892-54-0

*   One **source of truth** for Chroma configuration + lifecycle. ^ref-5020e892-56-0

*   No more duplicated clients sprinkled across services. ^ref-5020e892-58-0

*   Predictable **cleanup & retention** policies. ^ref-5020e892-60-0

*   Cleaner service code: `const client = getChromaClient()` everywhere. ^ref-5020e892-62-0



Here’s the **Mongo usage inside `services/ts/`**. It’s widespread and parallels what we saw for Chroma: ^ref-5020e892-66-0

* * *

### 📦 **services/ts/discord-embedder/**

*   `src/index.ts`: ^ref-5020e892-72-0

    ```ts
    import { MongoClient, ObjectId, Collection } from 'mongodb';
    const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
    const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
    await mongoClient.connect();
    const db = mongoClient.db('database');
    ```
^ref-5020e892-74-0 ^ref-5020e892-81-0
    *   Stores Discord messages in **Mongo** alongside embeddings in **Chroma**.


* * *

### 📦 **services/ts/cephalon/**
 ^ref-5020e892-88-0
*   `src/collectionManager.ts`: ^ref-5020e892-89-0
 ^ref-5020e892-90-0
    ```ts
    import { Collection, MongoClient, ObjectId } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    const db = mongoClient.db('database');
    const mongoCollection = db.collection<CollectionEntry>(family);
^ref-5020e892-90-0 ^ref-5020e892-96-0
    ```
    *   Implements a **dual persistence layer**:

    *   `chromaCollection.add(...)`

    *   `mongoCollection.insertOne(...)`


* * *

### 📦 **services/ts/kanban-processor/** ^ref-5020e892-107-0

*   `src/index.ts`: ^ref-5020e892-109-0

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    mongoClient.connect();
^ref-5020e892-109-0 ^ref-5020e892-115-0
    const mongoCollection = mongoClient.db('database').collection(`${agentName}_kanban`);
    ```
    *   Tracks kanban card state in Mongo.


* * *
 ^ref-5020e892-122-0
### 📦 **services/ts/markdown-graph/**
 ^ref-5020e892-124-0
*   `src/index.ts` + `src/graph.ts`:

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const client = new MongoClient(mongoUrl);
^ref-5020e892-124-0 ^ref-5020e892-130-0
    await client.connect();
    const db = new GraphDB(client, repoPath);
    ```
    *   Backs the **markdown graph database** with Mongo.


* * * ^ref-5020e892-137-0

### 📦 **services/ts/smartgpt-bridge/** ^ref-5020e892-139-0

*   `src/mongo.js`: central connection logic with `mongoose`.

    ```ts
^ref-5020e892-139-0 ^ref-5020e892-144-0
    import mongoose from 'mongoose';
    export async function initMongo() { ... } ^ref-5020e892-146-0
    export async function cleanupMongo() { ... }
    ``` ^ref-5020e892-148-0
    *   Used in:

    *   `fastifyAuth.js`, `rbac.js` (auth/user models in Mongo).

    *   `utils/DualSink.js`:

        ```ts ^ref-5020e892-155-0
        this.mongoModel = mongoose.model(name, schema);
        await this.mongoModel.create(entry); ^ref-5020e892-157-0
        ```
 ^ref-5020e892-159-0
        Mirrors everything into **Chroma** as well.

        *   `logging/index.js`: `mongoChromaLogger(app)`. ^ref-5020e892-162-0

        *   `routes/v0/sinks.js`: query sinks from Mongo. ^ref-5020e892-164-0
 ^ref-5020e892-165-0
 ^ref-5020e892-166-0
* * *
