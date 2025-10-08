---
```
uuid: a4e797a2-9636-435f-80d9-1a7e60f6b137
```
```
created_at: '2025-09-04T00:01:08Z'
```
filename: Chroma Toolkit Consolidation Plan
title: Chroma Toolkit Consolidation Plan
```
description: >-
```
  The project is experiencing embedding issues due to potential duplicate
  processing of large files and inefficient client management. A proposed
  solution involves centralizing Chroma configuration and embedding functions
  into a single shared toolkit to eliminate redundant clients and improve
  retention policies.
tags:
  - chroma
  - embedding
  - consolidation
```
related_to_uuid:
```
  - 924837c4-4480-49cd-ab7a-a4375b9cada0
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 5e408692-0e74-400e-a617-84247c7353ad
```
related_to_title:
```
  - Chroma Toolkit Consolidation Plan
  - chroma-toolkit-consolidation-plan
  - i3-bluetooth-setup
references:
  - uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
    line: 162
    col: 0
    score: 0.87
  - uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
    line: 14
    col: 0
    score: 0.86
  - uuid: e2955491-020a-4009-b7ed-a5a348c63cfd
    line: 81
    col: 0
    score: 0.86
---
@promethean/docoops/02-embed seems to hang. I'm not sure what is going on since the Ollama server is definitely receiving requests the entire time.
I don't think there are any documents that are that large. Something suspicious is going on.

It wouldn't hurt to memoize embeddings; there were apparently many identical inputs.

The UI needs...
wait where is that chunks folder even coming from?
I think that..

Could it be trying to embed binary files?
We should make the frontend tell us what file it's on.

we should move away from server sent events
I thought it filtered by extension...

It does... these files are just also being indexed with their front matter and footers Think..

We have to keep the original text around somewhere, limit the number of items in the front matter,
and make sure they aren't included at all during the indexing process


3.5 MB file for this:

```md

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
```
^ref-924837c4-24-0
```
```
^ref-da4b4fd2-24-0
```
    import { MongoClient, ObjectId, Collection } from 'mongodb';
    const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || `mongodb://localhost`;
```
const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
```
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
    const mongoClient = new MongoClientprocess.env.MONGODB_URI || 'mongodb://localhost:27017';
    const db = mongoClient.db('database');
    const mongoCollection = db.collection<CollectionEntry>(family);
```
^ref-5020e892-90-0 ^ref-5020e892-96-0
```
    ```
    *   Implements a **dual persistence layer**:

    *   `chromaCollection.add(...)`

    *   `mongoCollection.insertOne(...)`


* * *

### 📦 **services/ts/kanban-processor/** ^ref-5020e892-107-0

*   `src/index.ts`: ^ref-5020e892-109-0

    ```ts
    import { MongoClient, Collection } from 'mongodb';
    const mongoClient = new MongoClientprocess.env.MONGODB_URI || 'mongodb://localhost:27017';
    mongoClient.connect();
```
^ref-5020e892-109-0 ^ref-5020e892-115-0
```
    const mongoCollection = mongoClient.db('database').collection`{agentName}_kanban`;
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
```
^ref-5020e892-124-0 ^ref-5020e892-130-0
```
    await client.connect();
    const db = new GraphDB(client, repoPath);
    ```
    *   Backs the **markdown graph database** with Mongo.


* * * ^ref-5020e892-137-0

### 📦 **services/ts/smartgpt-bridge/** ^ref-5020e892-139-0

*   `src/mongo.js`: central connection logic with `mongoose`.

    ```ts
```
^ref-5020e892-139-0 ^ref-5020e892-144-0
```
    import mongoose from 'mongoose';
    export async function initMongo() { ... } ^ref-5020e892-146-0
    export async function cleanupMongo() { ... }
    ``` ^ref-5020e892-148-0
    *   Used in:

    *   `fastifyAuth.js`, `rbac.js` (auth/user models in Mongo).

    *   `utils/DualSink.js`:

        ``````
ts ^ref-5020e892-155-0
```
        this.mongoModel = mongoose.model(name, schema);
        await this.mongoModel.create(entry); ^ref-5020e892-157-0
        ```
 ^ref-5020e892-159-0
        Mirrors everything into **Chroma** as well.

        *   `logging/index.js`: `mongoChromaLogger(app)`. ^ref-5020e892-162-0

        *   `routes/v0/sinks.js`: query sinks from Mongo. ^ref-5020e892-164-0
 ^ref-5020e892-165-0
 ^ref-5020e892-166-0
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Chroma Toolkit Consolidation Plan](2025.09.04.00.01.08.md)
- chroma-toolkit-consolidation-plan$chroma-toolkit-consolidation-plan.md
- i3-bluetooth-setup$i3-bluetooth-setup.md
## Sources
- chroma-toolkit-consolidation-plan — L162$chroma-toolkit-consolidation-plan.md#^ref-e2955491-162-0 (line 162, col 0, score 0.87)
- chroma-toolkit-consolidation-plan — L14$chroma-toolkit-consolidation-plan.md#^ref-e2955491-14-0 (line 14, col 0, score 0.86)
- chroma-toolkit-consolidation-plan — L81$chroma-toolkit-consolidation-plan.md#^ref-e2955491-81-0 (line 81, col 0, score 0.86)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
